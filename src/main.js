import Vue from 'vue'
import App from './App'

// BootstrapVue add
import  { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import VueResource from 'vue-resource';
// Router & Store add
import router from './router'
import store from './store'
// Multi Language Add
import en from './locales/en.json'
import es from './locales/es.json'
import VueI18n from 'vue-i18n'
import { defaultLocale, localeOptions, firebaseConfig } from './constants/config'
// Notification Component Add
import Notifications from './components/Common/Notification'
// Breadcrumb Component Add
import Breadcrumb from './components/Common/Breadcrumb'
// RefreshButton Component Add
import RefreshButton from './components/Common/RefreshButton'
// Colxx Component Add
import Colxx from './components/Common/Colxx'
// Perfect Scrollbar Add
import clickOutside from './directives/clickOutside';
import vuePerfectScrollbar from 'vue-perfect-scrollbar'
import contentmenu from 'v-contextmenu'
import VueLineClamp from 'vue-line-clamp'
import VCalendar from 'v-calendar'
import 'v-calendar/lib/v-calendar.min.css'
import VueScrollTo from 'vue-scrollto'
import firebase from 'firebase/app'
import 'firebase/auth'
import * as components from './components/Base';
import api from './api';
import vuexStore from './store';
import { eventBus } from './eventBus';
import settings from './settings';
//import * as usuarios from './views/app/usuarios/components';


import VueMask from 'v-mask';

import createNumberMask from 'text-mask-addons/dist/createNumberMask';

import historialproyectoComponent from './views/app/historialproyectos/List.vue';


// import Vuelidate from 'vuelidate'
// Vue.use(Vuelidate);
// Import the Auth0 configuration
// Import the plugin here
import { Auth0Plugin } from "./auth";

// Install the authentication plugin here

Vue.use(Auth0Plugin, {
  domain: settings.auth0.domain,
  clientId: settings.auth0.clientId,
  audience: settings.auth0.audience,
  scope: settings.auth0.scope,
  onRedirectCallback: appState => {
    // console.log(appState);
    router.push(
      appState && appState.targetUrl
        ? appState.targetUrl
        : window.location.pathname
    );
  }
});

Vue.use(BootstrapVue);
Vue.use(VueResource);
Vue.use(VueI18n);
Vue.use(BootstrapVueIcons);
Vue.use(VueMask)

const messages = { en: en, es: es };
const locale = (localStorage.getItem('currentLanguage') && localeOptions.filter(x => x.id === localStorage.getItem('currentLanguage')).length > 0) ? localStorage.getItem('currentLanguage') : defaultLocale;
const i18n = new VueI18n({
  locale: locale,
  fallbackLocale: 'en',
  messages
});
const currencyMask = createNumberMask({
  prefix: '$',
  allowDecimal: true,
  includeThousandsSeparator: true,
  allowNegative: false,
});
Vue.prototype.$isValid = function (field) {        
  if(!field.$dirty) return null;        

  return !field.$invalid;
};
Vue.prototype.$api = Vue.api = api(Vue);
Vue.prototype.$vuexStore = Vue.vuexStore = vuexStore;    
Vue.prototype.$settings = Vue.settings = settings;

Vue.component('basic-table', components.BasicTable);
Vue.component('paginate', components.Paginate);
Vue.component('data-grid', components.DataGrid);
Vue.component('list-view', components.ListView);    
Vue.component('error-message', components.ErrorMessage);  
Vue.component('error-info', components.ErrorInfo); 
Vue.component('loading', components.Loading);
Vue.component('search', components.Search);
Vue.component('column', components.Column);
Vue.component('select-deluxe', components.SelectDeluxe);
//Vue.component('u-list-view', usuarios.UListView);
Vue.use(Notifications);
Vue.component('piaf-breadcrumb', Breadcrumb);
Vue.component('b-refresh-button', RefreshButton);
Vue.component('b-colxx', Colxx);
Vue.component('vue-perfect-scrollbar', vuePerfectScrollbar);
Vue.component('historial-proyectos', historialproyectoComponent);

Vue.directive('click-outside', clickOutside);

Vue.use(require('vue-shortkey'));
Vue.use(contentmenu);
Vue.use(VueLineClamp, {
  importCss: true
})
Vue.use(VCalendar, {
  firstDayOfWeek: 2, // ...other defaults,
  formats: {
    title: 'MMM YY',
    weekdays: 'WW',
    navMonths: 'MMMM',
    input: ['L', 'YYYY-MM-DD', 'YYYY/MM/DD'],
    dayPopover: 'L'
  },
  datePickerShowDayPopover: false,
  popoverExpanded: true,
  popoverDirection: 'bottom'
});
Vue.use(VueScrollTo);

firebase.initializeApp(firebaseConfig);
Vue.http.options.root = settings.apiUrl;

Vue.http.interceptors.push(function (request, next) {        
  var user = Vue.vuexStore.state.user.user;
      const result = store.getters['auth/authToken'];
      // console.log("Token",result);
      if (result) {
          request.headers.set('Authorization', `Bearer ${result}`);
      }
      next((response) => {      
          // console.log("Interceptor Response:", response);      
          if (response.status === 401) {
              // vuexStore.dispatch('auth/authLogout');
              // $goto('/login');
              // window.location = '/Login';
              eventBus.$emit('UNAUTHORIZED');
          } else {
              eventBus.$emit('REQUEST_MADE');
          }
      })
})

Vue.config.productionTip = false

export default new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app')