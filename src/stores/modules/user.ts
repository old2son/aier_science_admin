import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { adminPasswordLoginApi, getAdminInformationApi, adminLogoutApi } from '@/api/admin';
import { AdminUserInfo } from '@/types/AdminUserInfo';

import { STORAGE_KEY } from '@/constants/storage';
import { isAuthInvalidatedRequestError, resetAuthInvalidated } from '@/utils/requestAuth';
import { isRequestCanceledError } from '@/utils/requestCancel';

export const useUserStore = defineStore('user', () => {
	const token = ref(localStorage.getItem(STORAGE_KEY.TOKEN) ?? '');
	const userInfo = ref<AdminUserInfo | null>(null);
	const isLoggingOut = ref(false); // 控制主动登出的锁

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
		localStorage.setItem(STORAGE_KEY.TOKEN, token.value);
		resetAuthInvalidated();

		return res;
	}

	async function logout(options?: { preserveAuthInvalidated?: boolean }) {
		if (isLoggingOut.value) {
			return;
		}

		isLoggingOut.value = true;

		try {
			await adminLogoutApi();
		} catch (error) {
			if (!isAuthInvalidatedRequestError(error)) {
				console.error(error);
			}
		} finally {
			token.value = '';
			userInfo.value = null;
			localStorage.removeItem(STORAGE_KEY.TOKEN);

			if (!options?.preserveAuthInvalidated) {
				resetAuthInvalidated();
			}

			isLoggingOut.value = false;
		}
	}

	async function getAdminInfo() {
		try {
			const res = await getAdminInformationApi();
			userInfo.value = res.data ?? null;
		} catch (error) {
			if (isAuthInvalidatedRequestError(error)) {
				return;
			}

			if (isRequestCanceledError(error)) {
				return;
			}

			console.error(error);
		}
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
