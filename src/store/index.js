import Vue from 'vue';
import Vuex from 'vuex';

import { serializeRange } from '../libs/range';
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
    allHighlights: state => state.highlights
  },
  mutations: {
    pushHighlight: (state, highlight) => state.highlights.push(highlight),
    replaceHighlights: (state, highlights) => (state.highlights = highlights),
    uniqueHighlights: state =>
      (state.highlights = state.highlights.filter(
        (x, i, self) => self.indexOf(x) === i
      ))
  },
  actions: {
    addHighlight: ({ commit, getters }, range) => {
      commit('pushHighlight', {
        id: getters.allHighlights.length,
        text: range.cloneContents().textContent.trim(),
        range: serializeRange(range)
      });
    },
    saveHighlights: ({ getters }) =>
      storage.save('highlihgts', JSON.stringify(getters.allHighlights)),
    loadHighlights: async ({ commit }) => {
      const highlights = await storage.load('highlihgts');
      commit('replaceHighlights', highlights);
      return highlights;
    }
  }
};

export default new Vuex.Store({
  modules: {
    highlights,
    notes
  }
});
