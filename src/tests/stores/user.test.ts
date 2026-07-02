import { describe, expect, it, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useUserStore } from '@/stores/modules/user';
import { adminPasswordLoginApi, adminLogoutApi, getAdminInformationApi } from '@/api/admin';

import { STORAGE_KEY } from '@/constants/storage';

vi.mock('@/api/admin', () => ({
	adminPasswordLoginApi: vi.fn(),
	adminLogoutApi: vi.fn(),
	getAdminInformationApi: vi.fn()
}));

beforeEach(() => {
	setActivePinia(createPinia());

	localStorage.clear();

	vi.clearAllMocks();
});

describe('user store', () => {
	describe('login', () => {
		it('登录成功保存 token', async () => {
			vi.mocked(adminPasswordLoginApi).mockResolvedValue({
				data: {
					userToken: 'abc123'
				}
			} as any);

			const store = useUserStore();

			await store.login('admin', '123456');

			expect(store.token).toBe('abc123');

			expect(localStorage.getItem(STORAGE_KEY.TOKEN)).toBe('abc123');
		});
	});

	describe('logout', () => {
		it('退出登录清除 token', async () => {
			vi.mocked(adminLogoutApi).mockResolvedValue({
				data: {
					userToken: 'abc123'
				}
			} as any);
			const store = useUserStore();

			await store.logout();

			expect(store.token).toBe('');
			expect(localStorage.getItem(STORAGE_KEY.TOKEN)).toBe(null);
		});
	});

	describe('getAdminInfo', () => {
		it('获取用户信息成功', async () => {
			vi.mocked(getAdminInformationApi).mockResolvedValue({
				data: {
					userInfo: {
						id: 1,
						name: 'Tom'
					}
				}
			} as any);
			const store = useUserStore();

			await store.getAdminInfo();

			expect(store.userInfo).toEqual({
				userInfo: {
					id: 1,
					name: 'Tom'
				}
			});
		});
	});
});
