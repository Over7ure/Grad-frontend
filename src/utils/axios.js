// JavaScript
import axios from 'axios';
import store from '@/store';
import router from '@/router';

const instance = axios.create({
  baseURL: 'http://localhost:9090',
  headers: {
    'Content-Type': 'application/json'
  }
});

instance.interceptors.response.use(
  response => response,
  error => {
    // 若没有响应说明服务器可能关闭或网络异常
    if (!error.response) {
      store.commit('logout');
      router.push('/login').catch(() => {});
    }
    return Promise.reject(error);
  }
);

export default instance;