import {createRouter, createWebHistory} from 'vue-router';

// 路由配置
const routes = [
	{
		path: '/home',
		name: '首页',
		component: () => import('@/components/Home.vue'),
		redirect: '/index',
		children: [
			// 首页路由
			{
				path: '/index',
				name: 'Index',
				component: () => import('@/components/HelloWorld.vue'),
				props: {msg: 'Hello World'},
				meta: {
					requireAuth: true, // 需要认证
				},
			},
			// 用户管理模块
			{
				path: '/userList',
				name: '用户管理',
				component: () => import('@/pages/home/img-acq-transfer/UserList.vue'),
				meta: {
					requireAuth: true,
				},
			},
			// 文件传输模块
			{
				path: '/filesUpload',
				name: '文件上传',
				component: () => import('@/pages/home/img-acq-transfer/FilesUpload.vue'),
				meta: {
					requireAuth: true,
				},
			},
			{
				path: '/dataCollection',
				name: '实时数据采集',
				component: () => import('@/pages/home/img-acq-transfer/DataCollection.vue'),
				meta: {
					requireAuth: true,
				},
			},
			// 缺陷检测模块
			{
				path: '/defectDetection',
				name: '缺陷检测',
				component: () => import('@/pages/home/def-scan/DefectDetection.vue'),
				meta: {
					requireAuth: true,
				},
			},
			{
				path: '/showResult',
				name: '检查结果',
				component: () => import('@/pages/home/def-scan/ShowResult.vue'),
				meta: {
					requireAuth: true,
				},
			},
			{
				path: '/weightFileManagement',
				name: '权重文件管理',
				component: () => import('@/pages/home/mod-mgt/WeightFileManagement.vue'),
				meta: {
					requireAuth: true,
				},
			},
			{
				path: '/modelTraining',
				name: '模型训练',
				component: () => import('@/pages/home/mod-mgt/ModelTraining.vue'),
				meta: {
					requireAuth: true,
					keepAlive: true,
				},
			},
		],
	},
	// 认证相关路由
	{
		path: '/login',
		name: 'Login',
		component: () => import('@/components/Login.vue'),
	},
	{
		path: '/register',
		name: 'Register',
		component: () => import('@/components/Register.vue'),
	},
];

// 创建路由实例
const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
