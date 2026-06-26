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
				<template #activityCoverUrl="{ row }">
					<el-image
						v-if="row.activityCoverUrl"
						:src="row.activityCoverUrl"
						:preview-src-list="[row.activityCoverUrl]"
						fit="cover"
						preview-teleported
						class="activity-cover-thumb"
					/>
					<span v-else class="text-slate-400">-</span>
				</template>

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

		<!-- 添加/编辑场次弹窗 -->
		<el-dialog
			v-model="dialogVisible"
			:title="dialogTitle"
			width="560px"
			align-center
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
			class="batch-dialog"
			align-center
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
				<el-form-item label="时间配置" class="mb-[30px]" prop="timeRanges" required>
					<div class="batch-time-list">
						<div v-for="(item, index) in batchFormData.timeRanges" :key="index" class="batch-time-card">
							<div class="batch-time-card__header">
								<span class="batch-time-card__title">时间段 {{ index + 1 }}</span>
								<el-button
									v-if="batchFormData.timeRanges.length > 1"
									type="danger"
									link
									@click="removeBatchTimeRange(index)"
								>
									删除
								</el-button>
							</div>

							<div class="batch-time-card__grid">
								<el-time-picker
									v-model="item.startTime"
									placeholder="选择开始时间"
									format="HH:mm"
									value-format="HH:mm"
									style="width: 100%"
								/>
								<el-time-picker
									v-model="item.endTime"
									placeholder="选择结束时间"
									format="HH:mm"
									value-format="HH:mm"
									style="width: 100%"
								/>
							</div>

							<el-upload
								class="batch-kv-uploader"
								action="#"
								:show-file-list="false"
								:before-upload="handleBeforeUpload"
								:http-request="(options: UploadRequestOptions) => handleBatchUploadKV(index, options)"
								accept="image/*"
							>
								<img v-if="item.coverUrl" :src="item.coverUrl" class="kv-preview" />
								<div v-else class="kv-placeholder">
									<el-icon class="text-2xl text-slate-400"><Plus /></el-icon>
									<span class="mt-1 text-xs text-slate-400">上传该时间段 KV</span>
								</div>
							</el-upload>
						</div>

						<el-button plain type="primary" @click="addBatchTimeRange">新增时间段</el-button>
						<!-- <div class="batch-time-tip">每个时间段可单独上传一张图片，提交时按时间段条数逐条新增。</div> -->
					</div>
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
					<div class="batch-preview-panel">
						<div v-for="(item, idx) in batchPreview" :key="idx" class="batch-preview-item">
							<span class="batch-preview-item__label">{{ item.dateLabel }} {{ item.timeLabel }}</span>
							<el-tag size="small">{{ item.totalCount }} 号</el-tag>
						</div>
						<div class="batch-preview-total">共 {{ batchPreview.length }} 场次</div>
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
import type { TableColumn } from '@/components/MyTable/types';
import { exportExcel, type ExportColumn } from '@/utils/excel';
import {
	getAllActivityConfigurationApi,
	searchActivityConfigurationApi,
	addActivityConfigurationApi,
	updateActivityConfigurationApi,
	clearingActivityConfigurationApi,
	deleteActivityConfigurationApi
} from '@/api/admin';
import { type ActivitySessionRow } from '@/types/SessionInfo';
import { useUserStore } from '@/stores/modules/user';

const userStore = useUserStore();

const columns: TableColumn[] = [
	{
		label: '活动id',
		prop: 'activityId',
		slot: false,
		width: 70,
		align: 'center'
	},
	{
		label: '活动标题',
		prop: 'activityName',
		slot: false,
		minWidth: 110,
		showOverflowTooltip: true
	},
	{
		label: '活动背景',
		prop: 'theBackground',
		slot: false,
		minWidth: 180,
		align: 'center',
		showOverflowTooltip: true
	},
	{
		label: '活动KV',
		prop: 'activityCoverUrl',
		slot: true,
		minWidth: 110,
		align: 'center'
	},
	{
		label: '活动地点',
		prop: 'place',
		slot: false,
		minWidth: 140,
		showOverflowTooltip: true
	},
	{
		label: '开始日期',
		prop: 'activityTime',
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
		minWidth: 80,
		align: 'center'
	},
	{
		label: '结束时间',
		prop: 'endTime',
		slot: false,
		minWidth: 80,
		align: 'center'
	},
	{
		label: '总号数',
		prop: 'totalNumber',
		slot: false,
		minWidth: 75,
		align: 'center'
	},
	{
		label: '余号',
		prop: 'surplusNumber',
		slot: true,
		minWidth: 75,
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
		minWidth: 70,
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

async function fetchSessions() {
	tableLoading.value = true;

	try {
		const { data = [] } = await getAllActivityConfigurationApi();
		tableData.value = data;
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

function fileToBase64(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			if (typeof reader.result === 'string') {
				resolve(reader.result);
				return;
			}

			reject(new Error('图片读取失败'));
		};

		reader.onerror = () => reject(new Error('图片读取失败'));
		reader.readAsDataURL(file);
	});
}

/** 接口返回的图片转 base64 */
// function blobToBase64(blob: Blob) {
// 	return new Promise<string>((resolve, reject) => {
// 		const reader = new FileReader();

// 		reader.onload = () => {
// 			if (typeof reader.result === 'string') {
// 				resolve(reader.result);
// 				return;
// 			}

// 			reject(new Error('图片读取失败'));
// 		};

// 		reader.onerror = () => reject(new Error('图片读取失败'));
// 		reader.readAsDataURL(blob);
// 	});
// }

/** 接口返回的图片转 base64 */
// async function imageToBase64(imageUrl: string) {
// 	if (!imageUrl) return '';
// 	if (imageUrl.startsWith('data:')) return imageUrl;

// 	const response = await fetch(imageUrl);

// 	if (!response.ok) {
// 		throw new Error('活动图片转换失败');
// 	}

// 	const blob = await response.blob();
// 	return blobToBase64(blob);
// }

/** 自定义上传：本地预览，实际项目替换为真实上传接口 */
async function handleUploadKV(options: UploadRequestOptions) {
	try {
		const base64 = await fileToBase64(options.file as File);
		formData.coverUrl = base64;
		formData.coverKey = base64;
		ElMessage.success('图片上传成功');
	} catch (error) {
		ElMessage.error((error as Error).message || '图片处理失败');
	}
}

/** 弹窗标题（新增 / 编辑） */
const dialogTitle = computed(() => (editId.value ? '编辑场次' : '添加场次'));

/** 打开添加弹窗 */
function handleAdd() {
	editId.value = null;
	dialogVisible.value = true;
}

/** 打开编辑弹窗，回填数据 */
async function handleEdit(row: ActivitySessionRow) {
	editId.value = row.activityId;
	formData.title = row.activityName;
	formData.background = row.theBackground;
	formData.location = row.place ?? '';
	formData.startDate = row.activityTime;
	formData.endDate = row.endDate;
	formData.startTime = row.startTime;
	formData.endTime = row.endTime;
	formData.totalCount = row.totalNumber;
	formData.coverKey = '';
	formData.coverUrl = row.activityCoverUrl ?? '';

	dialogVisible.value = true;
}

/** 关闭弹窗时重置表单 */
function handleDialogClose() {
	formRef.value?.resetFields();
	formData.title = '';
	formData.background = '';
	formData.location = '';
	formData.coverKey = '';
	formData.coverUrl = '';
	formData.startDate = '';
	formData.endDate = '';
	formData.startTime = '';
	formData.endTime = '';
	formData.totalCount = undefined;
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
			const target = tableData.value.find((r) => r.activityId === editId.value);
			if (target) {
				target.activityName = formData.title;
				target.theBackground = formData.background;
				target.place = formData.location;
				target.activityCoverUrl = formData.coverKey || '';
				target.activityTime = formData.startDate;
				target.endDate = formData.endDate;
				target.startTime = formData.startTime;
				target.endTime = formData.endTime;
				target.totalNumber = formData.totalCount!;

				updateActivityConfigurationApi({
					activityId: editId.value,
					activityName: formData.title,
					theBackground: formData.background,
					place: formData.location || '',
					activityCoverUrl: formData.coverKey || '',
					activityTime: formData.startDate,
					endDate: formData.endDate,
					startTime: formData.startTime,
					endTime: formData.endTime,
					totalNumber: formData.totalCount!,
					operatorName: userStore.userInfo?.nickName || '当前用户'
					// operatorName: '活动主持人莉莉丝'
				}).then((res) => {
					fetchSessions();
					dialogVisible.value = false;
					ElMessage.success(res.message);
				});
			}
			return;
		}

		/* 新增模式 */
		addActivityConfigurationApi({
			activityName: formData.title,
			theBackground: formData.background,
			place: formData.location || '',
			activityCoverUrl: formData.coverKey || '',
			activityTime: formData.startDate,
			endDate: formData.endDate,
			startTime: formData.startTime,
			endTime: formData.endTime,
			totalNumber: formData.totalCount!,
			// operatorName: userStore.userInfo?.nickName || '当前用户'
			operatorName: '活动主持人莉莉丝'
		}).then((res) => {
			fetchSessions();
			ElMessage.success(res.message);
			dialogVisible.value = false;
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

	const { data = [] } = await searchActivityConfigurationApi({ startDate, endDate });
	tableData.value = data;
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
		await ElMessageBox.confirm(
			`确认清零 ${row.activityName} ${row.startTime}-${row.endTime} 的场次吗？`,
			'清零确认',
			{
				confirmButtonText: '确定清零',
				cancelButtonText: '取消',
				type: 'warning',
				confirmButtonClass: 'el-button--danger'
			}
		);

		const idx = tableData.value.findIndex((r) => r.activityId === row.activityId);

		if (tableData.value[idx].surplusNumber === 0) {
			ElMessage.warning('余号已清零');
			return;
		}

		if (idx > -1) {
			clearingActivityConfigurationApi({ activityId: row.activityId }).then((res) => {
				fetchSessions();
				ElMessage.success(res.message);
			});
		}
	} catch {
		// 用户取消，不做操作
	}
}

/** 删除场次 */
async function handleDelete(row: ActivitySessionRow) {
	try {
		await ElMessageBox.confirm(
			`确认删除「${row.activityName}」${row.activityTime}~${row.endDate} ${row.startTime}-${row.endTime} 的场次吗？`,
			'删除确认',
			{
				confirmButtonText: '确定删除',
				cancelButtonText: '取消',
				type: 'warning',
				confirmButtonClass: 'el-button--danger'
			}
		);

		const idx = tableData.value.findIndex((r) => r.activityId === row.activityId);
		if (idx > -1) {
			deleteActivityConfigurationApi({ activityId: row.activityId }).then((res) => {
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

interface BatchTimeRangeItem {
	startTime: string;
	endTime: string;
	coverKey: string;
	coverUrl: string;
}

function createBatchTimeRangeItem(): BatchTimeRangeItem {
	return {
		startTime: '',
		endTime: '',
		coverKey: '',
		coverUrl: ''
	};
}

/** 批量表单数据 */
const batchFormData = reactive({
	title: '',
	background: '',
	location: '',
	dateRange: [] as string[],
	timeRanges: [createBatchTimeRangeItem()] as BatchTimeRangeItem[],
	totalCount: undefined as number | undefined
});

function validateBatchTimeRanges(_rule: unknown, value: BatchTimeRangeItem[], callback: (error?: Error) => void) {
	if (!Array.isArray(value) || value.length === 0) {
		callback(new Error('请至少添加一个时间段'));
		return;
	}

	const hasIncomplete = value.some((item) => !item.startTime || !item.endTime || !item.coverKey);
	if (hasIncomplete) {
		callback(new Error('请完善每个时间段的时间和图片'));
		return;
	}

	const hasInvalidOrder = value.some((item) => item.startTime >= item.endTime);
	if (hasInvalidOrder) {
		callback(new Error('结束时间需晚于开始时间'));
		return;
	}

	callback();
}

/** 批量表单校验规则 */
const batchRules = reactive<FormRules>({
	title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
	background: [{ required: true, message: '请输入活动背景', trigger: 'blur' }],
	dateRange: [{ required: true, message: '请选择日期范围', trigger: 'change' }],
	timeRanges: [{ validator: validateBatchTimeRanges, trigger: 'change' }],
	totalCount: [
		{ required: true, message: '请输入总号数', trigger: 'blur' },
		{ type: 'number', min: 1, message: '总号数必须大于 0', trigger: 'blur' }
	]
});

/** 预览列表：按时间段生成，保留日期范围展示 */
interface BatchPreviewItem {
	dateLabel: string;
	timeLabel: string;
	totalCount: number;
	startTime: string;
	endTime: string;
	coverKey: string;
}

const batchPreview = ref<BatchPreviewItem[]>([]);

/** 监听批量表单变化，实时更新预览 */
watch(
	() => [batchFormData.dateRange, batchFormData.timeRanges, batchFormData.totalCount],
	() => {
		batchPreview.value = generateBatchPreview();
	},
	{ deep: true }
);

function generateBatchPreview(): BatchPreviewItem[] {
	const { dateRange, timeRanges, totalCount } = batchFormData;

	if (!timeRanges.length || !totalCount) {
		return [];
	}

	const result: BatchPreviewItem[] = [];
	const [activityTime, endDate] = dateRange;
	const dateLabel =
		activityTime && endDate
			? activityTime === endDate
				? activityTime
				: `${activityTime} 至 ${endDate}`
			: '未选择日期';

	for (const item of timeRanges) {
		if (!item.startTime || !item.endTime || !item.coverKey || item.startTime >= item.endTime) continue;
		result.push({
			dateLabel,
			timeLabel: `${item.startTime}-${item.endTime}`,
			totalCount,
			startTime: item.startTime,
			endTime: item.endTime,
			coverKey: item.coverKey
		});
	}

	return result;
}

/** 打开批量添加弹窗 */
function handleBatchAdd() {
	batchDialogVisible.value = true;
}

function addBatchTimeRange() {
	batchFormData.timeRanges.push(createBatchTimeRangeItem());
}

function removeBatchTimeRange(index: number) {
	batchFormData.timeRanges.splice(index, 1);
	if (batchFormData.timeRanges.length === 0) {
		batchFormData.timeRanges.push(createBatchTimeRangeItem());
	}
}

/** 批量弹窗 KV 上传 */
async function handleBatchUploadKV(index: number, options: UploadRequestOptions) {
	try {
		const base64 = await fileToBase64(options.file as File);
		batchFormData.timeRanges[index].coverUrl = base64;
		batchFormData.timeRanges[index].coverKey = base64;
		void batchFormRef.value?.validateField('timeRanges');
		ElMessage.success('图片上传成功');
	} catch (error) {
		ElMessage.error((error as Error).message || '图片处理失败');
	}
}

/** 关闭批量添加弹窗时重置 */
function handleBatchDialogClose() {
	batchFormRef.value?.resetFields();
	batchFormData.title = '';
	batchFormData.background = '';
	batchFormData.location = '';
	batchFormData.dateRange = [];
	batchFormData.timeRanges = [createBatchTimeRangeItem()];
	batchFormData.totalCount = undefined;
	batchPreview.value = [];
}

/** 提交批量添加 */
async function handleBatchSubmit() {
	const valid = await batchFormRef.value?.validate().catch(() => false);
	if (!valid) return;

	if (batchPreview.value.length === 0) return;

	batchSubmitLoading.value = true;

	try {
		const [activityTime, endDate] = batchFormData.dateRange;
		const res = await Promise.allSettled(
			batchPreview.value.map((item) =>
				addActivityConfigurationApi({
					activityName: batchFormData.title,
					activityCoverUrl: item.coverKey,
					theBackground: batchFormData.background,
					totalNumber: batchFormData.totalCount as number,
					// operatorName: userStore.userInfo?.nickName || '当前用户',
					operatorName: '活动主持人莉莉丝',
					place: batchFormData.location || '',
					activityTime,
					endDate,
					startTime: item.startTime,
					endTime: item.endTime
				})
			)
		);

		await fetchSessions();
		console.log(res);
		const successCount = res.filter((item) => item.status === 'fulfilled').length;
		const failCount = res.length - successCount;
		ElMessage.success(`成功新增 ${successCount} 条，失败 ${failCount} 条`);
		batchDialogVisible.value = false;
	} finally {
		batchSubmitLoading.value = false;
	}
}

/** 导出 Excel */
function handleExport() {
	if (!tableData.value.length) {
		ElMessage.warning('暂无可导出的数据');
		return;
	}

	const exportColumns: ExportColumn[] = [
		{ label: '活动ID', prop: 'activityId' },
		{ label: '活动标题', prop: 'activityName' },
		{ label: '活动背景', prop: 'theBackground' },
		{
			label: '活动KV',
			prop: 'activityCoverUrl',
			exportFormatter: (value: string) => value || '-'
		},
		{
			label: '活动地点',
			prop: 'place',
			exportFormatter: (value: string) => value || '-'
		},
		{ label: '开始日期', prop: 'activityTime' },
		{ label: '结束日期', prop: 'endDate' },
		{ label: '开始时间', prop: 'startTime' },
		{ label: '结束时间', prop: 'endTime' },
		{ label: '总号数', prop: 'totalNumber' },
		{ label: '余号', prop: 'surplusNumber' },
		{
			label: '操作人',
			prop: 'operatorName',
			exportFormatter: (value: string | null) => value || '-'
		},
		{
			label: '创建时间',
			prop: 'createTime',
			exportFormatter: (value: string) => value || '-'
		}
	];

	try {
		exportExcel(exportColumns, tableData.value, '活动场次配置');
		ElMessageBox.alert('导出成功', '提示', {
			confirmButtonText: '我知道了',
			type: 'info'
		});
	} catch (error) {
		console.error(error);
		ElMessage.error('导出失败');
	}
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

.batch-kv-uploader :deep(.el-upload) {
	width: 100%;
	height: 157px;
	border: 1px dashed var(--el-border-color);
	border-radius: 6px;
	cursor: pointer;
	overflow: hidden;
	transition: border-color 0.2s;
}

.batch-kv-uploader :deep(.el-upload:hover) {
	border-color: var(--el-color-primary);
}

.kv-preview {
	display: block;
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.activity-cover-thumb {
	display: block;
	width: 84px;
	height: 48px;
	margin: 0 auto;
	border: 1px solid var(--el-border-color);
	border-radius: 6px;
	background: var(--el-fill-color-light);
	cursor: pointer;
	overflow: hidden;
}

.kv-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
}

:deep(.batch-dialog .el-form-item__error) {
	padding: 8px 0;
}

.batch-time-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
	width: 100%;
}

.batch-time-card {
	padding: 12px;
	border: 1px solid var(--el-border-color);
	border-radius: 8px;
	background: var(--el-bg-color-overlay);
	box-shadow: 0 4px 14px rgb(15 23 42 / 0.04);
	transition:
		border-color 0.2s ease,
		box-shadow 0.2s ease,
		background-color 0.2s ease;
}

.batch-time-card:hover {
	border-color: var(--el-color-primary-light-7);
	box-shadow: 0 8px 20px rgb(15 23 42 / 0.06);
}

.batch-time-card__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 10px;
	padding-bottom: 8px;
	border-bottom: 1px solid var(--el-border-color-lighter);
}

.batch-time-card__title {
	font-size: 14px;
	font-weight: 600;
	color: var(--el-color-primary);
}

.batch-time-card__grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12px;
	margin-bottom: 12px;
}

.batch-time-tip {
	font-size: 12px;
	line-height: 1.5;
	color: var(--el-text-color-secondary);
}

.batch-preview-panel {
	max-height: 192px;
	overflow-y: auto;
	padding: 12px;
	border: 1px solid color-mix(in srgb, var(--el-border-color) 70%, transparent);
	border-radius: 8px;
	background: var(--el-bg-color-overlay);
	box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.35);
}

.batch-preview-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 10px 0;
	font-size: 14px;
}

.batch-preview-item + .batch-preview-item {
	border-top: 1px dashed color-mix(in srgb, var(--el-border-color-lighter) 75%, transparent);
}

.batch-preview-item__label {
	color: var(--el-text-color-regular);
}

.batch-preview-total {
	margin-top: 10px;
	padding-top: 10px;
	border-top: 1px solid color-mix(in srgb, var(--el-border-color-lighter) 75%, transparent);
	font-size: 14px;
	font-weight: 600;
	color: var(--el-color-primary);
}
</style>
