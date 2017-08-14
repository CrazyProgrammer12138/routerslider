/* 引入自定义的模块  */
import Headed from '../pages/content/headed.vue'

/* 分路由  */
export default [
	{
		path: '/',
		redirect: '/content'
	}, {
		path: '/content',
		component: Headed
	}
	
]

