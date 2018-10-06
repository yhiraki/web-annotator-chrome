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

export { getElementsByXPath, getXPathFromElement };
