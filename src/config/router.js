// 引入 Vue 和 Vue-router
import Vue from 'vue';
import Router from 'vue-router'

// 引入各个分路由
import HwqRouter from './router-hwq.js'

// Vue 载入 Vue-Router
Vue.use(Router);

// 配置路由  -> 主路由
var routes = [];
routes = routes.concat(HwqRouter);

// 实例化路由对象
var router = new Router({
	routes
});

// 导出路由配置
export default router;