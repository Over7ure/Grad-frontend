import {createStore} from "vuex"

const store = createStore({
	state: {
		user: {
			username: window.localStorage.getItem('user' || '[]') == null ? '' : JSON.parse(window.localStorage.getItem('user' || '[]')).username
		}
	},
	mutations: {
		login(state, user) {
			state.user = user
			window.localStorage.setItem('user', JSON.stringify(user))
		}
	}
})

export default store