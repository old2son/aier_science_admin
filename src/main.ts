import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/index.css'

import App from './App.vue'
import router from './router'
import { setupStore } from './stores'

const app = createApp(App)

setupStore(app)

app.use(router)
app.use(ElementPlus)
app.mount('#app')
