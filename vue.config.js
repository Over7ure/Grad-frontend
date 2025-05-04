const {defineConfig} = require('@vue/cli-service');
module.exports = defineConfig({
	transpileDependencies: true,
	devServer: {
		port: 8080, // 前端端口
		proxy: {
			'/api': {
				target: 'http://localhost:9090', // 后端服务地址
				changeOrigin: true,
				pathRewrite: {'^/api': '/api'},
			},

			'/upload_files': {
				target: 'http://localhost:5130',
				changeOrigin: true,
			},
			'/create_train': {
				target: 'http://localhost:5130',
				changeOrigin: true,
			},
			'/upload_datasets': {
				target: 'http://localhost:5130',
				changeOrigin: true,
			},
			'/start_train': {
				target: 'http://localhost:5130',
				changeOrigin: true,
			},
			'/train_log': {
				target: 'http://localhost:5130',
				changeOrigin: true,
			},
			'/start_val': {
				target: 'http://localhost:5130',
				changeOrigin: true,
			},
			'/start_predict': {
				target: 'http://localhost:5130',
				changeOrigin: true,
			},
			'/get_files': {
				target: 'http://localhost:5130',
				changeOrigin: true,
			},
		},
	},
});
