import store from './store/index';
import { parseRange } from './util/range';
import { setAttributeToTextNodeForRange } from './util/element';

function isHighlighted(range) {
  const contents = range.cloneContents();
  if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
    if (
      Array.from(
        range.commonAncestorContainer.parentElement.classList
      ).includes('highlighted')
    ) {
      return true;
    }
  } else if (contents.querySelectorAll('.highlighted').length > 0) {
    return true;
  }
  return false;
}

function highlihgtRange(range) {
  console.log(range);
  setAttributeToTextNodeForRange(range, {
    style: 'background-color: yellow',
    class: 'highlighted'
  });
}

function penDown() {
  const selection = window.getSelection();
  if (selection.isCollapsed) {
    console.log('collapsed');
    return;
  }
  const range = selection.getRangeAt(0);
  if (isHighlighted(range)) {
    console.log('already highlighted');
    return;
  }
  const text = range.cloneContents().textContent.trim();
  if (text.length == 0) {
    console.log('no text content');
    return;
  }
  store.dispatch('addHighlight', range);
  store.dispatch('saveHighlights');
  highlihgtRange(range);
}

function restoreHighlights() {
  store.dispatch('loadHighlights').then(result => {
    console.log(result);
    result.forEach(i => {
      const range = parseRange(i.range);
      if (!range.collapsed) {
        highlihgtRange(range);
      }
    });
  });
}

function togglePenEnableFactory() {
  let penEnabled = false;
  return function togglePenEnable() {
    if (penEnabled) {
      window.removeEventListener('mouseup', penDown);
      penEnabled = false;
    } else {
      window.addEventListener('mouseup', penDown);
      penEnabled = true;
    }
  };
}

const togglePenEnable = togglePenEnableFactory();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request == 'togglePen') {
    togglePenEnable();
  }
});

window.addEventListener('load', restoreHighlights);

console.log('load done');
