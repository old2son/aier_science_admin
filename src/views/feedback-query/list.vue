<template>
	<div class="page-panel">
		<el-form :model="queryForm" inline>
			<el-form-item label="开始日期">
				<el-date-picker
					v-model="queryForm.startDate"
					type="date"
					placeholder="选择开始日期"
					value-format="YYYY-MM-DD"
					:disabled-date="disableQueryStartDate"
					clearable
					style="width: 170px"
				/>
			</el-form-item>
			<el-form-item label="结束日期">
				<el-date-picker
					v-model="queryForm.endDate"
					type="date"
					placeholder="选择结束日期"
					value-format="YYYY-MM-DD"
					:disabled-date="disableQueryEndDate"
					clearable
					style="width: 170px"
				/>
			</el-form-item>
			<div>
				<el-form-item>
					<el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
					<el-button @click="handleReset">重置</el-button>
					<el-button type="success" :icon="Download" @click="handleExport">导出 Excel</el-button>
				</el-form-item>
			</div>
		</el-form>

		<my-table v-loading="tableLoading" :data="pagedTableData" :columns="columns" :row-class-name="getRowClassName">
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

			<template #action="{ row }">
				<el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
				<el-divider direction="vertical" />
				<el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
			</template>
		</my-table>

		<my-pagination
			v-model:current-page="pagination.currentPage"
			v-model:page-size="pagination.pageSize"
			:total="tableData.length"
		/>

		<el-dialog v-model="dialogVisible" title="编辑意见反馈" width="420px" destroy-on-close @closed="handleDialogClosed">
			<el-form ref="formRef" :model="editForm" :rules="formRules" label-width="90px">
				<el-form-item label="姓名">
					<span>{{ currentEditRow?.name || '-' }}</span>
				</el-form-item>
				<el-form-item label="手机号">
					<span>{{ currentEditRow?.phone || '-' }}</span>
				</el-form-item>
				<el-form-item label="反馈状态" prop="status">
					<el-radio-group v-model="editForm.status">
						<el-radio :value="0">正常反馈</el-radio>
						<el-radio :value="1">无效反馈</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>

			<template #footer>
				<div class="flex justify-end gap-3">
					<el-button @click="dialogVisible = false">取消</el-button>
					<el-button type="primary" :loading="editSubmitting" @click="handleConfirmEdit">保存</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { Download, Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import { deleteUserFeedbackApi, getAllUserFeedbackApi, searchUserFeedbackApi, updateUserFeedbackApi } from '@/api/admin';
import MyPagination from '@/components/MyPagination/index.vue';
import MyTable from '@/components/MyTable/index.vue';
import type { TableColumn } from '@/components/MyTable/types';
import type { Feedback } from '@/types/Feedback';
import { getDefaultQueryDateRange } from '@/utils/date';
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
	},
	{
		label: '操作',
		prop: 'action',
		slot: true,
		minWidth: 120,
		align: 'center',
		fixed: 'right'
	}
];

const queryForm = ref({
	...getDefaultQueryDateRange(7)
});
const tableData = ref<Feedback[]>([]);
const tableLoading = ref(false);
const dialogVisible = ref(false);
const editSubmitting = ref(false);
const formRef = ref<FormInstance>();
const currentEditRow = ref<Feedback | null>(null);

const pagination = reactive({
	currentPage: 1,
	pageSize: 10
});

const editForm = reactive({
	feedId: 0,
	status: 0 as 0 | 1
});

const formRules: FormRules<typeof editForm> = {
	status: [{ required: true, message: '请选择反馈状态', trigger: 'change' }]
};

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

function parseDateString(dateStr: string) {
	const [year, month, day] = dateStr.split('-').map(Number);
	return new Date(year, (month || 1) - 1, day || 1);
}

function disableQueryStartDate(date: Date) {
	if (!queryForm.value.endDate) return false;
	return date.getTime() > parseDateString(queryForm.value.endDate).getTime();
}

function disableQueryEndDate(date: Date) {
	if (!queryForm.value.startDate) return false;
	return date.getTime() < parseDateString(queryForm.value.startDate).getTime();
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

function getSatisfactionType(value: number | string): 'primary' | 'success' | 'warning' | 'danger' | 'info' | undefined {
	const normalizedValue = Number(value);

	if (normalizedValue >= 4) return 'success';
	if (normalizedValue === 3) return 'warning';
	if (normalizedValue > 0) return 'danger';

	return undefined;
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

function getRecommendType(value: number | string): 'primary' | 'success' | 'warning' | 'danger' | 'info' | undefined {
	const normalizedValue = String(value ?? '').trim();

	if (normalizedValue === '1' || normalizedValue === '会主动推荐') return 'success';
	if (normalizedValue === '2' || normalizedValue === '当有人问起时，会给予正面评价') return 'warning';
	if (normalizedValue === '3' || normalizedValue === '不会推荐') return 'info';

	return undefined;
}

async function fetchFeedbackList(params?: { startDate?: string; endDate?: string }) {
	tableLoading.value = true;

	try {
		const hasQuery = Boolean(params?.startDate || params?.endDate);
		const response = hasQuery ? await searchUserFeedbackApi(params ?? {}) : await getAllUserFeedbackApi();
		const { data = [] } = response;
		tableData.value = data;
		pagination.currentPage = 1;
	} catch (error) {
		ElMessage.error((error as Error).message || '获取意见反馈失败');
	} finally {
		tableLoading.value = false;
	}
}

function getRowClassName({ row }: { row: Feedback; rowIndex: number }) {
	return Number(row.status ?? 0) === 1 ? 'feedback-invalid-row' : '';
}

function handleSearch() {
	const { startDate, endDate } = queryForm.value;

	if (startDate && endDate && parseDateString(startDate).getTime() > parseDateString(endDate).getTime()) {
		ElMessage.warning('开始日期不可大于结束日期');
		return;
	}

	fetchFeedbackList(queryForm.value);
}

function handleReset() {
	queryForm.value = {
		...getDefaultQueryDateRange(7)
	};
	fetchFeedbackList(queryForm.value);
}

function handleEdit(row: Feedback) {
	currentEditRow.value = row;
	editForm.feedId = row.feedId;
	editForm.status = Number(row.status ?? 0) === 1 ? 1 : 0;
	dialogVisible.value = true;
}

function handleDialogClosed() {
	currentEditRow.value = null;
	editForm.feedId = 0;
	editForm.status = 0;
	formRef.value?.clearValidate();
}

async function handleConfirmEdit() {
	if (!formRef.value) return;

	const valid = await formRef.value.validate().catch(() => false);
	if (!valid) return;

	editSubmitting.value = true;

	try {
		const res = await updateUserFeedbackApi({
			feedId: editForm.feedId,
			status: editForm.status
		});
		ElMessage.success(res.message || '修改成功');
		dialogVisible.value = false;
		await fetchFeedbackList();
	} catch (error) {
		ElMessage.error((error as Error).message || '修改失败');
	} finally {
		editSubmitting.value = false;
	}
}

async function handleDelete(row: Feedback) {
	try {
		await ElMessageBox.confirm('确认删除这条意见反馈吗？删除后不可恢复。', '删除确认', {
			confirmButtonText: '确定删除',
			cancelButtonText: '取消',
			type: 'warning',
			confirmButtonClass: 'el-button--danger'
		});

		const res = await deleteUserFeedbackApi({ feedId: row.feedId });
		ElMessage.success(res.message || '删除成功');
		await fetchFeedbackList();
	} catch (error) {
		if (error === 'cancel' || error === 'close') return;
		ElMessage.error((error as Error).message || '删除失败');
	}
}

function getExportRows(row: Feedback) {
	return [{ ...row }];
}

function isValidFeedback(row: Feedback) {
	return Number(row.status ?? 0) !== 1;
}

async function handleExport() {
	const validTableData = tableData.value.filter(isValidFeedback);
	const validPagedTableData = pagedTableData.value.filter(isValidFeedback);

	if (!validTableData.length) {
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

	const sourceData = exportMode === 'current' ? validPagedTableData : validTableData;
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
	fetchFeedbackList(queryForm.value);
});
</script>

<style scoped>
:deep(.feedback-invalid-row) {
	color: var(--el-text-color-placeholder);
}

:deep(.feedback-invalid-row .el-tag) {
	--el-tag-bg-color: var(--el-fill-color-light);
	--el-tag-border-color: var(--el-border-color-light);
	--el-tag-text-color: var(--el-text-color-placeholder);
}

:deep(.feedback-invalid-row .el-button.is-link) {
	color: var(--el-text-color-placeholder);
}
</style>
