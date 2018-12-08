import store from './store/index';

import { parseRange } from './libs/range';
import { decorateRange } from './libs/element';
import Vue from 'vue';

const classPrefix = 'highlighted';
const userName = 'me';

const highlightRange = (range, userName, id) => {
  let options = {};
  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    options.startTextOffset = range.startOffset;
  }
  if (range.endContainer.nodeType === Node.TEXT_NODE) {
    options.endTextOffset = range.endOffset;
  }
  const uniqueClass = `${classPrefix}-${userName}-${id}`;
  const highlightAttrs = {
    style: 'background-color: rgba(0, 255, 0, 0.2);',
    class: `${classPrefix} ${uniqueClass}`
  };
  const newNodes = decorateRange(range, highlightAttrs, options);
  for (const e of document.getElementsByClassName(
    `${classPrefix}-${userName}-${id}`
  )) {
    e.addEventListener('mouseover', mouseOverHighlight);
  }
};

const focusBatches = [];
const mouseOverHighlight = event => {
  const targetClasses = Array.prototype.filter.call(
    event.srcElement.classList,
    function(s) {
      return s.indexOf(`${classPrefix}-${userName}-`) === 0;
    }
  );
  focusBatches.forEach(function(func) {
    func();
    store.commit('setCurrentHighlight', null);
  });
  focusHighlight(targetClasses);
  focusBatches.push(function() {
    unFocusHighlight(targetClasses);
  });
};

const focusHighlight = targetClass => {
  for (const el of document.getElementsByClassName(targetClass)) {
    el.style.textDecoration = 'underline';
  }
};

const unFocusHighlight = targetClass => {
  for (const el of document.getElementsByClassName(targetClass)) {
    el.style.textDecoration = '';
  }
};

const penDown = () => {
  const selection = window.getSelection();
  if (selection.isCollapsed) {
    console.log('collapsed');
    return;
  }
  const range = selection.getRangeAt(0);
  const text = range.cloneContents().textContent.trim();
  if (text.length == 0) {
    console.log('no text content');
    return;
  }
  const id = store.dispatch('addHighlight', range);
  store.dispatch('saveHighlights');
  highlightRange(range, userName, id);
  selection.empty();
};

const restoreHighlights = () => {
  store.dispatch('loadHighlights').then(result => {
    for (const i of result) {
      const id = i.id;
      const range = parseRange(i.range);
      if (!range.collapsed) {
        highlightRange(range, userName, id);
      }
    }
  });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request == 'enablePen') {
    window.addEventListener('mouseup', penDown);
  }
  if (request == 'disablePen') {
    window.removeEventListener('mouseup', penDown);
  }
});

window.addEventListener('load', restoreHighlights);
window.addEventListener('load', () => {
  let el = document.createElement('div');
  el.setAttribute('id', 'hogeapp');
  el.innerHTML = `
<div style="position: fixed; top:0; right:0; z-index: 100">
  <span>{{currentHighlight.text}}</span>
  <input/><button>add</button>
  <p v-for="note in notes">{note.content}</p>
</textarea></div>
`;
  document.body.appendChild(el);
  new Vue({
    el: '#hogeapp',
    store,
    computed: {
      highlights() {
        return store.getters.allHighlights.map(i => i.id);
      },
      notes() {
        return store.notes.getters.notes(this.currentHighlight);
      }
    }
  });
});

chrome.storage.sync.get('enabled', data => {
  if (data.enabled) {
    window.addEventListener('mouseup', penDown);
  }
});

console.log('load done');
