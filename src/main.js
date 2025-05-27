import axios from 'axios';
import ElementUI from 'element-plus';
import 'element-plus/theme-chalk/index.css';
import {createApp} from 'vue';
import App from './App.vue';
import '@/assets/global.css';
import router from './router/routes';
import store from './store';

// 请求拦截器：自动携带token
axios.interceptors.request.use(config => {
	const token = localStorage.getItem('token');
	if (token) {
		config.headers['Authorization'] = 'Bearer ' + token;
	}
	return config;
}, error => Promise.reject(error));

// 响应拦截器：处理token失效
axios.interceptors.response.use(
		response => response,
		error => {
			if (error.response && error.response.status === 401) {
				localStorage.removeItem('token');
				window.location.href = '/login';
			}
			return Promise.reject(error);
		},
);

// 创建Vue应用实例
const app = createApp(App);

// 全局配置
app.config.globalProperties.$axios = axios; // 将axios挂载到全局属性上

app.use(ElementUI, {size: 'default'}); // 使用ElementUI并设置默认尺寸
app.use(router);                    // 使用路由
app.use(store);                     // 使用Vuex状态管理

// 全局前置路由守卫
router.beforeEach((to, from, next) => {
	// 检查路由是否存在
	const routeExists = router.getRoutes().some(route => route.path === to.path);
	if (!routeExists) {
		next('/index'); // 路由不存在时重定向到首页
	} else if (to.meta.requireAuth) {
		// 需要登录权限的路由，检查用户是否已登录
		if (store.state.user.username) {
			next(); // 已登录，允许访问
		} else {
			// 未登录，重定向到登录页
			next({
				path: '/login',
				query: {redirect: to.fullPath}, // 保存原目标路径，登录后可跳转回来
			});
		}
	} else {
		// 不需要登录权限的路由，直接访问
		next();
	}
});

// 挂载应用
app.mount('#app');
