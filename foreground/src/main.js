import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios';
import md5 from 'js-md5';
import { Message } from 'element-ui';

Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.prototype.$md5 = md5;

axios.defaults.withCredentials = true;
Vue.prototype.$http = axios;
Vue.prototype.$axios = axios;

axios.defaults.timeout = 90000;
axios.defaults.retry = 1;
axios.defaults.retryDelay = 2000;
axios.interceptors.request.use(
    config => {
        config.headers.Authorization = store.state.token;
        return config;
    },
    function (err) {
        console.log('失败信息' + err);
    }
);
axios.interceptors.response.use(
    response => {
        return response;
    },
    function (error) {
        if (error.response.status == 401) {
            store.state.token = '';
            localStorage.setItem('token', '');
            Message.error('未登录请登陆');
        }
    }
);

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
