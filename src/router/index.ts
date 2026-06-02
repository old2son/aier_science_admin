import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

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
		redirect: '/dashboard',
		children: [
			{
				path: 'dashboard',
				name: 'Dashboard',
				component: () => import('@/views/dashboard/index.vue'),
				meta: {
					title: '工作台',
					icon: 'DataLine'
				}
			},
			{
				path: 'users',
				name: 'Users',
				component: () => import('@/views/users/index.vue'),
				meta: {
					title: '用户管理',
					icon: 'User'
				}
			},
			{
				path: 'settings',
				name: 'Settings',
				component: () => import('@/views/settings/index.vue'),
				meta: {
					title: '系统设置',
					icon: 'Setting'
				}
			}
		]
	},
	{
		path: '/:pathMatch(.*)*',
		redirect: '/dashboard'
	}
];

const router = createRouter({
	history: createWebHistory(),
	routes
});

router.beforeEach((to) => {
	const userStore = useUserStore();

	document.title = `${String(to.meta.title ?? '后台管理')} - Aier Admin`;

	if (to.meta.public) {
		return true;
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
