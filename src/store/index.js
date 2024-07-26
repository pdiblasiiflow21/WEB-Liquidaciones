import Vue from 'vue'
import Vuex from 'vuex'

import app from '../main'
import menu from './modules/menu'
import user from './modules/user'
import auth from './modules/auth'
// import token from './modules/token'
import users from '../app/users/shared/state/users'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {

    settings: {
      apiUrl: "https://localhost:44393/",
      clientId: "administracionWebApp",
      //weatherUrl: 'https://cors-anywhere.herokuapp.com/http://api.openweathermap.org/data/2.5',
      // identityPoolId: 'us-east-1:a0129bce-7bf4-4b27-aa72-045b36b1e5cb',
      // region: 'us-east-1',
      // bucket: 'hbuildtest-files.grupozag.com',
    }
  },
  mutations: {
    changeLang(state, payload) {
      app.$i18n.locale = payload
      localStorage.setItem('currentLanguage', payload)
    }
  },
  actions: {
    setLang({ commit }, payload) {
      commit('changeLang', payload)
    }
  },
  modules: {
    auth: {
      namespaced: true,
      state: auth.state,
      mutations: auth.mutations,
      getters: auth.getters,
      actions: auth.actions,
    },
    user: {
      // namespaced: true,
      state: user.state,
      actions: user.actions,
      mutations: user.mutations,
      getters: user.getters,
    },
    menu,
    users
  }
})