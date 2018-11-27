const elementjs = require('../element');

describe('Test isElement', () => {
  const isElement = elementjs.isElement;

  test('ElementNode is Element', () => {
    expect(isElement(document.createElement('a'))).toBe(true);
  });

  test('TextNode is not Element', () => {
    expect(isElement(document.createTextNode('a'))).toBe(false);
  });

  test('Not Node is not Element', () => {
    expect(isElement('hoge')).toBe(false);
  });
});

const dom = require('xmldom').DOMParser;

describe('get xpath and get elements by xpath', () => {
  const getElementsByXPath = elementjs.getElementsByXPath;
  const getXpath = elementjs.getXpath;
  let doc;

  beforeEach(() => {
    doc = new dom().parseFromString(`\
<div>
  <span>Adipiscing elit pellentesque habitant morbi tristique senectus et netus et. Tortor, at auctor urna nunc id cursus metus aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices sagittis orci, a!</span>
  <button id="button" />
</div>
`);
  });

  describe('element <span> which has no attribute', () => {
    test('get element', () => {
      const el = doc.getElementsByTagName('span')[0];
      expect(getElementsByXPath('//span', doc)[0]).toBe(el);
    });

    test('get xpath', () => {
      const el = doc.getElementsByTagName('span')[0];
      expect(getXpath(el)).toBe('/div/span');
    });
  });

  describe('element <button> which has id', () => {
    test('get element', () => {
      const el = doc.getElementById('button');
      expect(getElementsByXPath('id("button")', doc)[0]).toBe(el);
    });

    test('get xpath', () => {
      const el = doc.getElementById('button');
      expect(getXpath(el)).toBe('id("button")');
    });
  });
});

describe('replace text node to decorated', () => {
  const decorateTextNode = elementjs.decorateTextNode;

  describe('plain text node', () => {
    let el;
    beforeEach(() => {
      document.body.innerHTML = `\
<div>
  <span id='s'>
    Adipiscing elit pellentesque habitant morbi tristique senectus et netus et.
    Tortor, at auctor urna nunc id cursus metus aliquam eleifend mi in nulla
    posuere sollicitudin aliquam ultrices sagittis orci, a!
  </span>
</div>
`;
      el = document.getElementById('s');
    });

    test('no offset', () => {
      const attrs = { class: 'hoge' };
      const text = el.childNodes[0];
      const span = document.createElement('span');
      const wrapper = document.createDocumentFragment();
      span.setAttribute('class', 'hoge');
      span.appendChild(text.cloneNode());
      wrapper.appendChild(span);
      expect(decorateTextNode(text, attrs)).toEqual(wrapper);
    });

    test('with offset', () => {
      const options = { startOffset: 10, endOffset: 50 };
      const attrs = { class: 'hoge' };
      const text = el.childNodes[0];
      const rawText = text.textContent;
      const wrapper = document.createDocumentFragment();
      wrapper.appendChild(
        document.createTextNode(rawText.slice(0, options.startOffset))
      );
      const span = document.createElement('span');
      span.setAttribute('class', 'hoge');
      span.appendChild(
        document.createTextNode(
          rawText.slice(options.startOffset, options.endOffset)
        )
      );
      wrapper.appendChild(span);
      wrapper.appendChild(
        document.createTextNode(rawText.slice(options.endOffset))
      );
      expect(decorateTextNode(text, attrs, options)).toEqual(wrapper);
    });
  });
});

describe('element generator', () => {
  const { elementGen } = elementjs;

  beforeEach(() => {
    document.body.innerHTML = `\
<div>
  <span id="a">
    Adipiscing elit pellentesque habitant morbi tristique senectus et netus et.
    Tortor,
    <span id="b">
        Pellentesque nec nam aliquam sem et tortor consequat id porta nibh venenatis
    </span>
    at auctor urna nunc id cursus metus aliquam eleifend mi in nulla
    posuere sollicitudin aliquam ultrices sagittis orci, a!
  </span>
</div>
`;
  });

  test('One element with a text node', () => {
    const el = document.getElementById('b');
    const gen = elementGen(el);
    expect(gen.next().value.id).toBe('b');
    expect(gen.next().done).toBe(true);
  });

  test('nested element', () => {
    const el = document.getElementsByTagName('div')[0];
    const gen = elementGen(el);
    expect(gen.next().value.tagName).toBe('DIV');
    expect(gen.next().value.id).toBe('a');
    expect(gen.next().value.id).toBe('b');
    expect(gen.next().done).toBe(true);
  });
});

describe('range element generator', () => {
  const { rangeGen } = elementjs;

  beforeEach(() => {
    document.body.innerHTML = `\
<div>
  <span id="a">
    Adipiscing elit pellentesque habitant morbi tristique senectus et netus et.
    Tortor,
    <span id="b">
        Pellentesque nec nam aliquam sem et tortor consequat id porta nibh venenatis
    </span>
    <span id="c">
        Pellentesque nec nam aliquam sem et tortor consequat id porta nibh venenatis
    </span>
    at auctor urna nunc id cursus metus aliquam eleifend mi in nulla
    posuere sollicitudin aliquam ultrices sagittis orci, a!
  </span>
</div>
`;
  });

  test('One element', () => {
    const e = document.getElementById('b');
    const range = {
      startContainer: e,
      endContainer: e,
      commonAncestorContainer: e
    };
    const gen = rangeGen(range);
    expect(gen.next().value.id).toBe('b');
    expect(gen.next().done).toBe(true);
  });

  test('from text node to text node', () => {
    const common = document.getElementById('a');
    const sc = document.getElementById('a').childNodes[0];
    const ec = document.getElementById('a').childNodes[2];
    const range = {
      startContainer: sc,
      endContainer: ec,
      commonAncestorContainer: common
    };
    const gen = rangeGen(range);
    expect(gen.next().value.id).toBe('a');
    expect(gen.next().value.id).toBe('b');
    expect(gen.next().value.id).toBe('c');
    expect(gen.next().done).toBe(true);
  });

  test('sibling elements', () => {
    const common = document.getElementById('a');
    const sc = document.getElementById('b');
    const ec = document.getElementById('c');
    const range = {
      startContainer: sc,
      endContainer: ec,
      commonAncestorContainer: common
    };
    const gen = rangeGen(range);
    expect(gen.next().value.id).toBe('b');
    expect(gen.next().value.id).toBe('c');
    expect(gen.next().done).toBe(true);
  });
});

describe('decorate range', () => {
  const { decorateRange, decorateTextNode } = elementjs;

  beforeEach(() => {
    document.body.innerHTML = `\
<div>
  <span id="a">
    Adipiscing elit pellentesque habitant morbi tristique senectus et netus et.
    Tortor,
    <span id="b">
      hoge fuga piyo
    </span>
    at auctor urna nunc id cursus metus aliquam eleifend mi in nulla
    posuere sollicitudin aliquam ultrices sagittis orci, a!
  </span>
</div>
`;
  });

  test('not nested', () => {
    const e = document.getElementById('b');
    const e2 = e.cloneNode(true);
    const attrs = { class: 'hoge' };
    const span = document.createElement('span');
    span.appendChild(e.childNodes[0].cloneNode());
    span.setAttribute('class', 'hoge');
    e.replaceChild(span, e.childNodes[0]);
    const range = document.createRange();
    range.setStart(e2, 0);
    range.setEnd(e2, 1);
    expect(range).toEqual({});
    expect(range.startConrainer).toEqual(e2);
    expect(range.endContainer).toEqual(e2);
    expect(range.commonAncestorContainer).toEqual(e2);
    // expect(decorateRange(range, attrs).commonAncestorContainer).toEqual(e);
  });

  test('not nested, with offset', () => {
    const e = document.getElementById('b');
    const e2 = e.cloneNode(true);
    const text = e.childNodes[0].textContent;
    const soffset = 10;
    const eoffset = 15;
    const attrs = { class: 'hoge' };
    const span = document.createElement('span');
    const fragment = document.createDocumentFragment();
    span.setAttribute('class', 'hoge');
    span.appendChild(document.createTextNode(text.slice(soffset, eoffset)));
    fragment.appendChild(document.createTextNode(text.slice(0, soffset)));
    fragment.appendChild(span);
    fragment.appendChild(document.createTextNode(text.slice(eoffset)));
    e.replaceChild(fragment, e.childNodes[0]);
    const range = {
      startConrainer: e2.childNodes[0],
      endContainer: e2.childNodes[0],
      commonAncestorContainer: e2
    };
    expect(
      decorateRange(range, attrs, {
        startTextOffset: soffset,
        endTextOffset: eoffset
      }).commonAncestorContainer
    ).toEqual(e);
  });

  test('nested', () => {
    const e = document.getElementById('a');
    const e2 = e.cloneNode(true);
    const attrs = { class: 'hoge' };
    const span = document.createElement('span');
    span.setAttribute('class', 'hoge');
    const span0 = span.cloneNode();
    span0.appendChild(e.childNodes[0].cloneNode());
    const span1 = span.cloneNode();
    span1.appendChild(e.childNodes[1].childNodes[0].cloneNode());
    const span2 = span.cloneNode();
    span2.appendChild(e.childNodes[2].cloneNode());
    e.replaceChild(span0, e.childNodes[0]);
    e.childNodes[1].replaceChild(span1, e.childNodes[1].childNodes[0]);
    e.replaceChild(span2, e.childNodes[2]);
    const range = {
      startConrainer: e2,
      endContainer: e2,
      commonAncestorContainer: e2
    };
    expect(decorateRange(range, attrs).commonAncestorContainer).toEqual(e);
  });

  test('nested, with offset', () => {
    const e = document.getElementById('a');
    const e2 = e.cloneNode(true);
    const soffset = 10;
    const eoffset = 15;
    const attrs = { class: 'hoge' };
    const span = document.createElement('span');
    span.setAttribute('class', 'hoge');
    const span0 = span.cloneNode();
    const fragment0 = document.createDocumentFragment();
    const node0 = e.childNodes[0];
    const text0 = node0.textContent;
    span0.appendChild(document.createTextNode(text0.slice(soffset)));
    fragment0.appendChild(document.createTextNode(text0.slice(0, soffset)));
    fragment0.appendChild(span0);
    const span1 = span.cloneNode();
    const node1 = e.childNodes[1].childNodes[0];
    span1.appendChild(node1.cloneNode());
    const span2 = span.cloneNode();
    const fragment2 = document.createDocumentFragment();
    const node2 = e.childNodes[2];
    const text2 = node2.textContent;
    span2.appendChild(document.createTextNode(text2.slice(0, eoffset)));
    fragment2.appendChild(span2);
    fragment2.appendChild(document.createTextNode(text2.slice(eoffset)));
    e.childNodes[1].replaceChild(span1, node1);
    e.replaceChild(fragment0, node0);
    e.replaceChild(fragment2, node2);
    const range = {
      startConrainer: e2,
      endContainer: e2,
      commonAncestorContainer: e2
    };
    expect(
      decorateRange(range, attrs, {
        startTextOffset: soffset,
        endTextOffset: eoffset
      }).commonAncestorContainer
    ).toEqual(e);
  });

  test('another element is different depth', () => {
    const spanA = document.getElementById('a');
    const spanB = document.getElementById('b');
    const commonAncestorContainer = spanA.cloneNode(true);
    const range = {
      startConrainer: commonAncestorContainer,
      startOffset: 0,
      endContainer: commonAncestorContainer.childNodes[1],
      endOffset: 1,
      commonAncestorContainer: commonAncestorContainer
    };
    const attrs = { class: 'hoge' };
    const span = document.createElement('span');
    span.setAttribute('class', 'hoge');
    const spanAText = spanA.childNodes[0];
    spanA.replaceChild(decorateTextNode(spanAText, attrs), spanAText);
    const spanBText = spanB.childNodes[0];
    spanB.replaceChild(decorateTextNode(spanBText, attrs), spanBText);
    expect(decorateRange(range, attrs).commonAncestorContainer).toEqual(spanA);
  });
});
