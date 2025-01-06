import {createRouter, createWebHistory} from 'vue-router'
import MyHome from "@/components/Home.vue";
import HelloWorld from "@/components/HelloWorld.vue";
import UserList from "@/components/UserList.vue";
import UserLogin from "@/components/Login.vue";

const routes = [
	{
		path: '/home',
		name: 'Home',
		component: MyHome,
		redirect: '/index',
		children: [
			{
				path: '/index',
				name: 'AppIndex',
				component: HelloWorld,
				props: {msg: 'Hello World'},
				meta: {
					requireAuth: true
				}
			},
			{
				path: '/users',
				name: 'UserList',
				component: UserList,
				meta: {
					requireAuth: true
				}
			}
		]
	},
	{
		path: '/login',
		name: 'Login',
		component: UserLogin
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

export default router