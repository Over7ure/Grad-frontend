import {createStore} from "vuex"

// 创建Vuex存储
const store = createStore({
	// 应用状态
	state: {
		user: {
			// 从本地存储获取用户信息，如果不存在则为空字符串
			username: window.localStorage.getItem('user' || '[]') == null ? '' : JSON.parse(window.localStorage.getItem('user' || '[]')).username
		}
	},
	// 修改状态的方法
	mutations: {
		// 登录操作，保存用户信息到状态和本地存储
		login(state, user) {
			state.user = user
			window.localStorage.setItem('user', JSON.stringify(user))
		}
	}
})

export default store
