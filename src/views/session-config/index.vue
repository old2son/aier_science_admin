<template>
	<div class="admin-page">
		<div class="mb-4 flex items-center justify-between">
			<el-button type="primary" :icon="Plus" @click="handleAdd">添加场次</el-button>
		</div>

		<div class="page-panel">
			<!-- 查询区域 -->
			<el-form :model="queryForm" inline label-width="auto">
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
			<el-table v-loading="tableLoading" :data="tableData" border stripe style="width: 100%">
				<el-table-column type="index" label="序号" width="60" align="center" />
				<el-table-column prop="date" label="日期" min-width="120" />
				<el-table-column prop="startTime" label="开始时间" min-width="100" align="center" />
				<el-table-column prop="endTime" label="结束时间" min-width="100" align="center" />
				<el-table-column prop="totalCount" label="总号数" min-width="90" align="center" />
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
						<el-button type="primary" link size="small">团队预约</el-button>
						<el-divider direction="vertical" />
						<el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
						<el-divider direction="vertical" />
						<el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
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
	</div>
</template>

<script setup lang="ts">
import { Plus, Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import { getSessionList, type SessionQuery, type SessionRow } from '@/api/science';

let rawData: SessionRow[] = [];

/* 查询条件 */
const queryForm = ref({
	startDate: '' as string,
	endDate: '' as string
});

/** 表格展示数据（默认全部，查询后为过滤结果） */
const tableData = ref<SessionRow[]>([]);
const tableLoading = ref(false);

async function fetchSessions(params?: SessionQuery) {
	tableLoading.value = true;

	try {
		const list = await getSessionList(params);
		rawData = list;
		tableData.value = [...list];
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
	{ label: '09:00 - 10:00', value: '09:00-10:00' },
	{ label: '10:30 - 11:30', value: '10:30-11:30' },
	{ label: '14:30 - 15:30', value: '14:30-15:30' },
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
	editId.value = row.id;
	formData.date = row.date;
	formData.timeSlot = `${row.startTime}-${row.endTime}`;
	formData.totalCount = row.totalCount;
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
			const target = rawData.find((r) => r.id === editId.value);
			if (target) {
				target.date = formData.date;
				target.startTime = startTime;
				target.endTime = endTime;
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

		const newSession: SessionRow = {
			id: Math.max(...rawData.map((r) => r.id), 0) + 1,
			date: formData.date,
			startTime,
			endTime,
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

/** 删除场次 */
async function handleDelete(row: SessionRow) {
	try {
		await ElMessageBox.confirm(`确认删除 ${row.date} ${row.startTime}-${row.endTime} 的场次吗？`, '删除确认', {
			confirmButtonText: '确定删除',
			cancelButtonText: '取消',
			type: 'warning',
			confirmButtonClass: 'el-button--danger'
		});

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

onMounted(() => {
	fetchSessions();
});
</script>
