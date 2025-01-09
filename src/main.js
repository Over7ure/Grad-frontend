import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from "./store";
import ElementUI from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import './assets/global.css'

const debounce = (fn, delay) => {
	let timer = null;
	return function (...args) {
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), delay);
	};
};

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class extends _ResizeObserver {
	constructor(callback) {
		super(debounce(callback, 16));
	}
};

const app = createApp(App)

app.config.productionTip = false
app.use(ElementUI, {size: 'mini'})
app.use(router)
app.use(store)

router.beforeEach((to, from, next) => {
	const routeExists = router.getRoutes().some(route => route.path === to.path);
	if (!routeExists) {
		next('/index');
	} else if (to.meta.requireAuth) {
		if (store.state.user.username) {
			next();
		} else {
			next({
				path: '/login',
				query: {redirect: to.fullPath}
			});
		}
	} else {
		next();
	}
})

app.mount('#app')
