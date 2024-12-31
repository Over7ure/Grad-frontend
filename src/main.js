import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import './assets/global.css'

const app = createApp(App)

app.config.productionTip = false
app.use(ElementUI, {size: 'mini'})
app.use(router)

app.mount('#app')
