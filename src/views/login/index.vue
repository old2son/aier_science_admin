<template>
	<div class="login-page grid min-h-screen lg:grid-cols-[1fr_420px]">
		<section class="login-page__hero hidden p-10 lg:flex lg:flex-col lg:justify-between">
			<div class="text-xl font-semibold">爱尔科普馆后台管理</div>
			<div class="max-w-xl">
				<h1 class="login-page__hero-title text-5xl font-semibold leading-tight">
					高效、清晰、可扩展的后台管理体验
				</h1>
				<p class="login-page__hero-text mt-5 text-lg leading-8">
					业务流程的可视化和管理,让你的后台管理更加简单、高效
				</p>
			</div>
			<div class="login-page__hero-text text-sm">Copyright © 2026 爱尔科普馆</div>
		</section>

		<section class="login-page__panel flex items-center justify-center px-5">
			<div class="w-full max-w-sm">
				<div class="mb-8 flex items-start justify-between gap-4">
					<div>
						<!-- <div
						class="mb-3 grid h-12 w-12 place-items-center rounded-lg bg-brand-600 text-lg font-bold text-white"
					>
						A
					</div> -->
						<h2 class="login-page__title text-2xl font-semibold">登录后台</h2>
						<!-- <p class="mt-2 text-sm text-slate-500">默认账号 admin，密码 123456</p> -->
					</div>
					<el-button
						class="app-theme-button"
						:icon="themeMode === 'dark' ? Sunny : Moon"
						circle
						@click="handleToggleTheme"
					/>
				</div>

				<el-form class="space-y-4" @submit.prevent="handleLogin">
					<el-form-item>
						<el-input v-model="form.username" :prefix-icon="User" placeholder="账号" size="large" />
					</el-form-item>
					<el-form-item>
						<el-input
							v-model="form.password"
							:prefix-icon="Lock"
							placeholder="密码"
							show-password
							size="large"
							type="password"
						/>
					</el-form-item>
					<el-button class="w-full" native-type="submit" size="large" type="primary" :loading="loading">
						登录
					</el-button>
				</el-form>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { Lock, Moon, Sunny, User } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useUserStore } from '@/stores/modules/user';
import { getTheme, toggleTheme, type ThemeMode } from '@/utils/theme';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const loading = ref(false);
const themeMode = ref<ThemeMode>(getTheme());

const form = reactive({
	username: '',
	password: ''
});

async function handleLogin() {
	loading.value = true;

	try {
		await userStore.login(form.username, form.password);
		ElMessage.success('登录成功');
		router.replace((route.query.redirect as string) || '/session-config');
	} catch (error) {
		ElMessage.error((error as Error).message);
	} finally {
		loading.value = false;
	}
}

function handleToggleTheme() {
	themeMode.value = toggleTheme(themeMode.value);
}
</script>

<style scoped>
.login-page {
	background: var(--app-bg);
	color: var(--app-text);
}

.login-page__hero {
	background: var(--app-login-hero-bg);
	color: var(--app-text);
}

.login-page__hero-title,
.login-page__title {
	color: var(--app-text);
}

.login-page__hero-text {
	color: var(--app-text-secondary);
}

.login-page__panel {
	background: var(--app-login-side-bg);
}
</style>
