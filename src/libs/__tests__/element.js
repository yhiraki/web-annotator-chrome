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

describe('replace element node to decorated', () => {
  const { decorateTextNode, decorateElementTextNode } = elementjs;

  describe('plain text node', () => {
    let el;
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

    test('the func bangs object', () => {
      const e = document.getElementById('b');
      const attrs = { class: 'hoge' };
      expect(decorateElementTextNode(e, attrs)).toBe(e);
    });

    test('not nested', () => {
      const e = document.getElementById('b');
      const e2 = e.cloneNode(true);
      const attrs = { class: 'hoge' };
      const span = document.createElement('span');
      span.appendChild(e.childNodes[0].cloneNode());
      span.setAttribute('class', 'hoge');
      e.replaceChild(span, e.childNodes[0]);
      expect(decorateElementTextNode(e2, attrs)).toEqual(e);
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
      expect(
        decorateElementTextNode(e2, attrs, {
          startTextOffset: soffset,
          endTextOffset: eoffset
        })
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
      expect(decorateElementTextNode(e2, attrs)).toEqual(e);
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
      expect(
        decorateElementTextNode(e2, attrs, {
          startTextOffset: soffset,
          endTextOffset: eoffset
        })
      ).toEqual(e);
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
    expect(gen.next().value.nodeType).toBe(Node.TEXT_NODE);
    expect(gen.next().done).toBe(true);
  });

  test('nested element', () => {
    const el = document.getElementsByTagName('div')[0];
    const gen = elementGen(el);
    expect(gen.next().value.tagName).toBe('DIV');
    expect(gen.next().value.nodeType).toBe(Node.TEXT_NODE); // text of div
    expect(gen.next().value.id).toBe('a');
    expect(gen.next().value.nodeType).toBe(Node.TEXT_NODE); // text of span.a
    expect(gen.next().value.id).toBe('b');
    expect(gen.next().value.nodeType).toBe(Node.TEXT_NODE); // text of span.b
    expect(gen.next().value.nodeType).toBe(Node.TEXT_NODE); // text of span.a
    expect(gen.next().value.nodeType).toBe(Node.TEXT_NODE); // text of div
    expect(gen.next().done).toBe(true);
  });
});

describe('decorate range', () => {
  const { decorateRange } = elementjs;

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
    expect(decorateRange({ commonAncestorContainer: e }, attrs)).toEqual(e);
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
    expect(
      decorateRange({ commonAncestorContainer: e2 }, attrs, {
        startTextOffset: soffset,
        endTextOffset: eoffset
      })
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
    expect(decorateRange({ commonAncestorContainer: e2 }, attrs)).toEqual(e);
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
    expect(
      decorateRange({ commonAncestorContainer: e2 }, attrs, {
        startTextOffset: soffset,
        endTextOffset: eoffset
      })
    ).toEqual(e);
  });

  test('', () => {
    const spanB = document.getElementById('b');
    const range = {
      startConrainer: spanB,
      startOffset: 0,
      endContainer: spanB,
      endOffset: 1,
      commonAncestorContainer: document.getElementById('a')
    };
    const attrs = { class: 'hoge' };
    const span = document.createElement('span');
    span.setAttribute('class', 'hoge');
    const child = spanB.childNodes[0];
    span.appendChild(child.cloneNode());
    spanB.replaceChild(span, child);
    expect(decorateRange(range, attrs)).toEqual(spanB);
  });
});
