import xpath from 'xpath';

function getElementsByXPath(expression, parentElement) {
  return xpath.select(expression, parentElement);
}

function getXpath(e) {
  if (e.nodeType == e.DOCUMENT_NODE) {
    return '';
  }
  if (e.hasAttribute('id')) {
    return 'id("' + e.getAttribute('id') + '")';
  }
  var p = e.parentNode;
  var t = getXpath(p) + '/' + e.tagName.toLowerCase();
  var c = p.childNodes;
  var g = 0;
  var s;
  for (var i = 0, n = c.length; i < n; ++i) {
    if (c[i].nodeName == e.nodeName && c[i].nodeType == e.nodeType) {
      ++g;
      if (c[i] == e) {
        s = g;
      }
    }
  }
  if (g == 1) {
    return t;
  }
  t += '[' + s + ']';
  return t;
}

// https://stackoverflow.com/questions/2631820/how-do-i-ensure-saved-click-coordinates-can-be-reloaed-to-the-same-place-even-i/2631931#2631931
function getXPathFromElement(element) {
  if (element.id && element.id !== '') return 'id("' + element.id + '")';
  if (element === document.body) return '/HTML/' + element.tagName;

  const nodeIdx = {};
  const siblings = element.parentNode.childNodes;
  for (let i = 0; i < siblings.length; i++) {
    let sibling = siblings[i];
    nodeIdx[sibling.nodeType] = nodeIdx[sibling.nodeType] || 1;
    if (sibling === element) {
      const idxString = '[' + nodeIdx[element.nodeType] + ']';
      let path = '';
      switch (element.nodeType) {
        case Node.ELEMENT_NODE:
          path = '/' + element.tagName + idxString;
          break;
        case Node.TEXT_NODE:
          path = '/text()' + idxString;
          break;
      }
      return getXPathFromElement(element.parentNode) + path;
    }
    if (sibling.tagName === element.tagName) nodeIdx[sibling.nodeType]++;
  }
}

function isElement(obj) {
  return Boolean(obj && obj.nodeType && obj.nodeType === 1);
}

function searchCommonParentUp(targetNode, currentNode) {
  if (!isElement(currentNode)) {
    currentNode = currentNode.parentElement;
  }
  if (currentNode.contains(targetNode)) {
    return currentNode;
  } else {
    return searchCommonParentUp(targetNode, currentNode.parentElement);
  }
  throw new Error();
}

function getCommonParent(node1, node2) {
  const result = searchCommonParentUp(node1, node2);
  if (result === document.body) {
    return searchCommonParentUp(node2, node1);
  } else {
    return result;
  }
}

function extractChildTextNodes(node) {
  return Array.prototype.map
    .call(node.childNodes, function(n) {
      if (n.nodeType === Node.TEXT_NODE && n.data.trim().length > 0) {
        return n;
      } else if (n.childNodes) {
        return extractChildTextNodes(n);
      }
    })
    .flat();
}

function setAttributeToTextNode(node, attrs, startOffset_, endOffset_) {
  const el = node.parentElement;
  const text = node.cloneNode().data;
  const startOffset = startOffset_ || 0;
  const endOffset = endOffset_ || text.length;
  const wrapper = document.createElement('span');
  const fragment = document.createDocumentFragment();
  for (let k in attrs) {
    wrapper.setAttribute(k, attrs[k]);
  }
  wrapper.appendChild(
    document.createTextNode(text.slice(startOffset, endOffset))
  );
  fragment.appendChild(document.createTextNode(text.slice(0, startOffset)));
  fragment.appendChild(wrapper);
  fragment.appendChild(
    document.createTextNode(text.slice(endOffset, text.length))
  );
  el.replaceChild(fragment, node);
}

function setAttributeToTextNodeForRange(range, attrs) {
  const parentNode = getCommonParent(range.startContainer, range.endContainer);
  const textNodes = extractChildTextNodes(parentNode);
  for (let i in textNodes) {
    const n = textNodes[i];
    let startOffset = null;
    let endOffset = null;
    if (n === range.startContainer) {
      startOffset = range.startOffset;
    }
    if (n === range.endContainer) {
      endOffset = range.endOffset;
    }
    if (range.intersectsNode(n)) {
      setAttributeToTextNode(n, attrs, startOffset, endOffset);
    }
  }
  window.getSelection().removeAllRanges();
}

function decorateTextNode(textNode, attrs, options = {}) {
  const wrapper = document.createDocumentFragment();
  const rawText = textNode.textContent;

  options.startOffset = options.startOffset || 0;
  options.endOffset = options.endOffset || rawText.length;
  if (options.startOffset > 0) {
    wrapper.appendChild(
      document.createTextNode(rawText.slice(0, options.startOffset))
    );
  }
  const span = document.createElement('span');
  Object.keys(attrs).forEach(key => {
    span.setAttribute(key, attrs[key]);
  });
  span.appendChild(
    document.createTextNode(
      rawText.slice(options.startOffset, options.endOffset)
    )
  );
  wrapper.appendChild(span);
  if (options.endOffset < rawText.length) {
    wrapper.appendChild(
      document.createTextNode(rawText.slice(options.endOffset))
    );
  }
  return wrapper;
}

function decorateElementTextNode(element, attrs, options) {}

export {
  isElement,
  getElementsByXPath,
  getXpath,
  getXPathFromElement,
  setAttributeToTextNodeForRange,
  decorateTextNode,
  decorateElementTextNode
};
