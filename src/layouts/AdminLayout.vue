<script setup lang="ts">
import { Calendar, Fold, Menu as MenuIcon, Setting, SwitchButton, User } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { routes } from '@/router';
import { useUserStore } from '@/stores/modules/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const collapsed = ref(false);

const menuRoutes = computed(() => routes.find((item) => item.path === '/')?.children ?? []);

const iconMap = {
	Calendar,
	User,
	Setting
};

function toggleCollapse() {
	collapsed.value = !collapsed.value;
}

function handleLogout() {
	userStore.logout();
	router.push('/login');
}
</script>

<template>
	<div class="flex min-h-screen bg-slate-50">
		<aside
			class="hidden border-r border-slate-200 bg-white transition-all duration-200 md:block"
			:class="collapsed ? 'w-16' : 'w-60'"
		>
			<div class="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
				<div
					class="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand-600 text-sm font-bold text-white"
				>
					A
				</div>
				<span v-show="!collapsed" class="text-base font-semibold text-slate-900">Aier Admin</span>
			</div>

			<el-menu :collapse="collapsed" :default-active="route.path" :router="true" class="admin-menu border-0">
				<el-menu-item v-for="item in menuRoutes" :key="item.path" :index="`/${item.path}`">
					<el-icon>
						<component :is="iconMap[item.meta?.icon as keyof typeof iconMap] ?? Calendar" />
					</el-icon>
					<span>{{ item.meta?.title }}</span>
				</el-menu-item>
			</el-menu>
		</aside>

		<section class="flex min-w-0 flex-1 flex-col">
			<header class="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
				<div class="flex items-center gap-3">
					<el-button :icon="collapsed ? MenuIcon : Fold" circle @click="toggleCollapse" />
					<div>
						<h1 class="text-lg font-semibold leading-6 text-slate-900">{{ route.meta.title }}</h1>
						<p class="hidden text-xs text-slate-500 sm:block">后台管理系统</p>
					</div>
				</div>

				<el-dropdown trigger="click">
					<button class="flex items-center gap-3 rounded-md px-2 py-1 text-left hover:bg-slate-100">
						<el-avatar :size="32">{{ userStore.userInfo.name.slice(0, 1).toUpperCase() }}</el-avatar>
						<span class="hidden text-sm font-medium text-slate-700 sm:inline">{{
							userStore.userInfo.name
						}}</span>
					</button>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item disabled>{{ userStore.userInfo.role }}</el-dropdown-item>
							<el-dropdown-item :icon="SwitchButton" @click="handleLogout">退出登录</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</header>

			<main class="min-h-0 flex-1 overflow-auto">
				<RouterView />
			</main>
		</section>
	</div>
</template>

<style scoped>
.admin-menu {
	--el-menu-item-height: 48px;
}
</style>
