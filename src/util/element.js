function getElementsByXPath(expression, parentElement) {
  const r = [];
  const x = document.evaluate(
    expression,
    parentElement || document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  for (let i = 0, l = x.snapshotLength; i < l; i++) {
    r.push(x.snapshotItem(i));
  }
  return r;
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
  return obj && obj.nodeType && obj.nodeType === 1;
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
  throw Error();
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

export {
  getElementsByXPath,
  getXPathFromElement,
  setAttributeToTextNodeForRange
};
