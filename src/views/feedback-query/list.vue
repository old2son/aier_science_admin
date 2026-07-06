<template>
	<div class="page-panel">
		<el-form :model="queryForm" inline>
			<div>
				<el-form-item>
					<!-- <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button> -->
					<!-- <el-button @click="handleReset">重置</el-button> -->
					<el-button type="success" :icon="Download" @click="handleExport">导出 Excel</el-button>
				</el-form-item>
			</div>
		</el-form>

		<my-table v-loading="tableLoading" :data="pagedTableData" :columns="columns">
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

			<template #recommend="{ row }">
				<el-tag :type="getRecommendType(row.recommend)">
					{{ getRecommendLabel(row.recommend) }}
				</el-tag>
			</template>

			<template #other="{ row }">
				<span>{{ row.other || '-' }}</span>
			</template>
		</my-table>

		<my-pagination
			v-model:current-page="pagination.currentPage"
			v-model:page-size="pagination.pageSize"
			:total="tableData.length"
		/>
	</div>
</template>

<script setup lang="ts">
import { Download } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, ref, reactive, computed } from 'vue';
import MyTable from '@/components/MyTable/index.vue';
import MyPagination from '@/components/MyPagination/index.vue';
import type { TableColumn } from '@/components/MyTable/types';
import { getAllUserFeedbackApi } from '@/api/admin';
import type { Feedback } from '@/types/Feedback';
import { exportExcel } from '@/utils/excel';

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
		label: '推荐内容',
		prop: 'recommend',
		slot: true,
		minWidth: 220,
		showOverflowTooltip: true
	},
	{
		label: '其他意见',
		prop: 'other',
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

/* 查询条件 */
const queryForm = ref({});

const tableData = ref<Feedback[]>([]);
const tableLoading = ref(false);
const pagination = reactive({
	currentPage: 1,
	pageSize: 10
});
const sortState = reactive<{
	prop: '' | 'createTime';
	order: '' | 'ascending' | 'descending';
}>({
	prop: '',
	order: ''
});

function parseDateTimeString(dateStr: string) {
	return new Date(dateStr.replace(' ', 'T')).getTime();
}

const sortedTableData = computed(() => {
	if (!sortState.prop || !sortState.order) {
		return tableData.value;
	}

	const sortFactor = sortState.order === 'ascending' ? 1 : -1;
	return [...tableData.value].sort((a, b) => {
		switch (sortState.prop) {
			case 'createTime':
				return (parseDateTimeString(a.createTime) - parseDateTimeString(b.createTime)) * sortFactor;
			default:
				return 0;
		}
	});
});

const pagedTableData = computed(() => {
	const start = (pagination.currentPage - 1) * pagination.pageSize;
	const end = start + pagination.pageSize;
	return sortedTableData.value.slice(start, end);
});

function getSatisfactionLabel(value: number | string) {
	const normalizedValue = Number(value);

	if (normalizedValue >= 5) return '很满意';
	if (normalizedValue >= 4) return '满意';
	if (normalizedValue >= 3) return '一般';
	if (normalizedValue >= 2) return '不满意';
	if (normalizedValue >= 1) return '很不满意';

	return String(value || '-');
}

function getSatisfactionType(value: number | string): '' | 'success' | 'warning' | 'danger' | 'info' {
	const normalizedValue = Number(value);

	if (normalizedValue >= 4) return 'success';
	if (normalizedValue === 3) return 'warning';
	if (normalizedValue > 0) return 'danger';

	return 'info';
}

const recommendLabelMap: Record<string, string> = {
	'1': '会主动推荐',
	'2': '当有人问起时，会给予正面评价',
	'3': '不会推荐',
	会主动推荐: '会主动推荐',
	'当有人问起时，会给予正面评价': '当有人问起时，会给予正面评价',
	不会推荐: '不会推荐'
};

function getRecommendLabel(value: number | string) {
	const normalizedValue = String(value ?? '').trim();
	return recommendLabelMap[normalizedValue] || normalizedValue || '-';
}

function getRecommendType(value: number | string): '' | 'success' | 'warning' | 'danger' | 'info' {
	const normalizedValue = String(value ?? '').trim();

	if (normalizedValue === '1' || normalizedValue === '会主动推荐') return 'success';
	if (normalizedValue === '2' || normalizedValue === '当有人问起时，会给予正面评价') return 'warning';
	if (normalizedValue === '3' || normalizedValue === '不会推荐') return 'info';

	return '';
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

function getExportRows(row: Feedback) {
	return [{ ...row }];
}

/** 导出 Excel */
async function handleExport() {
	if (!tableData.value.length) {
		ElMessage.warning('暂无可导出的数据');
		return;
	}

	const exportColumns = columns
		.filter((item) => item.prop && item.prop !== 'action')
		.map((item) => ({
			label: item.prop?.includes('Satisfied') ? `${item.label as string}（分数）` : (item.label as string),
			prop: item.prop as string,
			exportFormatter: item.exportFormatter
		}));

	let exportMode: 'current' | 'all' | null = null;

	await ElMessageBox.confirm('请选择导出范围', '导出 Excel', {
		confirmButtonText: '导出当前页',
		cancelButtonText: '导出全部',
		distinguishCancelAndClose: true,
		closeOnClickModal: false,
		type: 'info'
	})
		.then(() => {
			exportMode = 'current';
		})
		.catch((action: 'cancel' | 'close') => {
			if (action === 'cancel') {
				exportMode = 'all';
			}
		});

	if (!exportMode) return;

	const sourceData = exportMode === 'current' ? pagedTableData.value : tableData.value;
	const exportData = sourceData.flatMap((row) => getExportRows(row));

	try {
		exportExcel(exportColumns, exportData, exportMode === 'current' ? '意见反馈查询-当前页' : '意见反馈查询');

		ElMessage.success('导出成功');
	} catch (error) {
		console.error(error);
		ElMessage.error('导出失败');
	}
}

onMounted(() => {
	fetchFeedbackList();
});
</script>
