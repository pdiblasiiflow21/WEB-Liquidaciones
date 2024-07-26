// import { authService } from '../../services/auth.service';
import { eventBus } from '../../eventBus';
import { getInstance } from "../../auth/index";
// import vuexStore from '../../store';


export default {
  

  state: { token: localStorage.getItem('auth-token') || '', status: '' },
  getters: {
    isAuthenticated: (authState) => !!authState.token,
    authStatus: (authState) => authState.status,
    authToken: (authState) => authState.token,
  },
  actions: {
    async authRequest ({ dispatch, commit }, appState) {
      const authService = getInstance();
        commit('authRequest');
        await authService.loginWithRedirect(appState);
               
    },
    authRequest2: async ({ commit, dispatch }, appState) => {
      const authService = getInstance();
      return new Promise((resolve, reject) => {
        commit('authRequest');
      
      });
    },
    facebookAuthRequest: ({ commit, dispatch }, accessToken) => {
      return new Promise((resolve, reject) => {
        commit('authRequest');
        authService.facebookLogin(accessToken)
          .subscribe((result) => {
            localStorage.setItem('auth-token', result); // stash the auth token in localStorage
            commit('authSuccess', result);
            eventBus.$emit('logged-in', null);
            dispatch('user/userRequest', null, { root: true });
            resolve(result);
          }, (errors) => {
            commit('authError', errors);
            localStorage.removeItem('auth-token');
            reject(errors);
          });
      });
    },
    authLogout: ({ commit, dispatch }) => {
      localStorage.removeItem('auth-token');
      const authService = getInstance();
      authService.logout();
     
    },
    authSuccess({ dispatch, commit }, token){
      commit('authSuccess', token);
    }
  },
  mutations: {
    authRequest: (authState) => {
      authState.status = 'attempting authentication request';
    },
    authSuccess: (authState, authToken) => {
      authState.status = 'authentication succeeded';
      authState.token = authToken;
    },
    authError: (authState) => {
      authState.status = 'error';
    },
    authLogout: (authState) => {
      authState.token = '';
    },
  }
};
