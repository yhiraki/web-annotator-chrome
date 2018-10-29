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

describe('Test getXpath and getElementsByXPath', () => {
  const getElementsByXPath = elementjs.getElementsByXPath;
  const getXpath = elementjs.getXpath;
  let doc;

  beforeEach(() => {
    doc = new dom().parseFromString(`\
<div>
  <span />
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
