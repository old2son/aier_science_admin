import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

interface UserInfo {
	id: number;
	name: string;
	role: string;
	avatar: string;
}

const TOKEN_KEY = 'aier_admin_token';

export const useUserStore = defineStore('user', () => {
	const token = ref(localStorage.getItem(TOKEN_KEY) ?? '');
	const userInfo = ref<UserInfo>({
		id: 1,
		name: 'Admin',
		role: '系统管理员',
		avatar: ''
	});

	const isLoggedIn = computed(() => Boolean(token.value));

	function login(username: string, password: string) {
		if (!username || !password) {
			return Promise.reject(new Error('请输入账号和密码'));
		}

		token.value = `mock-token-${Date.now()}`;
		userInfo.value = {
			id: 1,
			name: username,
			role: username === 'admin' ? '系统管理员' : '运营人员',
			avatar: ''
		};
		localStorage.setItem(TOKEN_KEY, token.value);
		return Promise.resolve(userInfo.value);
	}

	function logout() {
		token.value = '';
		localStorage.removeItem(TOKEN_KEY);
	}

	return {
		token,
		userInfo,
		isLoggedIn,
		login,
		logout
	};
});
