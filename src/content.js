import store from './store/index';

import { parseRange } from './libs/range';
import { decorateRange } from './libs/element';
import Vue from 'vue';

function highlihgtRange(range, hash = '') {
  hash = hash || Math.floor(Math.random() * 10 ** 10);
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
      class: `highlighted hash-${hash}`
    },
    options
  );
  for (const e of document.getElementsByClassName(`hash-${hash}`)) {
    e.addEventListener('mouseover', mouseOverHighlight);
    e.addEventListener('mouseout', mouseOutHighlight);
  }
}

function mouseOverHighlight(event) {
  const hashClasses = Array.prototype.filter.call(this.classList, function(s) {
    return s.indexOf('hash') === 0;
  });
  focusHighlight(hashClasses);
}

function mouseOutHighlight(event) {
  const hashClasses = Array.prototype.filter.call(this.classList, function(s) {
    return s.indexOf('hash') === 0;
  });
  unFocusHighlight(hashClasses);
}

function focusHighlight(hashClass) {
  Array.prototype.forEach.call(
    document.getElementsByClassName(hashClass),
    function(e) {
      e.style.textDecoration = 'underline';
    }
  );
}

function unFocusHighlight(hashClass) {
  Array.prototype.forEach.call(
    document.getElementsByClassName(hashClass),
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
  store.dispatch('addHighlight', range);
  store.dispatch('saveHighlights');
  highlihgtRange(range);
  selection.empty();
}

function restoreHighlights() {
  store.dispatch('loadHighlights').then(result => {
    result.forEach(i => {
      const range = parseRange(i.range);
      if (!range.collapsed) {
        highlihgtRange(range);
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
  document.createElement('style');
});
window.addEventListener('load', function() {
  let el = document.createElement('div');
  el.setAttribute('id', 'hogeapp');
  el.innerHTML = ' <input v-model="a"> {{a}} <br/> {{highlights}}';
  document.body.appendChild(el);
  new Vue({
    el: '#hogeapp',
    store,
    data: { a: 'hoge' },
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
