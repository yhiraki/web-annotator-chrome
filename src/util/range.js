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

export { serializeRange, parseRange };
