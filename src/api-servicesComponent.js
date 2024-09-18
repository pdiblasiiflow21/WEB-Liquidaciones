import Vue from 'vue';
import Vuex from 'vuex';
import axios from "axios";
import store from "./store";

Vue.use(Vuex);

var config = null;
//const API_BASE_URL = "https://localhost:5001/api/";

const API_BASE_URL = "https://qa-apiliquidaciones.iflow21.com/api/";

function find(url, request) {
  return axios.get(`${API_BASE_URL}${url}`, {
    params: request
  }, config);
};

function create(url, request) {
  return axios.post(`${API_BASE_URL}${url}`, request, config);
};

function update(url, request) {
  return axios.put(`${API_BASE_URL}${url}`, request, config);
};

function remove(url, request) {
  return axios.delete(`${API_BASE_URL}${url}`, request, config);
};
export default function execApi(url, method, request,token) {

 
 

    config = {
        headers: {
        Authorization: `Bearer ${token}`
      }
    };
  
  
  
    if (method == "get") {
      find(url, request)
    } else if (method == "post") {
      create(url, request)
    } else if (method == "put") {
      update(url, request)
    } else if (method == "delete") {
      remove(url, request)
    }
  
  };