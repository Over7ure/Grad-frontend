import { createStore } from 'vuex';

// 创建Vuex存储
const store = createStore({
	// 应用状态
	state: {
		user: {
			// 从本地存储获取用户信息，如果不存在则为空字符串
			username: window.localStorage.getItem('user' || '[]') == null
					? ''
					: JSON.parse(window.localStorage.getItem('user' || '[]')).username,
		},
		selectedWeightRawId: null, // 新增：用于存储选中的权重文件原始ID
		trainingState: null, // 新增：模型训练状态
	},
	// 修改状态的方法
	mutations: {
		// 登录操作，保存用户信息到状态和本地存储
		login(state, user) {
			state.user = user;
			window.localStorage.setItem('user', JSON.stringify(user));
		},
		logout(state) {
			// 登出操作，清除用户信息和本地存储
			state.user = '';
			window.localStorage.removeItem('user');
		},
		setSelectedWeightRawId(state, weightId) { // 新增：用于设置选中的权重文件ID
			state.selectedWeightRawId = weightId;
		},
		setTrainingState(state, trainingState) { // 新增：设置训练状态
			state.trainingState = trainingState;
		},
		clearTrainingState(state) { // 新增：清除训练状态
			state.trainingState = null;
		},
	},
});

export default store;

