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

function setStyleToTextNode(node, style, startOffset_, endOffset_) {
  const el = node.parentElement;
  const text = node.cloneNode().data;
  const startOffset = startOffset_ || 0;
  const endOffset = endOffset_ || text.length;
  const styledSpan = document.createElement("span");
  const span = document.createElement("span");
  styledSpan.setAttribute("style", style);
  styledSpan.appendChild(
    document.createTextNode(text.slice(startOffset, endOffset))
  );
  span.appendChild(document.createTextNode(text.slice(0, startOffset)));
  span.appendChild(styledSpan);
  span.appendChild(document.createTextNode(text.slice(endOffset, text.length)));
  console.log(span);
  el.replaceChild(span, node);
}

function setStyleToTextNodeForRange(range, style) {
  const parentNode = getCommonParent(range.startContainer, range.endContainer);
  const textNodes = extractChildTextNodes(parentNode);
  console.log(`style for range: \n${range}`);
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
      console.log(`style for textNode: \n${n}`);
      setStyleToTextNode(n, style, startOffset, endOffset);
    }
  }
  window.getSelection().removeAllRanges();
}

// https://stackoverflow.com/questions/2631820/how-do-i-ensure-saved-click-coordinates-can-be-reloaed-to-the-same-place-even-i/2631931#2631931
function getPathFromElement(element) {
  if (element.id !== "") return 'id("' + element.id + '")';
  if (element === document.body) return element.tagName;

  let ix = 0;
  const siblings = element.parentNode.childNodes;
  for (let i = 0; i < siblings.length; i++) {
    let sibling = siblings[i];
    if (sibling === element)
      return (
        getPathFromElement(element.parentNode) +
        "/" +
        element.tagName +
        "[" +
        (ix + 1) +
        "]"
      );
    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
  }
}

function serializeRange(range) {
  const startElement = range.startContainer.parentElement;
  const startXPath = "//" + getPathFromElement(startElement);
  const endElement = range.endContainer.parentElement;
  const endXPath = "//" + getPathFromElement(endElement);
  const serialized = {
    startXPath: startXPath,
    startOffset: range.startOffset,
    endXPath: endXPath,
    endOffset: range.endOffset
  };
  return JSON.stringify(serialized);
}

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

function getRangeFromJson(json) {
  const rangeParam = JSON.parse(json);
  const range = document.createRange();
  range.setStart(
    getElementsByXPath(rangeParam.startXPath)[0].childNodes[0],
    rangeParam.startOffset
  );
  range.setEnd(
    getElementsByXPath(rangeParam.endXPath)[0].childNodes[0],
    rangeParam.endOffset
  );
  return range;
}

function highlihgtRange() {
  const selection = window.getSelection();
  if (selection.isCollapsed) {
    return;
  }
  const range = selection.getRangeAt(0);
  console.log(`range selected: \n${range}`);
  setStyleToTextNodeForRange(range, "background-color: yellow");
}

// window.addEventListener("mouseup", highlihgtRange);
