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
  const startElements = getElementsByXPath(rangeParam.startXPath);
  const endElements = getElementsByXPath(rangeParam.endXPath);
  if (startElements.length < 1 && endElements.length < 1) {
    return range;
  }
  range.setStart(startElements[0], rangeParam.startOffset);
  range.setEnd(endElements[0], rangeParam.endOffset);
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
