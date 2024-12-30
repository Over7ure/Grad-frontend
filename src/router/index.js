import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from "@/components/HelloWorld.vue";
import UserList from "@/components/UserList.vue";

const routes = [
  {
    path: '/',
    name: 'HelloWorld',
    component: HelloWorld,
	props: { msg: 'Hello World' }
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