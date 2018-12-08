import { getElementsByXPath, getXPathFromElement } from './element';

const serializeRange = range => {
  const serialized = {
    startXPath: getXPathFromElement(range.startContainer),
    startOffset: range.startOffset,
    endXPath: getXPathFromElement(range.endContainer),
    endOffset: range.endOffset
  };
  return JSON.stringify(serialized);
};

const parseRange = json => {
  const rangeParam = JSON.parse(json);
  const range = document.createRange();
  const startElement = getElementsByXPath(rangeParam.startXPath).iterateNext();
  const endElement = getElementsByXPath(rangeParam.endXPath).iterateNext();
  range.setStart(startElement, rangeParam.startOffset);
  range.setEnd(endElement, rangeParam.endOffset);
  return range;
};

const isRangeEqual = (range1, range2) => {
  return (
    range1.startOffset === range2.startOffset &&
    range1.startContainer === range2.startContainer &&
    range1.endOffset === range2.endOffset &&
    range1.endContainer === range2.endContainer
  );
};

export { serializeRange, parseRange, isRangeEqual };
