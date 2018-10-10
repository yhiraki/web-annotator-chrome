import { getElementsByXPath, getXPathFromElement } from './element';

function serializeRange(range) {
  const serialized = {
    startXPath: getXPathFromElement(range.startContainer),
    startOffset: range.startOffset,
    endXPath: getXPathFromElement(range.endContainer),
    endOffset: range.endOffset
  };
  console.log(range);
  console.log(serialized);
  return JSON.stringify(serialized);
}

function parseRange(json) {
  const rangeParam = JSON.parse(json);
  const range = document.createRange();
  range.setStart(
    getElementsByXPath(rangeParam.startXPath)[0],
    rangeParam.startOffset
  );
  range.setEnd(
    getElementsByXPath(rangeParam.endXPath)[0],
    rangeParam.endOffset
  );
  return range;
}

function isRangeEqual(range1, range2) {
  return (
    range1.startOffset === range2.startOffset &&
    range1.startContainer === range2.startContainer &&
    range1.endOffset === range2.endOffset &&
    range1.endContainer === range2.endContainer
  );
}

export { serializeRange, parseRange, isRangeEqual };
