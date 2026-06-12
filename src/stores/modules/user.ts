import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { adminPasswordLoginApi, getAdminInformationApi, adminLogoutApi } from '@/api/admin';
import { AdminUserInfo } from '@/types/AdminUserInfo';
import { resolve } from 'path';

const TOKEN_KEY = 'aier_admin_token';

export const useUserStore = defineStore('user', () => {
	const token = ref(localStorage.getItem(TOKEN_KEY) ?? '');
	const userInfo = ref<AdminUserInfo | null>(null);

	const isLoggedIn = computed(() => Boolean(token.value));

	async function login(username: string, password: string) {
		if (!username || !password) {
			return Promise.reject(new Error('请输入账号和密码'));
		}

		const res = await adminPasswordLoginApi({ phone: username, password });

		if (!res?.data?.userToken) {
			return Promise.reject(new Error(res.message));
		}

		token.value = res?.data?.userToken ?? '';
		localStorage.setItem(TOKEN_KEY, token.value);

		return res;
	}

	async function logout() {
		try {
			await adminLogoutApi();
		} catch (error) {
			console.error(error);
		} finally {
			token.value = '';
			userInfo.value = null;
			localStorage.removeItem(TOKEN_KEY);
		}
	}

	function getAdminInfo() {
		getAdminInformationApi().then((res) => {
			userInfo.value = res.data ?? null;
		});
	}

	return {
		token,
		userInfo,
		isLoggedIn,
		login,
		logout,
		getAdminInfo
	};
});
