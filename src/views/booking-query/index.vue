<template>
	<div class="admin-page">
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
				<el-form-item label="时间段">
					<el-select v-model="queryForm.timeSlot" placeholder="全部" clearable style="width: 170px">
						<el-option
							v-for="opt in timeSlotOptions"
							:key="opt.value"
							:label="opt.label"
							:value="opt.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="姓名">
					<el-input v-model="queryForm.name" placeholder="请输入姓名" clearable style="width: 140px" />
				</el-form-item>
				<el-form-item label="手机">
					<el-input v-model="queryForm.phone" placeholder="请输入手机号" clearable style="width: 160px" />
				</el-form-item>
				<el-form-item label="成团方式">
					<el-select v-model="queryForm.groupType" placeholder="全部" clearable style="width: 120px">
						<el-option
							v-for="opt in groupTypeOptions"
							:key="opt.value"
							:label="opt.label"
							:value="opt.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="queryForm.status" placeholder="全部" clearable style="width: 120px">
						<el-option
							v-for="opt in statusOptions"
							:key="opt.value"
							:label="opt.label"
							:value="opt.value"
						/>
					</el-select>
				</el-form-item>
				<div>
					<el-form-item>
						<el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
						<el-button @click="handleReset">重置</el-button>
						<el-button type="success" :icon="Download" @click="handleExport">导出 Excel</el-button>
					</el-form-item>
				</div>
			</el-form>

			<!-- 预约表格 -->
			<!-- <el-table v-loading="tableLoading" :data="tableData" border stripe style="width: 100%">
				<el-table-column type="index" label="序号" width="60" align="center" />
				<el-table-column prop="name" label="姓名" min-width="80" />
				<el-table-column prop="phone" label="手机" min-width="120">
					<template #default="{ row }">{{ maskPhone(row.phone) }}</template>
				</el-table-column>
				<el-table-column prop="idCard" label="身份证" min-width="160">
					<template #default="{ row }">
						<span class="font-mono text-xs">{{ maskIdCard(row.idCard) }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="groupType" label="成团方式" min-width="100" align="center">
					<template #default="{ row }">
						<el-tag size="small">{{ row.groupType }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="groupCount" label="团队人数" min-width="90" align="center" />
				<el-table-column prop="attachment" label="附件" min-width="130">
					<template #default="{ row }">
						<span v-if="row.attachment !== '-'">
							<el-link type="primary" underline="never">{{ row.attachment }}</el-link>
						</span>
						<span v-else class="text-slate-400">-</span>
					</template>
				</el-table-column>
				<el-table-column prop="date" label="日期" min-width="110" />
				<el-table-column prop="startTime" label="开始时间" min-width="95" align="center" />
				<el-table-column prop="endTime" label="结束时间" min-width="95" align="center" />
				<el-table-column label="状态" min-width="100" align="center">
					<template #default="{ row }">
						<el-tag :type="getStatusInfo(row.status)?.type">
							{{ getStatusInfo(row.status)?.label }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="createdAt" label="创建时间" min-width="160" />
				<el-table-column label="操作" min-width="180" align="center" fixed="right">
					<template #default>
						<el-button type="primary" link size="small">确认参观</el-button>
						<el-divider direction="vertical" />
						<el-button type="danger" link size="small">取消参观</el-button>
					</template>
				</el-table-column>
			</el-table> -->

			<my-table v-loading="tableLoading" :data="tableData" :columns="columns">
				<template #groupType="{ row }">
					<el-tag size="small">{{ row.groupType }}</el-tag>
				</template>

				<template #attachment="{ row }">
					<span v-if="row.attachment !== '-'">
						<el-link :href="row.attachment" target="_blank" type="primary" underline="never">
							查看附件
						</el-link>
					</span>
					<span v-else class="text-slate-400">-</span>
				</template>

				<template #status="{ row }">
					<el-tag :type="getStatusInfo(row.status)?.type">
						{{ getStatusInfo(row.status)?.label }}
					</el-tag>
				</template>

				<template #action>
					<el-button type="primary" link> 确认参观 </el-button>
					<el-divider direction="vertical" />
					<el-button type="danger" link> 取消参观 </el-button>
				</template>
			</my-table>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Download, Search } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import { onMounted, ref } from 'vue';
import MyTable from '@/components/MyTable/index.vue';
import type { TableColumn } from '@/components/MyTable/types.ts';

import { getBookingList } from '@/api/science.ts';
import { exportExcel } from '@/utils/excel.ts';

type BookingStatus = 'pending' | 'verified' | 'expired';

interface BookingRow {
	id: number;
	name: string;
	phone: string;
	idCard: string;
	groupType: string;
	groupCount: number;
	attachment: string;
	date: string;
	startTime: string;
	endTime: string;
	status: BookingStatus;
	createdAt: string;
}

const columns: TableColumn[] = [
	{
		type: 'index',
		label: '序号',
		slot: false,
		width: 60,
		align: 'center'
	},
	{
		label: '姓名',
		prop: 'name',
		slot: false,
		minWidth: 80
	},
	{
		label: '手机',
		prop: 'phone',
		slot: false,
		minWidth: 120
	},
	{
		label: '身份证',
		prop: 'idCard',
		slot: false,
		minWidth: 160
	},
	{
		label: '成团方式',
		prop: 'groupType',
		slot: true,
		minWidth: 100,
		align: 'center'
	},
	{
		label: '团队人数',
		prop: 'groupCount',
		slot: false,
		minWidth: 80,
		align: 'center'
	},
	{
		label: '附件',
		prop: 'attachment',
		slot: true,
		minWidth: 80
	},
	{
		label: '日期',
		prop: 'date',
		slot: false,
		minWidth: 110
	},
	{
		label: '开始时间',
		prop: 'startTime',
		slot: false,
		minWidth: 95,
		align: 'center'
	},
	{
		label: '结束时间',
		prop: 'endTime',
		slot: false,
		minWidth: 95,
		align: 'center'
	},
	{
		label: '状态',
		prop: 'status',
		slot: true,
		minWidth: 100,
		align: 'center',
		exportFormatter: (value: BookingStatus) => statusMap[value]?.label ?? value
	},
	{
		label: '创建时间',
		prop: 'createdAt',
		slot: false,
		minWidth: 160
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

/** 状态映射 */
const statusMap: Record<BookingStatus, { label: string; type: '' | 'warning' | 'success' | 'info' }> = {
	pending: { label: '未核销', type: 'warning' },
	verified: { label: '已核销', type: 'success' },
	expired: { label: '已过期', type: 'info' }
};

/** 手机号脱敏：前3后4，中间 **** */
function maskPhone(phone: string): string {
	if (phone.length !== 11) return phone;
	return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}

/** 身份证脱敏：前3后4，中间 *********** */
function maskIdCard(idCard: string): string {
	if (idCard.length < 8) return idCard;
	const starCount = idCard.length - 7;
	return `${idCard.slice(0, 3)}${'*'.repeat(starCount)}${idCard.slice(-4)}`;
}

/** 原始数据源（模拟接口返回） */
const rawData: BookingRow[] = [
	{
		id: 1,
		name: '张三',
		phone: '13812341234',
		idCard: '310101199001011234',
		groupType: '团队预约',
		groupCount: 15,
		attachment: 'https://picsum.photos/seed/booking-attachment-1/1200/800',
		date: '2026-06-03',
		startTime: '09:00',
		endTime: '10:00',
		status: 'verified',
		createdAt: '2026-06-01 10:30:00'
	},
	{
		id: 2,
		name: '李四',
		phone: '13987655678',
		idCard: '320203198503205678',
		groupType: '个人预约',
		groupCount: 3,
		attachment: '-',
		date: '2026-06-04',
		startTime: '14:30',
		endTime: '15:30',
		status: 'pending',
		createdAt: '2026-06-02 09:15:00'
	},
	{
		id: 3,
		name: '王五',
		phone: '13765439012',
		idCard: '330282197811089012',
		groupType: '团队预约',
		groupCount: 25,
		attachment: 'https://picsum.photos/seed/booking-attachment-3/1200/800',
		date: '2026-06-01',
		startTime: '10:30',
		endTime: '11:30',
		status: 'expired',
		createdAt: '2026-05-28 16:20:00'
	},
	{
		id: 4,
		name: '赵六',
		phone: '13698763456',
		idCard: '440305199201023456',
		groupType: '个人预约',
		groupCount: 2,
		attachment: '-',
		date: '2026-06-05',
		startTime: '09:00',
		endTime: '10:00',
		status: 'pending',
		createdAt: '2026-06-03 08:45:00'
	},
	{
		id: 5,
		name: '孙七',
		phone: '13543217890',
		idCard: '510104198806157890',
		groupType: '团队预约',
		groupCount: 30,
		attachment: 'https://picsum.photos/seed/booking-attachment-5/1200/800',
		date: '2026-06-05',
		startTime: '16:00',
		endTime: '17:00',
		status: 'pending',
		createdAt: '2026-06-03 11:20:00'
	},
	{
		id: 6,
		name: '周八',
		phone: '13387652345',
		idCard: '420117199505122345',
		groupType: '个人预约',
		groupCount: 1,
		attachment: '-',
		date: '2026-06-02',
		startTime: '14:30',
		endTime: '15:30',
		status: 'verified',
		createdAt: '2026-05-30 14:55:00'
	}
];

/* 查询条件 */
const queryForm = ref({
	startDate: '' as string,
	endDate: '' as string,
	timeSlot: '' as string,
	name: '' as string,
	phone: '' as string,
	groupType: '' as string,
	status: '' as string
});

/** 成团方式选项 */
const groupTypeOptions = [
	{ label: '个人预约', value: '个人预约' },
	{ label: '团队预约', value: '团队预约' }
];

/** 时间段选项（固定 4 档） */
const timeSlotOptions = [
	{ label: '09:00 - 10:00', value: '09:00-10:00' },
	{ label: '10:30 - 11:30', value: '10:30-11:30' },
	{ label: '14:30 - 15:30', value: '14:30-15:30' },
	{ label: '16:00 - 17:00', value: '16:00-17:00' }
];

/** 状态选项 */
const statusOptions = [
	{ label: '未核销', value: 'pending' },
	{ label: '已核销', value: 'verified' },
	{ label: '已过期', value: 'expired' }
];

/** 表格展示数据（默认全部，查询后为过滤结果） */
const tableData = ref<BookingRow[]>([...rawData]);
const tableLoading = ref(false);

async function fetchBookings(params = queryForm.value) {
	tableLoading.value = true;

	try {
		tableData.value = await getBookingList(params);
	} finally {
		tableLoading.value = false;
	}
}

/** 点击查询：多条件组合过滤 */
function handleSearch() {
	fetchBookings();
}

/** 重置查询条件与数据 */
function handleReset() {
	queryForm.value = {
		startDate: '',
		endDate: '',
		timeSlot: '',
		name: '',
		phone: '',
		groupType: '',
		status: ''
	};
	fetchBookings();
}

/** 导出 Excel（敬请期待） */
function handleExport() {
	const exportColumns = columns
		.filter((item) => item.prop && item.prop !== 'action')
		.map((item) => ({
			label: item.label as string,
			prop: item.prop as string,
			exportFormatter: item.exportFormatter
		}));

	exportExcel(exportColumns, tableData.value, '科普馆预约查询');

	// 导出 Excel 时，弹出下载提示
	ElMessageBox.alert('导出成功', '提示', {
		confirmButtonText: '我知道了',
		type: 'info'
	});
}

function getStatusInfo(status: BookingStatus) {
	return statusMap[status];
}

onMounted(() => {
	fetchBookings();
});
</script>
