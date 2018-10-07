const storageKey = 'highlighter';
const storage = localStorage;

const createKey = key => storageKey + '#' + window.location.href + '#' + key;

export default {
  async load(key) {
    const key_ = createKey(key);
    const data = storage.getItem(key_);
    return data ? JSON.parse(data) : [];
  },
  async save(key, data) {
    const key_ = createKey(key);
    storage.setItem(key_, data);
  }
};
