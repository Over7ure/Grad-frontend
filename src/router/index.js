import {createRouter, createWebHistory} from 'vue-router'
import HelloWorld from "@/components/HelloWorld.vue";
import UserList from "@/components/UserList.vue";
import UserLogin from "@/components/UserLogin.vue";

const routes = [
	{
		path: '/',
		name: 'UserLogin',
		component: UserLogin
	},
	{
		path: '/helloWorld',
		name: 'HelloWorld',
		component: HelloWorld,
		props: {msg: 'Hello World'}
	},
	{
		path: '/users',
		name: 'UserList',
		component: UserList
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

export default router