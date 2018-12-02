import store from './store/index';

import { parseRange } from './libs/range';
import { decorateRange } from './libs/element';
import Vue from 'vue';

const classPrefix = 'highlighted';
const userName = 'me';

function highlightRange(range, userName, highlightId) {
  const id = highlightId;
  let options = {};
  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    options.startTextOffset = range.startOffset;
  }
  if (range.endContainer.nodeType === Node.TEXT_NODE) {
    options.endTextOffset = range.endOffset;
  }
  const newNodes = decorateRange(
    range,
    {
      style: 'background-color: rgba(0, 255, 0, 0.2);',
      class: `${classPrefix} ${classPrefix}-${userName}-${id}`
    },
    options
  );
  for (const e of document.getElementsByClassName(
    `${classPrefix}-${userName}-${id}`
  )) {
    e.addEventListener('mouseover', mouseOverHighlight);
  }
}

const focusBatches = [];
function mouseOverHighlight(event) {
  const targetClasses = Array.prototype.filter.call(this.classList, function(
    s
  ) {
    return s.indexOf(`${classPrefix}-${userName}-`) === 0;
  });
  focusBatches.forEach(function(func) {
    func();
  });
  focusHighlight(targetClasses);
  focusBatches.push(function() {
    unFocusHighlight(targetClasses);
  });
}

function focusHighlight(targetClasses) {
  Array.prototype.forEach.call(
    document.getElementsByClassName(targetClasses),
    function(e) {
      e.style.textDecoration = 'underline';
    }
  );
}

function unFocusHighlight(targetClasses) {
  Array.prototype.forEach.call(
    document.getElementsByClassName(targetClasses),
    function(e) {
      e.style.textDecoration = '';
    }
  );
}

function penDown() {
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
}

function restoreHighlights() {
  store.dispatch('loadHighlights').then(result => {
    result.forEach(i => {
      const id = i.id;
      const range = parseRange(i.range);
      if (!range.collapsed) {
        highlightRange(range, userName, id);
      }
    });
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request);
  if (request == 'enablePen') {
    window.addEventListener('mouseup', penDown);
  }
  if (request == 'disablePen') {
    window.removeEventListener('mouseup', penDown);
  }
});

window.addEventListener('load', restoreHighlights);
window.addEventListener('load', function() {
  let el = document.createElement('div');
  el.setAttribute('id', 'hogeapp');
  el.innerHTML = `
<div style="position: fixed; top:0; right:0; z-index: 100">
  <span>{{selectedId}}</span>
  <input/><button>add</button>
</textarea></div>
`;
  document.body.appendChild(el);
  new Vue({
    el: '#hogeapp',
    store,
    computed: {
      highlights() {
        return store.getters.allHighlights.map(i => i.id);
      }
    }
  });
});

chrome.storage.sync.get('enabled', function(data) {
  if (data.enabled) {
    window.addEventListener('mouseup', penDown);
  }
});

console.log('load done');
