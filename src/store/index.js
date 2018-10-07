import Vue from 'vue';
import Vuex from 'vuex';

import { serializeRange, parseRange } from '../util/range';
import storage from '../api/storage';

Vue.use(Vuex);

const notes = {
  // initial state
  // shape: [{id, title, content, highlightId}]
  state: {
    notes: []
  },
  mutations: {
    pushNote(state, note) {
      state.push(note);
    }
  },
  actions: {
    addNote({ commit }, note) {
      commit('pushNote', note);
    }
  }
};

const highlights = {
  // initial state
  // shape: [{id, range, text}]
  state: {
    highlights: []
  },
  getters: {
    allHighlights: state => state.highlights,
    serializedHighlights: state =>
      state.highlights.map(i => ({
        id: i.id,
        range: serializeRange(i.range),
        text: i.text
      }))
  },
  mutations: {
    pushHighlight: (state, highlight) => state.highlights.push(highlight),
    uniqueHighlights: state =>
      (state.highlights = state.highlights.filter(
        (x, i, self) => self.indexOf(x) === i
      ))
  },
  actions: {
    addHighlight: ({ commit }, highlight) => {
      commit('pushHighlight', highlight);
      commit('uniqueHighlights');
    },
    saveHighlights: ({ getters }) =>
      storage.save('highlihgts', JSON.stringify(getters.serializedHighlights))
  }
};

export default new Vuex.Store({
  modules: {
    highlights,
    notes
  }
});
