const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
	transpileDependencies: true,
	devServer: {
		port:8080, // 前端端口
		proxy: {
			'/api': {
				target: 'http://localhost:9090', // 后端服务地址
				changeOrigin: true,
				pathRewrite: { '^/api': '/api' }
			}
		}
	},
})
