import Vue from 'vue';
import Vuex from 'vuex';
const Vue = require('Vue');
const Vuex = require('Vuex');

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
    allHighlights: function(state) {
      return state.highlights;
    }
  },
  mutations: {
    pushHighlight(state, highlight) {
      state.push(highlight);
    }
  },
  actions: {
    addHighlight({ commit }, highlight) {
      commit('pushHighlight', highlight);
    }
  }
};

export default new Vuex.Store({
  modules: {
    highlights,
    notes
  }
});
