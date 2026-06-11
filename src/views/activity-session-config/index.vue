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
						<el-button type="success" :icon="Download" @click="handleExport">导出 Excel</el-button>
					</el-form-item>
				</div>
			</el-form>

			<!-- 活动场次表格 -->
			<!-- <el-table v-loading="tableLoading" :data="tableData" border stripe style="width: 100%">
				<el-table-column type="index" label="序号" width="60" align="center" />
				<el-table-column prop="title" label="活动标题" min-width="160" show-overflow-tooltip />
				<el-table-column prop="background" label="活动背景" min-width="180" show-overflow-tooltip />
				<el-table-column prop="location" label="活动地点" min-width="140" show-overflow-tooltip />
				<el-table-column prop="startDate" label="开始日期" min-width="100" />
				<el-table-column prop="endDate" label="结束日期" min-width="100" />
				<el-table-column prop="startTime" label="开始时间" min-width="100" align="center" />
				<el-table-column prop="endTime" label="结束时间" min-width="100" align="center" />
				<el-table-column prop="totalCount" label="总号数" min-width="80" align="center" />
				<el-table-column prop="remainCount" label="余号" min-width="80" align="center">
					<template #default="{ row }">
						<el-tag :type="row.remainCount === 0 ? 'danger' : row.remainCount < 10 ? 'warning' : 'success'">
							{{ row.remainCount }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="createdAt" label="创建时间" min-width="160" />
				<el-table-column prop="operator" label="操作人" min-width="90" align="center" />
				<el-table-column label="操作" min-width="180" align="center" fixed="right">
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
				<template #remainCount="{ row }">
					<el-tag :type="row.remainCount === 0 ? 'danger' : row.remainCount < 10 ? 'warning' : 'success'">
						{{ row.remainCount }}
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

		<!-- 添加/编辑场次弹窗 -->
		<el-dialog
			v-model="dialogVisible"
			:title="dialogTitle"
			width="560px"
			destroy-on-close
			@close="handleDialogClose"
		>
			<el-form ref="formRef" :model="formData" :rules="rules" label-width="90px" class="pt-2">
				<el-form-item label="活动标题" prop="title">
					<el-input v-model="formData.title" placeholder="请输入活动标题" clearable />
				</el-form-item>
				<el-form-item label="活动背景" prop="background">
					<el-input
						v-model="formData.background"
						type="textarea"
						:rows="3"
						placeholder="请输入活动背景介绍"
					/>
				</el-form-item>
				<el-form-item label="活动 KV">
					<el-upload
						class="kv-uploader"
						action="#"
						:show-file-list="false"
						:before-upload="handleBeforeUpload"
						:http-request="handleUploadKV"
						accept="image/*"
					>
						<img v-if="formData.coverUrl" :src="formData.coverUrl" class="kv-preview" />
						<div v-else class="kv-placeholder">
							<el-icon class="text-2xl text-slate-400"><Plus /></el-icon>
							<span class="mt-1 text-xs text-slate-400">上传活动 KV</span>
						</div>
					</el-upload>
					<div class="mt-1 text-xs text-slate-400">建议尺寸 750×420，JPG/PNG，≤2MB</div>
				</el-form-item>
				<el-form-item label="活动地点">
					<el-input v-model="formData.location" placeholder="请输入活动地点（选填）" clearable />
				</el-form-item>
				<el-form-item label="开始日期" prop="startDate">
					<el-date-picker
						v-model="formData.startDate"
						type="date"
						placeholder="选择开始日期"
						value-format="YYYY-MM-DD"
						style="width: 100%"
					/>
				</el-form-item>
				<el-form-item label="结束日期" prop="endDate">
					<el-date-picker
						v-model="formData.endDate"
						type="date"
						placeholder="选择结束日期"
						value-format="YYYY-MM-DD"
						style="width: 100%"
					/>
				</el-form-item>
				<el-form-item label="开始时间" prop="startTime">
					<el-time-picker
						v-model="formData.startTime"
						placeholder="选择开始时间"
						format="HH:mm"
						value-format="HH:mm"
						style="width: 100%"
					/>
				</el-form-item>
				<el-form-item label="结束时间" prop="endTime">
					<el-time-picker
						v-model="formData.endTime"
						placeholder="选择结束时间"
						format="HH:mm"
						value-format="HH:mm"
						style="width: 100%"
					/>
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
			width="600px"
			destroy-on-close
			@close="handleBatchDialogClose"
		>
			<el-form ref="batchFormRef" :model="batchFormData" :rules="batchRules" label-width="90px" class="pt-2">
				<el-form-item label="活动标题" prop="title">
					<el-input v-model="batchFormData.title" placeholder="请输入活动标题" clearable />
				</el-form-item>
				<el-form-item label="活动背景" prop="background">
					<el-input
						v-model="batchFormData.background"
						type="textarea"
						:rows="3"
						placeholder="请输入活动背景介绍"
					/>
				</el-form-item>
				<el-form-item label="活动 KV">
					<el-upload
						class="kv-uploader"
						action="#"
						:show-file-list="false"
						:before-upload="handleBeforeUpload"
						:http-request="handleBatchUploadKV"
						accept="image/*"
					>
						<img v-if="batchFormData.coverUrl" :src="batchFormData.coverUrl" class="kv-preview" />
						<div v-else class="kv-placeholder">
							<el-icon class="text-2xl text-slate-400"><Plus /></el-icon>
							<span class="mt-1 text-xs text-slate-400">上传活动 KV</span>
						</div>
					</el-upload>
					<div class="mt-1 text-xs text-slate-400">建议尺寸 750×420，JPG/PNG，≤2MB</div>
				</el-form-item>
				<el-form-item label="活动地点">
					<el-input v-model="batchFormData.location" placeholder="请输入活动地点（选填）" clearable />
				</el-form-item>
				<el-form-item label="日期范围" prop="dateRange">
					<el-date-picker
						v-model="batchFormData.dateRange"
						type="daterange"
						range-separator="至"
						start-placeholder="开始日期"
						end-placeholder="结束日期"
						value-format="YYYY-MM-DD"
						style="width: 100%"
					/>
				</el-form-item>
				<el-form-item label="开始时间" prop="startTime">
					<el-time-picker
						v-model="batchFormData.startTime"
						placeholder="选择开始时间"
						format="HH:mm"
						value-format="HH:mm"
						style="width: 100%"
					/>
				</el-form-item>
				<el-form-item label="结束时间" prop="endTime">
					<el-time-picker
						v-model="batchFormData.endTime"
						placeholder="选择结束时间"
						format="HH:mm"
						value-format="HH:mm"
						style="width: 100%"
					/>
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
import { Download, Plus, Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadRequestOptions } from 'element-plus';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import MyTable from '@/components/MyTable/index.vue';
import type { TableColumn } from '@/components/MyTable/types.ts';

import { getActivitySessionList, type ActivitySessionQuery, type ActivitySessionRow } from '@/api/science.ts';

let rawData: ActivitySessionRow[] = [];

const columns: TableColumn[] = [
	{
		type: 'index',
		label: '序号',
		slot: false,
		width: 60,
		align: 'center'
	},
	{
		label: '活动标题',
		prop: 'title',
		slot: false,
		minWidth: 160,
		showOverflowTooltip: true
	},
	{
		label: '活动背景',
		prop: 'background',
		slot: false,
		minWidth: 180,
		align: 'center',
		showOverflowTooltip: true
	},
	{
		label: '活动地点',
		prop: 'location',
		slot: false,
		minWidth: 140,
		showOverflowTooltip: true
	},
	{
		label: '开始日期',
		prop: 'startDate',
		slot: false,
		minWidth: 100
	},
	{
		label: '结束日期',
		prop: 'endDate',
		slot: false,
		minWidth: 100
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
		prop: 'totalCount',
		slot: false,
		minWidth: 80,
		align: 'center'
	},
	{
		label: '余号',
		prop: 'remainCount',
		slot: true,
		minWidth: 80,
		align: 'center'
	},
	{
		label: '创建时间',
		prop: 'createdAt',
		slot: false,
		minWidth: 160
	},
	{
		label: '操作人',
		prop: 'operator',
		slot: false,
		minWidth: 90,
		align: 'center'
	},
	{
		label: '操作',
		prop: 'action',
		slot: true,
		minWidth: 180,
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
const tableData = ref<ActivitySessionRow[]>([]);
const tableLoading = ref(false);

async function fetchSessions(params?: ActivitySessionQuery) {
	tableLoading.value = true;

	try {
		const list = await getActivitySessionList(params);
		rawData = list;
		tableData.value = [...list];
	} finally {
		tableLoading.value = false;
	}
}

/* ========== 添加/编辑场次弹窗 ========== */

const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const editId = ref<number | null>(null);

/** 表单数据 */
const formData = reactive({
	title: '',
	background: '',
	location: '',
	coverKey: '',
	coverUrl: '',
	startDate: '' as string,
	endDate: '' as string,
	startTime: '' as string,
	endTime: '' as string,
	totalCount: undefined as number | undefined
});

/** 表单校验规则 */
const rules = reactive<FormRules>({
	title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
	background: [{ required: true, message: '请输入活动背景', trigger: 'blur' }],
	startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
	endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
	startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
	endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
	totalCount: [
		{ required: true, message: '请输入总号数', trigger: 'blur' },
		{ type: 'number', min: 1, message: '总号数必须大于 0', trigger: 'blur' }
	]
});

/** 上传前校验 */
function handleBeforeUpload(file: File) {
	const isImage = file.type.startsWith('image/');
	const isLt5M = file.size / 1024 / 1024 < 2;
	if (!isImage) {
		ElMessage.error('只能上传图片文件！');
		return false;
	}
	if (!isLt5M) {
		ElMessage.error('图片大小不能超过 2MB！');
		return false;
	}
	return true;
}

/** 自定义上传：本地预览，实际项目替换为真实上传接口 */
function handleUploadKV(options: UploadRequestOptions) {
	const file = options.file;
	// 本地预览
	formData.coverUrl = URL.createObjectURL(file);
	// 模拟返回 key（真实项目中替换为接口返回的 key）
	formData.coverKey = `activity/kv/${Date.now()}_${file.name}`;
	ElMessage.success('图片上传成功（本地预览）');
}

/** 弹窗标题（新增 / 编辑） */
const dialogTitle = computed(() => (editId.value ? '编辑场次' : '添加场次'));

/** 打开添加弹窗 */
function handleAdd() {
	editId.value = null;
	dialogVisible.value = true;
}

/** 打开编辑弹窗，回填数据 */
function handleEdit(row: ActivitySessionRow) {
	editId.value = row.id;
	formData.title = row.title;
	formData.background = row.background;
	formData.location = row.location ?? '';
	formData.coverKey = row.coverKey ?? '';
	formData.coverUrl = '';
	formData.startDate = row.startDate;
	formData.endDate = row.endDate;
	formData.startTime = row.startTime;
	formData.endTime = row.endTime;
	formData.totalCount = row.totalCount;
	dialogVisible.value = true;
}

/** 关闭弹窗时重置表单 */
function handleDialogClose() {
	formRef.value?.resetFields();
	formData.coverKey = '';
	formData.coverUrl = '';
	editId.value = null;
}

/** 提交（新增 / 编辑） */
async function handleSubmit() {
	const valid = await formRef.value?.validate().catch(() => false);
	if (!valid) return;

	submitLoading.value = true;

	try {
		/* 编辑模式：更新已有数据 */
		if (editId.value) {
			const target = rawData.find((r) => r.id === editId.value);
			if (target) {
				target.title = formData.title;
				target.background = formData.background;
				target.location = formData.location;
				target.coverKey = formData.coverKey || undefined;
				target.startDate = formData.startDate;
				target.endDate = formData.endDate;
				target.startTime = formData.startTime;
				target.endTime = formData.endTime;
				target.totalCount = formData.totalCount!;
				tableData.value = [...rawData];
				ElMessage.success('编辑成功');
				dialogVisible.value = false;
			}
			return;
		}

		/* 新增模式 */
		const now = new Date();
		const pad = (n: number) => String(n).padStart(2, '0');
		const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

		const newSession: ActivitySessionRow = {
			id: Math.max(...rawData.map((r) => r.id), 0) + 1,
			title: formData.title,
			background: formData.background,
			location: formData.location || undefined,
			coverKey: formData.coverKey || undefined,
			startDate: formData.startDate,
			endDate: formData.endDate,
			startTime: formData.startTime,
			endTime: formData.endTime,
			totalCount: formData.totalCount!,
			remainCount: formData.totalCount!,
			createdAt: timeStr,
			operator: '当前用户'
		};

		rawData.push(newSession);
		tableData.value = [...rawData];

		ElMessage.success('场次添加成功');
		dialogVisible.value = false;
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

	await fetchSessions({ startDate, endDate });
}

/** 重置查询条件与数据 */
function handleReset() {
	queryForm.value.startDate = '';
	queryForm.value.endDate = '';
	fetchSessions();
}

/** 余号清零 */
async function handleResetCount(row: ActivitySessionRow) {
	try {
		await ElMessageBox.confirm(`确认清零 ${row.startDate} ${row.startTime}-${row.endTime} 的场次吗？`, '清零确认', {
			confirmButtonText: '确定清零',
			cancelButtonText: '取消',
			type: 'warning',
			confirmButtonClass: 'el-button--danger'
		});

		const idx = rawData.findIndex((r) => r.id === row.id);

		if (rawData[idx].remainCount === 0) {
			ElMessage.warning('余号已清零');
			return;
		}

		if (idx > -1) {
			rawData[idx].remainCount = 0;
			tableData.value = [...rawData];
			ElMessage.success('清零成功');
		}
	} catch {
		// 用户取消，不做操作
	}
}

/** 删除场次 */
async function handleDelete(row: ActivitySessionRow) {
	try {
		await ElMessageBox.confirm(
			`确认删除「${row.title}」${row.startDate}~${row.endDate} ${row.startTime}-${row.endTime} 的场次吗？`,
			'删除确认',
			{
				confirmButtonText: '确定删除',
				cancelButtonText: '取消',
				type: 'warning',
				confirmButtonClass: 'el-button--danger'
			}
		);

		const idx = rawData.findIndex((r) => r.id === row.id);
		if (idx > -1) {
			rawData.splice(idx, 1);
			tableData.value = [...rawData];
			ElMessage.success('删除成功');
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
	title: '',
	background: '',
	location: '',
	coverKey: '',
	coverUrl: '',
	dateRange: [] as string[],
	startTime: '' as string,
	endTime: '' as string,
	totalCount: undefined as number | undefined
});

/** 批量表单校验规则 */
const batchRules = reactive<FormRules>({
	title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
	background: [{ required: true, message: '请输入活动背景', trigger: 'blur' }],
	dateRange: [{ required: true, message: '请选择日期范围', trigger: 'change' }],
	startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
	endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
	totalCount: [
		{ required: true, message: '请输入总号数', trigger: 'blur' },
		{ type: 'number', min: 1, message: '总号数必须大于 0', trigger: 'blur' }
	]
});

/** 预览列表：根据日期范围生成预览数据 */
interface BatchPreviewItem {
	date: string;
	timeLabel: string;
	totalCount: number;
}

const batchPreview = ref<BatchPreviewItem[]>([]);

/** 监听批量表单变化，实时更新预览 */
watch(
	() => [batchFormData.dateRange, batchFormData.startTime, batchFormData.endTime, batchFormData.totalCount],
	() => {
		batchPreview.value = generateBatchPreview();
	},
	{ deep: true }
);

function generateBatchPreview(): BatchPreviewItem[] {
	const { dateRange, startTime, endTime, totalCount } = batchFormData;

	if (!dateRange || dateRange.length !== 2 || !startTime || !endTime || !totalCount) {
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
		result.push({ date: dateStr, timeLabel: `${startTime}-${endTime}`, totalCount });
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

/** 批量弹窗 KV 上传 */
function handleBatchUploadKV(options: UploadRequestOptions) {
	const file = options.file;
	batchFormData.coverUrl = URL.createObjectURL(file);
	batchFormData.coverKey = `activity/kv/${Date.now()}_${file.name}`;
	ElMessage.success('图片上传成功（本地预览）');
}

/** 关闭批量添加弹窗时重置 */
function handleBatchDialogClose() {
	batchFormRef.value?.resetFields();
	batchFormData.coverKey = '';
	batchFormData.coverUrl = '';
	batchPreview.value = [];
}

/** 提交批量添加 */
async function handleBatchSubmit() {
	const valid = await batchFormRef.value?.validate().catch(() => false);
	if (!valid) return;

	if (batchPreview.value.length === 0) return;

	batchSubmitLoading.value = true;

	try {
		const now = new Date();
		const pad = (n: number) => String(n).padStart(2, '0');
		const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

		let maxId = rawData.length > 0 ? Math.max(...rawData.map((r) => r.id)) : 0;

		const newSessions: ActivitySessionRow[] = [];
		for (const item of batchPreview.value) {
			maxId += 1;
			// 批量生成的活动，开始日期=结束日期=该场次日期
			const session: ActivitySessionRow = {
				id: maxId,
				title: batchFormData.title,
				background: batchFormData.background,
				location: batchFormData.location || undefined,
				coverKey: batchFormData.coverKey || undefined,
				startDate: item.date,
				endDate: item.date,
				startTime: batchFormData.startTime,
				endTime: batchFormData.endTime,
				totalCount: item.totalCount,
				remainCount: item.totalCount,
				createdAt: timeStr,
				operator: '当前用户'
			};
			newSessions.push(session);
			rawData.push(session);
		}

		tableData.value = [...rawData];
		ElMessage.success(`成功批量添加 ${newSessions.length} 场次`);
		batchDialogVisible.value = false;
	} finally {
		batchSubmitLoading.value = false;
	}
}

/** 导出 Excel（敬请期待） */
function handleExport() {
	ElMessageBox.alert('敬请期待！', '提示', {
		confirmButtonText: '我知道了',
		type: 'info'
	});
}

onMounted(() => {
	fetchSessions();
});
</script>

<style scoped>
.kv-uploader :deep(.el-upload) {
	width: 280px;
	height: 157px;
	border: 1px dashed var(--el-border-color);
	border-radius: 6px;
	cursor: pointer;
	overflow: hidden;
	transition: border-color 0.2s;
	
}

.kv-uploader :deep(.el-upload:hover) {
	border-color: var(--el-color-primary);
}

.kv-preview {
	display: block;
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.kv-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
}
</style>
