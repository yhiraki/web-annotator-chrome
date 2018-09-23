// //実用には、以下のスクリプトをEventListenerに登録して、何かしらのイベント時に動くようにする必要がある。
// // 選択範囲の背景を青くする
function blinkBlue() {
  var sel = window.getSelection();
  if (!sel.rangeCount) return; //範囲選択されている箇所がない場合は何もせず終了

  var range = sel.getRangeAt(0);
  var newNode = document.createElement("div");
  newNode.setAttribute("style", "background-color: yellow;"); //範囲選択箇所の背景を青にする
  newNode.innerHTML = sel.toString();
  range.deleteContents(); // 範囲選択箇所を一旦削除
  range.insertNode(newNode); // 範囲選択箇所の先頭から、修飾したspanを挿入
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
  var result = searchCommonParentUp(node1, node2);
  if (result === document.body) {
    return searchCommonParentUp(node2, node1);
  } else {
    return result;
  }
}

function getCommonParentElementByRange(range) {
  return getCommonParent(range.startContainer, range.endContainer);
}

function setStyleToNodes(node, style) {
  var container = node.tagName
    ? document.createElement(node.tagName)
    : document.createDocumentFragment();
  node.childNodes.forEach(function(child) {
    if (child.nodeType === Node.TEXT_NODE) {
      var span = setStyleToTextNode(child, style);
      container.appendChild(span);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      container.appendChild(setStyleToNodes(child, style));
    }
  });
  return container;
}

function setStyleToTextNode(node, style) {
  if (node.nodeType !== Node.TEXT_NODE) {
    throw new TypeError("Node must be TEXT_NODE");
  }
  var span = document.createElement("span");
  span.setAttribute("style", style);
  span.appendChild(node.cloneNode());
  return span;
}

function underlineRange(range) {
  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    var startRange = document.createRange();
    startRange.setStart(range.startContainer, range.startOffset);
    startRange.setEnd(range.startContainer, range.startContainer.length);
    var startNode = setStyleToNodes(
      startRange.cloneContents(),
      "background-color: yellow"
    );
    startRange.deleteContents();
    startRange.insertNode(startNode);
    range.setStart(range.startContainer.parentElement.nextElementSibling, 0);
  }
  if (range.endContainer.nodeType === Node.TEXT_NODE) {
    var endRange = document.createRange();
    endRange.setStart(range.endContainer, 0);
    endRange.setEnd(range.endContainer, range.endOffset);
    var endNode = setStyleToNodes(
      endRange.cloneContents(),
      "background-color: yellow"
    );
    endRange.deleteContents();
    endRange.insertNode(endNode);
    range.setEnd(range.endContainer.parentElement, 0);
  }
  var node = setStyleToNodes(range.cloneContents(), "background-color: yellow");
  range.deleteContents();
  range.insertNode(node);
  return node;
}

// //実用にはEventListenerに登録して、何かしらのイベント時に動くようにする必要がある。
// //以下では、仮に何かしらのキーが押された時に動くようにした。
// window.addEventListener("mouseup", blinkBlue);

// https://stackoverflow.com/questions/2631820/how-do-i-ensure-saved-click-coordinates-can-be-reloaed-to-the-same-place-even-i/2631931#2631931
function getPathFromElement(element) {
  if (element.id !== "") return 'id("' + element.id + '")';
  if (element === document.body) return element.tagName;

  var ix = 0;
  var siblings = element.parentNode.childNodes;
  for (var i = 0; i < siblings.length; i++) {
    var sibling = siblings[i];
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
  var startElement = range.startContainer.parentElement;
  var startXPath = "//" + getPathFromElement(startElement);
  var endElement = range.endContainer.parentElement;
  var endXPath = "//" + getPathFromElement(endElement);
  var serialized = {
    startXPath: startXPath,
    startOffset: range.startOffset,
    endXPath: endXPath,
    endOffset: range.endOffset
  };
  console.log(serialized);
  return JSON.stringify(serialized);
}

function getElementsByXPath(expression, parentElement) {
  var r = [];
  var x = document.evaluate(
    expression,
    parentElement || document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  for (var i = 0, l = x.snapshotLength; i < l; i++) {
    r.push(x.snapshotItem(i));
  }
  return r;
}

function getRangeFromJson(jsonText) {
  var rangeParam = JSON.parse(jsonText);
  var range = document.createRange();
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
  var range = window.getSelection().getRangeAt(0);
}

document.body.addEventListener("mouseup", highlihgtRange);

console.log("hogehoge");
