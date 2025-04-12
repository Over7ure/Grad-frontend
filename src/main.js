import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from "./store";
import ElementUI from 'element-plus'
import axios from "axios";
import 'element-plus/theme-chalk/index.css'
import './assets/global.css'

// 防抖函数，用于优化ResizeObserver性能
const debounce = (fn, delay) => {
	let timer = null;
	return function (...args) {
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), delay);
	};
};

// 重写ResizeObserver，添加防抖功能避免频繁触发
const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class extends _ResizeObserver {
	constructor(callback) {
		super(debounce(callback, 16)); // 16ms的防抖延迟（约等于一帧）
	}
};

// 添加axios默认路由
axios.defaults.baseURL = 'http://localhost:9090'

// 创建Vue应用实例
const app = createApp(App)

// 全局配置
app.config.productionTip = false
app.config.globalProperties.$axios = axios // 将axios挂载到全局属性上
app.use(ElementUI, {size: 'mini'}) // 使用ElementUI并设置默认尺寸
app.use(router)                    // 使用路由
app.use(store)                     // 使用Vuex状态管理

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
				query: {redirect: to.fullPath} // 保存原目标路径，登录后可跳转回来
			});
		}
	} else {
		// 不需要登录权限的路由，直接访问
		next();
	}
})

// 挂载应用
app.mount('#app')
