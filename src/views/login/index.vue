<template>
	<div class="grid min-h-screen bg-slate-100 lg:grid-cols-[1fr_420px]">
		<section
			class="hidden bg-[linear-gradient(135deg,#e8f3ff_0%,#f7fafc_48%,#dff7ef_100%)] p-10 lg:flex lg:flex-col lg:justify-between"
		>
			<div class="text-xl font-semibold text-slate-900">Aier Admin</div>
			<div class="max-w-xl">
				<h1 class="text-5xl font-semibold leading-tight text-slate-950">高效、清晰、可扩展的后台管理体验</h1>
				<p class="mt-5 text-lg leading-8 text-slate-600">
					业务流程的可视化和管理,让你的后台管理更加简单、高效
				</p>
			</div>
			<div class="text-sm text-slate-500">Admin Starter</div>
		</section>

		<section class="flex items-center justify-center bg-white px-5">
			<div class="w-full max-w-sm">
				<div class="mb-8">
					<div
						class="mb-3 grid h-12 w-12 place-items-center rounded-lg bg-brand-600 text-lg font-bold text-white"
					>
						A
					</div>
					<h2 class="text-2xl font-semibold text-slate-950">登录后台</h2>
					<!-- <p class="mt-2 text-sm text-slate-500">默认账号 admin，密码 123456</p> -->
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
import { Lock, User } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useUserStore } from '@/stores/modules/user.ts';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const loading = ref(false);

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
	} finally {
		loading.value = false;
	}
}
</script>
