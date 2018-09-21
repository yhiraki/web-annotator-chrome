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

function setStyleToNodes(node, style) {
  var container = document.createElement(node.tagName || "div");
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
  node = setStyleToNodes(range.cloneContents(), "background-color: yellow");
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
