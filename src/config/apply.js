// 引入外部功能组件
import Vue from 'vue'
import Animate from 'animate.css'
import Resource from 'vue-resource'

// 引入路由配置
import Router from './router.js'

// 引入 VUX-UI 组件
import  { AlertPlugin } from 'vux'
import  { ConfirmPlugin } from 'vux'
Vue.use(AlertPlugin)
Vue.use(ConfirmPlugin)

// 引入项目主组件
import App from '../pages/App.vue'

// 全局导入组件
Vue.use(Resource);

// 实例化 VUE 框架
window.onload = function(){
	new Vue({
		router: Router,
		el: '#app',
		render: h => h(App)
	});
}

