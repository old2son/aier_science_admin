<template>
	<div class="admin-page">
		<div class="page-panel">
			<my-table v-loading="tableLoading" :data="tableData" :columns="columns">
				<template #activitySatisfied="{ row }">
					<el-tag :type="getSatisfactionType(row.activitySatisfied)">
						{{ getSatisfactionLabel(row.activitySatisfied) }}
					</el-tag>
				</template>

				<template #facSatisfied="{ row }">
					<el-tag :type="getSatisfactionType(row.facSatisfied)">
						{{ getSatisfactionLabel(row.facSatisfied) }}
					</el-tag>
				</template>

				<template #resSatisfied="{ row }">
					<el-tag :type="getSatisfactionType(row.resSatisfied)">
						{{ getSatisfactionLabel(row.resSatisfied) }}
					</el-tag>
				</template>

				<template #other="{ row }">
					<span>{{ row.other || '-' }}</span>
				</template>

				<template #recommend="{ row }">
					<span>{{ row.recommend || '-' }}</span>
				</template>
			</my-table>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';
import type { TableColumn } from '@/components/MyTable/types';
import MyTable from '@/components/MyTable/index.vue';
import { getAllUserFeedbackApi } from '@/api/admin';
import type { Feedback } from '@/types/Feedback';

const columns: TableColumn[] = [
	{
		label: '姓名',
		prop: 'name',
		slot: false,
		minWidth: 100
	},
	{
		label: '手机号',
		prop: 'phone',
		slot: false,
		minWidth: 130
	},
	{
		label: '活动满意度',
		prop: 'activitySatisfied',
		slot: true,
		minWidth: 110,
		align: 'center'
	},
	{
		label: '讲解服务满意度',
		prop: 'resSatisfied',
		slot: true,
		minWidth: 130,
		align: 'center'
	},
	{
		label: '场馆设施满意度',
		prop: 'facSatisfied',
		slot: true,
		minWidth: 130,
		align: 'center'
	},
	{
		label: '其他意见',
		prop: 'other',
		slot: true,
		minWidth: 220,
		showOverflowTooltip: true
	},
	{
		label: '推荐内容',
		prop: 'recommend',
		slot: true,
		minWidth: 220,
		showOverflowTooltip: true
	},
	{
		label: '提交时间',
		prop: 'createTime',
		slot: false,
		minWidth: 170
	}
];

const tableData = ref<Feedback[]>([]);
const tableLoading = ref(false);

function getSatisfactionLabel(value: number | string) {
	const normalizedValue = Number(value);

	if (normalizedValue >= 5) return '非常满意';
	if (normalizedValue >= 4) return '满意';
	if (normalizedValue >= 3) return '一般';
	if (normalizedValue >= 2) return '不满意';
	if (normalizedValue >= 1) return '非常不满意';

	return String(value || '-');
}

function getSatisfactionType(value: number | string): '' | 'success' | 'warning' | 'danger' | 'info' {
	const normalizedValue = Number(value);

	if (normalizedValue >= 4) return 'success';
	if (normalizedValue === 3) return 'warning';
	if (normalizedValue > 0) return 'danger';

	return 'info';
}

async function fetchFeedbackList() {
	tableLoading.value = true;

	try {
		const { data = [] } = await getAllUserFeedbackApi();
		tableData.value = data;
	} catch (error) {
		ElMessage.error((error as Error).message || '获取意见反馈失败');
	} finally {
		tableLoading.value = false;
	}
}

onMounted(() => {
	fetchFeedbackList();
});
</script>

<style scoped></style>
