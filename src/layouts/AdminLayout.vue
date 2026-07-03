<template>
	<div class="admin-layout flex min-h-screen">
		<aside
			class="admin-layout__aside hidden transition-all duration-200 md:block"
			:class="collapsed ? 'w-16' : 'w-60'"
		>
			<div class="admin-layout__brand flex h-16 items-center gap-3 px-4">
				<div
					class="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand-600 text-sm font-bold text-white"
				>
					爱
				</div>
				<span v-show="!collapsed" class="admin-layout__title text-base font-semibold">爱尔科普馆管理后台</span>
			</div>

			<el-menu
				:collapse="collapsed"
				:default-active="activeMenuPath"
				:default-openeds="openedMenuPaths"
				:router="true"
				class="admin-menu border-0"
			>
				<template v-for="item in menuRoutes" :key="item.path">
					<el-sub-menu v-if="getVisibleChildren(item).length" :index="normalizeMenuPath(item.path)">
						<template #title>
							<div class="admin-menu__submenu-title" @click="handleParentMenuClick(item)">
								<el-icon>
									<component :is="iconMap[item.meta?.icon as keyof typeof iconMap] ?? Calendar" />
								</el-icon>
								<span>{{ item.meta?.title }}</span>
							</div>
						</template>

						<el-menu-item
							v-for="child in getVisibleChildren(item)"
							:key="`${item.path}-${child.path}`"
							:index="resolveChildMenuPath(item.path, child.path)"
						>
							{{ child.meta?.title }}
						</el-menu-item>
					</el-sub-menu>

					<el-menu-item v-else :index="normalizeMenuPath(item.path)">
						<el-icon>
							<component :is="iconMap[item.meta?.icon as keyof typeof iconMap] ?? Calendar" />
						</el-icon>
						<span>{{ item.meta?.title }}</span>
					</el-menu-item>
				</template>
			</el-menu>
		</aside>

		<section class="flex min-w-0 flex-1 flex-col">
			<header class="admin-layout__header flex items-center justify-between px-4 md:px-6" style="height: 64px">
				<div class="flex min-w-0 flex-1 items-center gap-3">
					<el-button :icon="collapsed ? MenuIcon : Fold" circle @click="toggleCollapse" />
					<div class="min-w-0">
						<el-breadcrumb separator="/">
							<el-breadcrumb-item
								v-for="(item, idx) in breadcrumbs"
								:key="idx"
								:to="idx === 0 ? item.path : undefined"
							>
								{{ item.title }}
							</el-breadcrumb-item>
						</el-breadcrumb>
						<p class="admin-layout__subtitle mt-1 hidden text-xs sm:block">后台管理系统</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<el-button
						class="app-theme-button"
						:icon="themeMode === 'dark' ? Sunny : Moon"
						circle
						@click="handleToggleTheme"
					/>

					<el-dropdown trigger="click">
						<button class="admin-layout__user-trigger flex items-center gap-3 rounded-md px-2 py-1 text-left">
							<el-avatar :src="userStore?.userInfo?.userAvatarUrl" :size="32">{{ userInitial }}</el-avatar>
							<span class="admin-layout__user-name hidden text-sm font-medium sm:inline">{{
								userStore?.userInfo?.nickName
							}}</span>
						</button>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item disabled>{{ userStore?.userInfo?.phone }}</el-dropdown-item>
								<el-dropdown-item :icon="SwitchButton" @click="handleLogout">退出登录</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>
			</header>

			<main class="min-h-0 flex-1 overflow-auto">
				<RouterView />
			</main>
		</section>
	</div>
</template>

<script setup lang="ts">
import {
	Calendar,
	Document,
	Fold,
	Menu as MenuIcon,
	Moon,
	Setting,
	Sunny,
	SwitchButton,
	Tickets,
	Collection,
	User
} from '@element-plus/icons-vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter, type RouteRecordRaw } from 'vue-router';

import { routes } from '@/router';
import { useUserStore } from '@/stores/modules/user';
import { ElMessage } from 'element-plus';
import { getTheme, toggleTheme, type ThemeMode } from '@/utils/theme';

// import { getAdminInformationApi, adminLogoutApi } from '@/api/admin';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const collapsed = ref(false);
const themeMode = ref<ThemeMode>(getTheme());
const activeMenuPath = computed(() => route.path);
const openedMenuPaths = computed(() =>
	route.matched
		.filter((item) => item.path !== '/' && item.children?.length)
		.map((item) => item.path)
);

const menuRoutes = computed(() => routes.find((item) => item.path === '/')?.children ?? []);
const userInitial = computed(() => (userStore.userInfo?.nickName?.slice(0, 1) || 'A').toUpperCase());

/** 面包屑数据：[控制面板, 当前页面] */
const breadcrumbs = computed(() => {
	const items: { title: string; path?: string }[] = [{ title: '控制面板', path: '/' }];

	if (route.meta.title && route.meta.title !== '控制面板') {
		items.push({ title: String(route.meta.title), path: route.path });
	}

	return items;
});

const iconMap = {
	Calendar,
	Document,
	Setting,
	Tickets,
	Collection,
	User
};

function toggleCollapse() {
	collapsed.value = !collapsed.value;
}

function normalizeMenuPath(path = '') {
	return path.startsWith('/') ? path : `/${path}`;
}

function getVisibleChildren(routeItem: RouteRecordRaw) {
	return (routeItem.children ?? []).filter((child) => !child.meta?.hidden);
}

function resolveChildMenuPath(parentPath = '', childPath = '') {
	const normalizedParentPath = normalizeMenuPath(parentPath).replace(/\/$/, '');
	if (!childPath) return normalizedParentPath;
	return `${normalizedParentPath}/${childPath}`.replace(/\/+/g, '/');
}

function handleParentMenuClick(routeItem: RouteRecordRaw) {
	router.push(normalizeMenuPath(routeItem.path));
}

function handleToggleTheme() {
	themeMode.value = toggleTheme(themeMode.value);
}

async function handleLogout() {
	await userStore.logout();
	ElMessage.success('已退出登录');
	router.push('/login');
}

function getAdminInfo() {
	!userStore.userInfo && userStore.getAdminInfo();
}

onMounted(() => {
	getAdminInfo();
});
</script>

<style scoped>
.admin-layout {
	background: var(--app-bg);
}

.admin-layout__aside {
	border-right: 1px solid var(--app-border);
	background: var(--app-surface);
}

.admin-layout__brand {
	border-bottom: 1px solid var(--app-border);
}

.admin-layout__title {
	color: var(--app-text);
}

.admin-layout__header {
	border-bottom: 1px solid var(--app-border);
	background: var(--app-surface);
}

.admin-layout__subtitle {
	color: var(--app-text-secondary);
}

.admin-layout__user-trigger {
	color: var(--app-text);
}

.admin-layout__user-trigger:hover {
	background: var(--app-hover);
}

.admin-layout__user-name {
	color: var(--app-text);
}

.admin-menu {
	--el-menu-item-height: 48px;
}

.admin-menu__submenu-title {
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
}
</style>
