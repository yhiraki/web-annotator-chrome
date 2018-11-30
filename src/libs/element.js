import xpath from 'xpath';

function getElementsByXPath(expression, doc = document) {
  const result = document.evaluate(
    expression, // xpathExpression
    doc, // contextNode
    null, // namespaceResolver
    XPathResult.ORDERED_NODE_ITERATOR_TYPE, // resultType
    null // result
  );
  return result;
}

function getXpath(e) {
  if (e.nodeType == e.DOCUMENT_NODE) {
    return '';
  }
  if (e.hasAttribute('id')) {
    return 'id("' + e.getAttribute('id') + '")';
  }
  var p = e.parentNode;
  var t = getXpath(p) + '/' + e.tagName.toLowerCase();
  var c = p.childNodes;
  var g = 0;
  var s;
  for (var i = 0, n = c.length; i < n; ++i) {
    if (c[i].nodeName == e.nodeName && c[i].nodeType == e.nodeType) {
      ++g;
      if (c[i] == e) {
        s = g;
      }
    }
  }
  if (g == 1) {
    return t;
  }
  t += '[' + s + ']';
  return t;
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
  return Boolean(obj && obj.nodeType && obj.nodeType === 1);
}

function decorateTextNode(textNode, attrs, options = {}) {
  const wrapper = document.createDocumentFragment();
  const rawText = textNode.textContent;
  const startOffset = options.startOffset || 0;
  const endOffset = options.endOffset || rawText.length;

  if (startOffset > 0) {
    wrapper.appendChild(document.createTextNode(rawText.slice(0, startOffset)));
  }
  const span = document.createElement('span');
  Object.keys(attrs).forEach(key => {
    span.setAttribute(key, attrs[key]);
  });
  span.appendChild(
    document.createTextNode(rawText.slice(startOffset, endOffset))
  );
  wrapper.appendChild(span);
  if (endOffset < rawText.length) {
    wrapper.appendChild(document.createTextNode(rawText.slice(endOffset)));
  }
  return wrapper;
}

function* elementGen(element) {
  yield element;
  for (const e of element.childNodes) {
    if (e.hasChildNodes()) {
      yield* elementGen(e);
    }
  }
}

function* nodeGen(node) {
  yield node;
  for (const n of node.childNodes) {
    if (n.hasChildNodes()) {
      yield* nodeGen(n);
    } else {
      yield n;
    }
  }
}

function* rangeGen(range) {
  let inRange = false;
  let sc = range.startContainer;
  let ec = range.endContainer;
  let cc = range.commonAncestorContainer;
  if (sc === ec) {
    yield* nodeGen(cc);
    return;
  }
  for (const e of nodeGen(cc)) {
    if (e === sc) {
      inRange = true;
    }
    if (!inRange) {
      continue;
    }
    if (e === ec) {
      yield* nodeGen(e);
      inRange = false;
      break;
    }
    yield e;
  }
}

function decorateRange(range, attrs, options = {}) {
  let doList = [];
  for (const node of rangeGen(range)) {
    if (node.nodeType === Node.TEXT_NODE) {
      doList.push(function(opt) {
        node.parentElement.replaceChild(
          decorateTextNode(node.cloneNode(), attrs, opt),
          node
        );
      });
    }
  }
  for (const [i, d] of doList.entries()) {
    const opt = {};
    if (options.startTextOffset && i === 0) {
      opt.startOffset = options.startTextOffset;
    }
    if (options.endTextOffset && i === doList.length - 1) {
      opt.endOffset = options.endTextOffset;
    }
    d(opt);
  }
  return range;
}

export {
  isElement,
  elementGen,
  nodeGen,
  rangeGen,
  getElementsByXPath,
  getXpath,
  getXPathFromElement,
  decorateTextNode,
  decorateRange
};
