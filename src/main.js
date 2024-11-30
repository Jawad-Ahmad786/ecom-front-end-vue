import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import axios from 'axios';
import {createBootstrap} from 'bootstrap-vue-next'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';

axios.defaults.baseURL = 'http://backend.ecom.com:8000/api/'
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.interceptors.request.use(
  config => {
    config.headers['device_id'] = setDeviceId() || '';
    config.headers['user_id'] = localStorage.getItem('user_id') || '';
    return config;
  },
  error => Promise.reject(error)
);
const app = createApp(App).use(router);
app.use(createBootstrap())
app.config.globalProperties.$axios = axios
app.mount('#app');

function setDeviceId() {
  let deviceId = localStorage.getItem('device_id');
  if(!deviceId){
    let r = (Math.random() + 1).toString(36).substring(2);
    localStorage.setItem('device_id', r);
  }
  return deviceId;
}