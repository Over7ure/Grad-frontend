import {createRouter, createWebHistory} from 'vue-router'

const routes = [
	{
		path: '/home',
		name: '首页',
		component: () => import('@/components/Home.vue'),
		redirect: '/index',
		children: [
			{
				path: '/index',
				name: 'Index',
				component: () => import('@/components/HelloWorld.vue'),
				props: {msg: 'Hello World'},
				meta: {
					requireAuth: true
				}
			},
			{
				path: '/userList',
				name: '用户管理',
				component: () => import('@/components/UserList.vue'),
				meta: {
					requireAuth: true
				}
			}
		]
	},
	{
		path: '/login',
		name: '登录',
		component: () => import('@/components/Login.vue')
	},
	{
		path: '/register',
		name: '注册',
		component: () => import('@/components/Register.vue')
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

export default router