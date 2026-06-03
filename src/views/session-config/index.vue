<script setup lang="ts">
import { Plus, Search } from '@element-plus/icons-vue';
import { ref } from 'vue';

interface SessionRow {
	id: number;
	date: string;
	startTime: string;
	endTime: string;
	totalCount: number;
	remainCount: number;
	createdAt: string;
	operator: string;
}

/** 原始数据源（模拟接口返回） */
const rawData: SessionRow[] = [
	{
		id: 1,
		date: '2026-06-01',
		startTime: '09:00',
		endTime: '10:30',
		totalCount: 50,
		remainCount: 0,
		createdAt: '2026-05-28 14:22:00',
		operator: '张三'
	},
	{
		id: 2,
		date: '2026-06-02',
		startTime: '10:00',
		endTime: '11:30',
		totalCount: 40,
		remainCount: 15,
		createdAt: '2026-05-29 09:00:00',
		operator: '李四'
	},
	{
		id: 3,
		date: '2026-06-03',
		startTime: '09:00',
		endTime: '10:30',
		totalCount: 50,
		remainCount: 20,
		createdAt: '2026-05-28 14:22:00',
		operator: '张三'
	},
	{
		id: 4,
		date: '2026-06-03',
		startTime: '14:00',
		endTime: '15:30',
		totalCount: 50,
		remainCount: 35,
		createdAt: '2026-05-28 14:25:00',
		operator: '张三'
	},
	{
		id: 5,
		date: '2026-06-04',
		startTime: '09:00',
		endTime: '10:30',
		totalCount: 50,
		remainCount: 50,
		createdAt: '2026-05-29 09:10:00',
		operator: '李四'
	},
	{
		id: 6,
		date: '2026-06-05',
		startTime: '13:00',
		endTime: '14:30',
		totalCount: 40,
		remainCount: 8,
		createdAt: '2026-05-30 11:00:00',
		operator: '王五'
	}
];

/* 查询条件 */
const queryForm = ref({
	startDate: '' as string,
	endDate: '' as string
});

/** 表格展示数据（默认全部，查询后为过滤结果） */
const tableData = ref<SessionRow[]>([...rawData]);

/** 点击查询：按日期范围过滤 */
function handleSearch() {
	const { startDate, endDate } = queryForm.value;

	if (!startDate && !endDate) {
		tableData.value = [...rawData];
		return;
	}

	tableData.value = rawData.filter((row) => {
		const rowDate = row.date;

		if (startDate && endDate) {
			return rowDate >= startDate && rowDate <= endDate;
		}
		if (startDate) {
			return rowDate >= startDate;
		}
		if (endDate) {
			return rowDate <= endDate;
		}

		return true;
	});
}

/** 重置查询条件与数据 */
function handleReset() {
	queryForm.value.startDate = '';
	queryForm.value.endDate = '';
	tableData.value = [...rawData];
}
</script>

<template>
	<div class="admin-page">
		<!-- 查询区域 -->
		<div class="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-end md:justify-between md:p-5">
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
				<el-form-item>
					<el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
					<el-button @click="handleReset">重置</el-button>
				</el-form-item>
			</el-form>

			<div>
				<el-button type="primary" :icon="Plus">添加场次</el-button>
			</div>
		</div>

		<!-- 场次表格 -->
		<div class="page-panel">
			<el-table :data="tableData" border stripe style="width: 100%">
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
					<template #default>
						<el-button type="primary" link size="small">团队预约</el-button>
						<el-divider direction="vertical" />
						<el-button type="primary" link size="small">编辑</el-button>
						<el-divider direction="vertical" />
						<el-button type="danger" link size="small">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
		</div>
	</div>
</template>
