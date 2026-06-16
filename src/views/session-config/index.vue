<template>
	<div class="admin-page">
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<el-button type="primary" :icon="Plus" @click="handleAdd">添加场次</el-button>
				<el-button type="success" :icon="Plus" @click="handleBatchAdd">批量添加</el-button>
			</div>
		</div>

		<div class="page-panel">
			<!-- 查询区域 -->
			<el-form :model="queryForm" inline>
				<el-form-item label="开始日期">
					<el-date-picker
						v-model="queryForm.startDate"
						type="date"
						placeholder="选择开始日期"
						value-format="YYYY-MM-DD"
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
						clearable
						style="width: 170px"
					/>
				</el-form-item>
				<div>
					<el-form-item>
						<el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
						<el-button @click="handleReset">重置</el-button>
					</el-form-item>
				</div>
			</el-form>

			<!-- 场次表格 -->
			<!-- <el-table v-loading="tableLoading" :data="tableData" border stripe style="width: 100%">
				<el-table-column type="index" label="序号" width="60" align="center" />
				<el-table-column prop="date" label="日期" min-width="120" />
				<el-table-column prop="startTime" label="开始时间" min-width="100" align="center" />
				<el-table-column prop="endTime" label="结束时间" min-width="100" align="center" />
			<el-table-column prop="totalCount" label="总号数" min-width="90" align="center" />
			<el-table-column prop="guideCount" label="需要讲解服务人数" min-width="120" align="center">
				<template #default="{ row }">
					<span>{{ row.guideCount ?? '-' }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="remainCount" label="余号" min-width="90" align="center">
					<template #default="{ row }">
						<el-tag :type="row.remainCount === 0 ? 'danger' : row.remainCount < 10 ? 'warning' : 'success'">
							{{ row.remainCount }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="createdAt" label="创建时间" min-width="160" />
				<el-table-column prop="operator" label="操作人" min-width="90" align="center" />
				<el-table-column label="操作" min-width="200" align="center" fixed="right">
					<template #default="{ row }">
						<el-button type="primary" link size="small" @click="handleResetCount(row)">余号清零</el-button>
						<el-divider direction="vertical" />
						<el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
						<el-divider direction="vertical" />
						<el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table> -->

			<my-table v-loading="tableLoading" :data="tableData" :columns="columns">
				<template #surplusNumber="{ row }">
					<el-tag :type="row.surplusNumber === 0 ? 'danger' : row.surplusNumber < 10 ? 'warning' : 'success'">
						{{ row.surplusNumber }}
					</el-tag>
				</template>

				<template #action="{ row }">
					<el-button type="primary" link size="small" @click="handleResetCount(row)">余号清零</el-button>
					<el-divider direction="vertical" />
					<el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
					<el-divider direction="vertical" />
					<el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
				</template>
			</my-table>
		</div>

		<!-- 添加场次弹窗 -->
		<el-dialog
			v-model="dialogVisible"
			:title="dialogTitle"
			width="520px"
			destroy-on-close
			@close="handleDialogClose"
		>
			<el-form ref="formRef" :model="formData" :rules="rules" label-width="90px" class="pt-2">
				<el-form-item label="日期" prop="date">
					<el-date-picker
						v-model="formData.date"
						type="date"
						placeholder="选择日期"
						value-format="YYYY-MM-DD"
						:disabled-date="disablePastDate"
						style="width: 100%"
					/>
				</el-form-item>
				<el-form-item label="时间段" prop="timeSlot">
					<el-select v-model="formData.timeSlot" placeholder="请选择时间段" style="width: 100%">
						<el-option
							v-for="opt in timeSlotOptions"
							:key="opt.value"
							:label="opt.label"
							:value="opt.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="总号数" prop="totalCount">
					<el-input-number
						v-model="formData.totalCount"
						:min="1"
						:max="9999"
						placeholder="请输入总号数"
						style="width: 100%"
					/>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
			</template>
		</el-dialog>

		<!-- 批量添加场次弹窗 -->
		<el-dialog
			v-model="batchDialogVisible"
			title="批量添加场次"
			width="560px"
			destroy-on-close
			@close="handleBatchDialogClose"
		>
			<el-form ref="batchFormRef" :model="batchFormData" :rules="batchRules" label-width="90px" class="pt-2">
				<el-form-item label="日期范围" prop="dateRange">
					<el-date-picker
						v-model="batchFormData.dateRange"
						type="daterange"
						range-separator="至"
						start-placeholder="开始日期"
						end-placeholder="结束日期"
						value-format="YYYY-MM-DD"
						:disabled-date="disablePastDate"
						style="width: 100%"
					/>
				</el-form-item>
				<el-form-item label="时间段" prop="timeSlots">
					<el-checkbox-group v-model="batchFormData.timeSlots">
						<el-checkbox
							v-for="opt in timeSlotOptions"
							:key="opt.value"
							:label="opt.value"
							:value="opt.value"
						>
							{{ opt.label }}
						</el-checkbox>
					</el-checkbox-group>
					<div class="mt-1 text-xs text-slate-400">可多选，每个选中日期 × 选中时间段 = 生成场次数</div>
				</el-form-item>
				<el-form-item label="总号数" prop="totalCount">
					<el-input-number
						v-model="batchFormData.totalCount"
						:min="1"
						:max="9999"
						placeholder="请输入总号数"
						style="width: 100%"
					/>
				</el-form-item>
				<!-- 预览 -->
				<el-form-item label="预览" v-if="batchPreview.length > 0">
					<div class="max-h-48 overflow-y-auto rounded border border-slate-200 p-3">
						<div
							v-for="(item, idx) in batchPreview"
							:key="idx"
							class="flex items-center justify-between py-1 text-sm"
						>
							<span class="text-slate-600">{{ item.date }} {{ item.timeLabel }}</span>
							<el-tag size="small">{{ item.totalCount }} 号</el-tag>
						</div>
						<div class="mt-2 border-t border-slate-100 pt-2 text-sm font-medium text-primary">
							共 {{ batchPreview.length }} 场次
						</div>
					</div>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="batchDialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="batchSubmitLoading" @click="handleBatchSubmit"
					>确认添加 ({{ batchPreview.length }})</el-button
				>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { Plus, Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import MyTable from '@/components/MyTable/index.vue';
import type { TableColumn } from '@/components/MyTable/types';
import {
	getAllScienceConfigurationApi,
	searchScienceConfigurationApi,
	addScienceConfigurationApi,
	batchAddScienceConfigurationApi,
	updateScienceConfigurationApi,
	zeroClearingConfigurationApi,
	deleteScienceConfigurationApi
} from '@/api/admin';

import { type SessionRow } from '@/types/SessionInfo';
import { useUserStore } from '@/stores/modules/user';

const userStore = useUserStore();

const columns: TableColumn[] = [
	// {
	// 	type: 'index',
	// 	label: '序号',
	// 	slot: false,
	// 	width: 60,
	// 	align: 'center'
	// },
	{
		label: '场次id',
		prop: 'configId',
		slot: false,
		minWidth: 70,
		align: 'center'
	},
	{
		label: '日期',
		prop: 'dateTime',
		slot: false,
		minWidth: 120
	},
	{
		label: '开始时间',
		prop: 'startTime',
		slot: false,
		minWidth: 100,
		align: 'center'
	},
	{
		label: '结束时间',
		prop: 'endTime',
		slot: false,
		minWidth: 100,
		align: 'center'
	},
	{
		label: '总号数',
		prop: 'totalNumber',
		slot: false,
		minWidth: 90,
		align: 'center'
	},
	{
		label: '需要讲解服务人数',
		prop: 'expound',
		slot: false,
		minWidth: 120,
		align: 'center'
	},
	{
		label: '余号',
		prop: 'surplusNumber',
		slot: true,
		minWidth: 90,
		align: 'center'
	},
	{
		label: '创建时间',
		prop: 'createTime',
		slot: false,
		minWidth: 160
	},
	{
		label: '操作人',
		prop: 'operatorName',
		slot: false,
		minWidth: 90,
		align: 'center'
	},
	{
		label: '操作',
		prop: 'action',
		slot: true,
		minWidth: 200,
		align: 'center',
		fixed: 'right'
	}
];

/* 查询条件 */
const queryForm = ref({
	startDate: '' as string,
	endDate: '' as string
});

/** 表格展示数据（默认全部，查询后为过滤结果） */
const tableData = ref<SessionRow[]>([]);
const tableLoading = ref(false);

async function fetchSessions() {
	tableLoading.value = true;

	try {
		const { data = [] } = await getAllScienceConfigurationApi();
		tableData.value = data;
	} finally {
		tableLoading.value = false;
	}
}

/* ========== 添加场次弹窗 ========== */

const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const editId = ref<number | null>(null);

/** 固定时间段选项 */
const timeSlotOptions = [
	{ label: '09:00 - 10:30', value: '09:00-10:30' },
	{ label: '10:30 - 12:00', value: '10:30-12:00' },
	{ label: '14:30 - 16:00', value: '14:30-16:00' },
	{ label: '16:00 - 17:00', value: '16:00-17:00' }
];

/** 表单数据 */
const formData = reactive({
	date: '',
	timeSlot: '' as string,
	totalCount: undefined as number | undefined
});

/** 表单校验规则 */
const rules = reactive<FormRules>({
	date: [{ required: true, message: '请选择日期', trigger: 'change' }],
	timeSlot: [{ required: true, message: '请选择时间段', trigger: 'change' }],
	totalCount: [
		{ required: true, message: '请输入总号数', trigger: 'blur' },
		{ type: 'number', min: 1, message: '总号数必须大于 0', trigger: 'blur' }
	]
});

/** 弹窗标题（新增 / 编辑） */
const dialogTitle = computed(() => (editId.value ? '编辑场次' : '添加场次'));

/** 打开添加弹窗 */
function handleAdd() {
	editId.value = null;
	dialogVisible.value = true;
}

/** 打开编辑弹窗，回填数据 */
function handleEdit(row: SessionRow) {
	editId.value = row.configId;
	formData.date = row.dateTime;
	formData.timeSlot = `${row.startTime}-${row.endTime}`;
	formData.totalCount = row.totalNumber;
	dialogVisible.value = true;
}

/** 关闭弹窗时重置表单 */
function handleDialogClose() {
	formRef.value?.resetFields();
	editId.value = null;
}

/** 提交（新增 / 编辑） */
async function handleSubmit() {
	const valid = await formRef.value?.validate().catch(() => false);
	if (!valid) return;

	submitLoading.value = true;

	try {
		const [startTime, endTime] = formData.timeSlot.split('-');

		/* 编辑模式：更新已有数据 */
		if (editId.value) {
			const target = tableData.value.find((r) => r.configId === editId.value);

			if (target) {
				target.dateTime = formData.date;
				target.startTime = startTime;
				target.endTime = endTime;
				target.totalNumber = formData.totalCount!;
				updateScienceConfigurationApi({
					configId: editId.value,
					dateTime: formData.date,
					startTime,
					endTime,
					totalNumber: formData.totalCount!,
					operatorName: userStore.userInfo?.nickName || '当前用户'
				}).then((res) => {
					fetchSessions();
					dialogVisible.value = false;
					ElMessage.success(res.message);
				});
			}
			return;
		}

		addScienceConfigurationApi({
			dateTime: formData.date,
			startTime,
			endTime,
			totalNumber: formData.totalCount!,
			operatorName: userStore.userInfo?.nickName || '当前用户'
		}).then((res) => {
			fetchSessions();
			dialogVisible.value = false;
			ElMessage.success(res.message);
		});
	} finally {
		submitLoading.value = false;
	}
}

/** 点击查询：按日期范围过滤 */
async function handleSearch() {
	const { startDate, endDate } = queryForm.value;

	if (!startDate && !endDate) {
		await fetchSessions();
		return;
	}

	const { data = [] } = await searchScienceConfigurationApi({ startDate, endDate });
	tableData.value = data;
}

/** 重置查询条件与数据 */
function handleReset() {
	queryForm.value.startDate = '';
	queryForm.value.endDate = '';
	fetchSessions();
}

/** 余号清零 */
async function handleResetCount(row: SessionRow) {
	try {
		await ElMessageBox.confirm(`确认清零 ${row.dateTime} ${row.startTime}-${row.endTime} 的场次吗？`, '清零确认', {
			confirmButtonText: '确定清零',
			cancelButtonText: '取消',
			type: 'warning',
			confirmButtonClass: 'el-button--danger'
		});

		const idx = tableData.value.findIndex((r) => r.configId === row.configId);

		if (tableData.value[idx].surplusNumber === 0) {
			ElMessage.warning('余号已清零');
			return;
		}

		if (idx > -1) {
			zeroClearingConfigurationApi({ configId: row.configId }).then((res) => {
				fetchSessions();
				ElMessage.success(res.message);
			});
		}
	} catch {
		// 用户取消，不做操作
	}
}

/** 删除场次 */
async function handleDelete(row: SessionRow) {
	try {
		await ElMessageBox.confirm(`确认删除 ${row.dateTime} ${row.startTime}-${row.endTime} 的场次吗？`, '删除确认', {
			confirmButtonText: '确定删除',
			cancelButtonText: '取消',
			type: 'warning',
			confirmButtonClass: 'el-button--danger'
		});

		const idx = tableData.value.findIndex((r) => r.configId === row.configId);
		if (idx > -1) {
			deleteScienceConfigurationApi({ configId: row.configId }).then((res) => {
				fetchSessions();
				ElMessage.success(res.message);
			});
		}
	} catch {
		// 用户取消，不做操作
	}
}

/* ========== 批量添加场次 ========== */

const batchDialogVisible = ref(false);
const batchFormRef = ref<FormInstance>();
const batchSubmitLoading = ref(false);

/** 批量表单数据 */
const batchFormData = reactive({
	dateRange: [] as string[],
	timeSlots: [] as string[],
	totalCount: undefined as number | undefined
});

/** 批量表单校验规则 */
const batchRules = reactive<FormRules>({
	dateRange: [{ required: true, message: '请选择日期范围', trigger: 'change' }],
	timeSlots: [{ type: 'array', required: true, min: 1, message: '请至少选择一个时间段', trigger: 'change' }],
	totalCount: [
		{ required: true, message: '请输入总号数', trigger: 'blur' },
		{ type: 'number', min: 1, message: '总号数必须大于 0', trigger: 'blur' }
	]
});

/** 预览列表：根据日期范围 × 时间段生成预览数据 */
interface BatchPreviewItem {
	date: string;
	timeSlot: string;
	timeLabel: string;
	totalCount: number;
}

const batchPreview = ref<BatchPreviewItem[]>([]);

function disablePastDate(date: Date) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return date.getTime() < today.getTime();
}

/** 监听批量表单变化，实时更新预览 */
watch(
	() => [batchFormData.dateRange, batchFormData.timeSlots, batchFormData.totalCount],
	() => {
		batchPreview.value = generateBatchPreview();
	},
	{ deep: true }
);

function generateBatchPreview(): BatchPreviewItem[] {
	const { dateRange, timeSlots, totalCount } = batchFormData;

	if (!dateRange || dateRange.length !== 2 || !timeSlots || timeSlots.length === 0 || !totalCount) {
		return [];
	}

	const [startStr, endStr] = dateRange;
	const start = new Date(startStr);
	const end = new Date(endStr);

	if (start > end) return [];

	const result: BatchPreviewItem[] = [];
	const current = new Date(start);

	while (current <= end) {
		const dateStr = formatDate(current);
		for (const slot of timeSlots) {
			const label = timeSlotOptions.find((o) => o.value === slot)?.label ?? slot;
			result.push({ date: dateStr, timeSlot: slot, timeLabel: label, totalCount });
		}
		current.setDate(current.getDate() + 1);
	}

	return result;
}

/** 日期格式化 YYYY-MM-DD */
function formatDate(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

/** 打开批量添加弹窗 */
function handleBatchAdd() {
	batchDialogVisible.value = true;
}

/** 关闭批量添加弹窗时重置 */
function handleBatchDialogClose() {
	batchFormRef.value?.resetFields();
	batchPreview.value = [];
}

/** 提交批量添加 */
async function handleBatchSubmit() {
	const valid = await batchFormRef.value?.validate().catch(() => false);
	if (!valid) return;

	if (batchPreview.value.length === 0) return;

	batchSubmitLoading.value = true;

	try {
		const [startDate, endDate] = batchFormData.dateRange;
		const startTimes = batchFormData.timeSlots.map((slot) => slot.split('-')[0] ?? '');
		const endTimes = batchFormData.timeSlots.map((slot) => slot.split('-')[1] ?? '');

		const res = await batchAddScienceConfigurationApi({
			startDate,
			endDate,
			startTimes,
			endTimes,
			totalNumber: batchFormData.totalCount as number,
			operatorName: userStore.userInfo?.nickName || '当前用户'
		});

		ElMessage.success(res.message || `成功批量添加 ${batchPreview.value.length} 场次`);
		await fetchSessions();
		batchDialogVisible.value = false;
	} finally {
		batchSubmitLoading.value = false;
	}
}

onMounted(() => {
	fetchSessions();
});
</script>
