import {createRouter, createWebHistory} from 'vue-router'

const routes = [
	{
		path: '/home',
		name: 'Home',
		component: () => import('@/components/Home.vue'),
		redirect: '/index',
		children: [
			{
				path: '/index',
				name: 'AppIndex',
				component: () => import('@/components/HelloWorld.vue'),
				props: {msg: 'Hello World'},
				meta: {
					requireAuth: true
				}
			},
			{
				path: '/userList',
				name: 'UserList',
				component: () => import('@/components/UserList.vue'),
				meta: {
					requireAuth: true
				}
			}
		]
	},
	{
		path: '/login',
		name: 'Login',
		component: () => import('@/components/Login.vue')
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

export default router