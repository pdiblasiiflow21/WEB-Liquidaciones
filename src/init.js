import * as components from './components/Base';
import api from './api';
import settings from './settings';
import VueResource from 'vue-resource';

export default (Vue) => {


    Vue.use(VueResource);
    Vue.prototype.$api = Vue.api = api(Vue);
    Vue.prototype.$settings = Vue.settings = settings;

    Vue.component('basic-table', components.BasicTable);
    Vue.component('paginate', components.Paginate);
    Vue.component('data-grid', components.DataGrid);
    Vue.component('list-view', components.ListView);    
    Vue.component('error-info', components.ErrorInfo); 
    Vue.component('error-message', components.ErrorMessage); 
    Vue.component('loading', components.Loading);
    Vue.component('search', components.Search);
    Vue.component('column', components.Column);
};