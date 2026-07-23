import { 
	createRouter, 
	// createWebHistory,
	createWebHashHistory, 
	type RouteRecordRaw 
} from 'vue-router';

import { useUserStore } from '@/stores/modules/user';

const routes: RouteRecordRaw[] = [
	{
		path: '/login',
		name: 'Login',
		component: () => import('@/views/login/index.vue'),
		meta: {
			title: '登录',
			public: true
		}
	},
	{
		path: '/',
		component: () => import('@/layouts/AdminLayout.vue'),
		redirect: '/session-config',
		children: [
			{
				path: 'session-config',
				name: 'SessionConfig',
				component: () => import('@/views/session-config/index.vue'),
				meta: {
					title: '科普馆场次配置',
					icon: 'Calendar'
				}
			},
			{
				path: 'booking-query',
				name: 'BookingQuery',
				component: () => import('@/views/booking-query/index.vue'),
				meta: {
					title: '科普馆预约查询',
					icon: 'Document'
				}
			},
			{
				path: 'activity-session-config',
				name: 'ActivitySessionConfig',
				component: () => import('@/views/activity-session-config/index.vue'),
				meta: {
					title: '活动场次配置',
					icon: 'Tickets'
				}
			},
			{
				path: 'feedback-query',
				name: 'FeedbackQuery',
				component: () => import('@/views/feedback-query/index.vue'),
				redirect: '/feedback-query/list',
				meta: {
					title: '意见反馈查询',
					icon: 'Collection'
				},
				children: [
					{
						path: 'list',
						name: 'FeedbackQueryList',
						component: () => import('@/views/feedback-query/list.vue'),
						meta: {
							title: '意见反馈列表',
							icon: 'List'
						}
					},
					{
						path: 'analytics',
						name: 'FeedbackQueryAnalytics',
						component: () => import('@/views/feedback-query/analytics.vue'),
						meta: {
							title: '意见反馈图表',
							icon: 'TrendCharts'
						}
					}
				]
			}
			// {
			// 	path: 'users',
			// 	name: 'Users',
			// 	component: () => import('@/views/users/index.vue'),
			// 	meta: {
			// 		title: '用户管理',
			// 		icon: 'User'
			// 	}
			// }
		]
	},
	{
		path: '/:pathMatch(.*)*',
		redirect: '/session-config'
	}
];

const router = createRouter({
	// history: createWebHistory('/adminManage/'), // history 模式, o2s.fun 用
	history: createWebHashHistory(),
	routes
});

router.beforeEach((to) => {
	const userStore = useUserStore();

	document.title = `${String(to.meta.title ?? '后台管理')} - Aier Admin`;

	if (to.meta.public) {
		return true;
	}

	if (to.name === 'Login' && userStore.isLoggedIn) {
		return {
			path: '/',
			query: {
				redirect: to.fullPath
			}
		};
	}

	if (!userStore.isLoggedIn) {
		return {
			path: '/login',
			query: {
				redirect: to.fullPath
			}
		};
	}

	return true;
});

export default router;
export { routes };
