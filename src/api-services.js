import axios from "axios";
import store from "../src/store"
const API_BASE_URL = 'https://localhost:44397/api/';
//const API_BASE_URL = "http://localhost:47515/api/";
const API_PROYECTO = 'https://localhost:44364/api/proyecto';
const config = {
    headers: { Authorization: `Bearer ${store.state.auth.token}` }
}

export default {
     get(url) {
       return axios.get(`${API_BASE_URL}${url}`,config);
     },
    create(url, request) {
        return axios.post(`${API_BASE_URL}${url}`, request, config);
    },
    update(url, request) {
        return axios.put(`${API_BASE_URL}${url}`, request, config);
    },
    delete(url, request) {
        return axios.delete(`${API_BASE_URL}${url}`, request, config);
    },
    proyecto() {
        return axios.post(`${API_PROYECTO}`);
    },
};