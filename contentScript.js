const storage = localStorage;
const storageKey = "highlighter";

function storageSet(value) {
  const url = window.location.href;
  const data = storageGet();
  let d = data[url];
  d.ranges.push(value);
  d.ranges = d.ranges.filter((x, i, self) => self.indexOf(x) === i);
  storage.setItem(storageKey, JSON.stringify(data));
}

function storageGet() {
  const url = window.location.href;
  let data = storage.getItem(storageKey) || "{}";
  data = JSON.parse(data);
  if (!data[url]) data[url] = { ranges: [] };
  return data;
}

function isRangeEqual(range1, range2) {
  return (
    range1.startOffset === range2.startOffset &&
    range1.startContainer === range2.startContainer &&
    range1.endOffset === range2.endOffset &&
    range1.endContainer === range2.endContainer
  );
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
  const wrapper = document.createElement("span");
  const fragment = document.createDocumentFragment();
  for (k in attrs) {
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
  console.log(fragment);
  el.replaceChild(fragment, node);
}

function setAttributeToTextNodeForRange(range, attrs) {
  const parentNode = getCommonParent(range.startContainer, range.endContainer);
  const textNodes = extractChildTextNodes(parentNode);
  console.log(`add attrs for range: \n${range}`);
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
      console.log(`add attrs for textNode: \n${n}`);
      setAttributeToTextNode(n, attrs, startOffset, endOffset);
    }
  }
  window.getSelection().removeAllRanges();
}

// https://stackoverflow.com/questions/2631820/how-do-i-ensure-saved-click-coordinates-can-be-reloaed-to-the-same-place-even-i/2631931#2631931
function getPathFromElement(element) {
  if (element.id !== "") return 'id("' + element.id + '")';
  if (element === document.body) return "/HTML/" + element.tagName;

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
  const startXPath = getPathFromElement(startElement);
  const endElement = range.endContainer.parentElement;
  const endXPath = getPathFromElement(endElement);
  const serialized = {
    startXPath: startXPath,
    startOffset: range.startOffset,
    endXPath: endXPath,
    endOffset: range.endOffset
  };
  console.log(range);
  console.log(serialized);
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

function highlihgtRange(range_) {
  let range;
  if (range_.startContainer && range_.endContainer) {
    range = range_;
  } else {
    const selection = window.getSelection();
    if (selection.isCollapsed) {
      return;
    }
    range = selection.getRangeAt(0);
  }
  const serialized = serializeRange(range);
  const contents = range.cloneContents();
  if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
    if (
      Array.from(
        range.commonAncestorContainer.parentElement.classList
      ).includes("highlighted")
    ) {
      console.log(`already highlighted`);
      return;
    }
  } else if (contents.querySelectorAll(".highlighted").length > 0) {
    console.log(`already highlighted`);
    return;
  }
  console.log(`range selected: \n${range}`);
  setAttributeToTextNodeForRange(range, {
    style: "background-color: yellow",
    class: "highlighted"
  });
  storageSet(serialized);
}

function restoreHighlights() {
  const data = storageGet()[window.location.href];
  for (json of data.ranges) {
    const range = getRangeFromJson(json);
    highlihgtRange(range);
  }
}

function togglePenEnableFactory() {
  let penEnabled = false;
  return function togglePenEnable() {
    if (penEnabled) {
      window.removeEventListener("mouseup", highlihgtRange);
      penEnabled = false;
    } else {
      window.addEventListener("mouseup", highlihgtRange);
      penEnabled = true;
    }
  };
}

const togglePenEnable = togglePenEnableFactory();
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request == "togglePen") {
    togglePenEnable();
  }
});

window.addEventListener("load", restoreHighlights);
