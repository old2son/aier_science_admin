<template>
	<div class="admin-page">
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
					</el-form-item>
				</div>
			</el-form>

			<!-- 预约表格 -->
			<el-table :data="tableData" border stripe style="width: 100%">
				<el-table-column type="index" label="序号" width="60" align="center" />
				<el-table-column prop="name" label="姓名" min-width="80" />
				<el-table-column prop="phone" label="手机" min-width="120" />
				<el-table-column prop="idCard" label="身份证" min-width="160">
					<template #default="{ row }">
						<span class="font-mono text-xs">{{ row.idCard }}</span>
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
							<el-link type="primary" :underline="false">{{ row.attachment }}</el-link>
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
			</el-table>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import { ref } from 'vue';

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

/** 状态映射 */
const statusMap: Record<BookingStatus, { label: string; type: '' | 'warning' | 'success' | 'info' }> = {
	pending: { label: '未核销', type: 'warning' },
	verified: { label: '已核销', type: 'success' },
	expired: { label: '已过期', type: 'info' }
};

/** 原始数据源（模拟接口返回） */
const rawData: BookingRow[] = [
	{
		id: 1,
		name: '张三',
		phone: '138****1234',
		idCard: '310***********1234',
		groupType: '团队预约',
		groupCount: 15,
		attachment: '身份证.pdf',
		date: '2026-06-03',
		startTime: '09:00',
		endTime: '10:00',
		status: 'verified',
		createdAt: '2026-06-01 10:30:00'
	},
	{
		id: 2,
		name: '李四',
		phone: '139****5678',
		idCard: '320***********5678',
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
		phone: '137****9012',
		idCard: '330***********9012',
		groupType: '团队预约',
		groupCount: 25,
		attachment: '团队名单.xlsx',
		date: '2026-06-01',
		startTime: '10:30',
		endTime: '11:30',
		status: 'expired',
		createdAt: '2026-05-28 16:20:00'
	},
	{
		id: 4,
		name: '赵六',
		phone: '136****3456',
		idCard: '440***********3456',
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
		phone: '135****7890',
		idCard: '510***********7890',
		groupType: '团队预约',
		groupCount: 30,
		attachment: '团体预约表.docx',
		date: '2026-06-05',
		startTime: '16:00',
		endTime: '17:00',
		status: 'pending',
		createdAt: '2026-06-03 11:20:00'
	},
	{
		id: 6,
		name: '周八',
		phone: '133****2345',
		idCard: '420***********2345',
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

/** 点击查询：多条件组合过滤 */
function handleSearch() {
	const { startDate, endDate, timeSlot, name, phone, groupType, status } = queryForm.value;

	tableData.value = rawData.filter((row) => {
		if (startDate && row.date < startDate) return false;
		if (endDate && row.date > endDate) return false;
		if (timeSlot) {
			const [slotStart, slotEnd] = timeSlot.split('-');
			const rowTimeRange = `${row.startTime}-${row.endTime}`;
			if (rowTimeRange !== `${slotStart}-${slotEnd}`) return false;
		}
		if (name && !row.name.includes(name)) return false;
		if (phone && !row.phone.includes(phone)) return false;
		if (groupType && row.groupType !== groupType) return false;
		if (status && row.status !== status) return false;

		return true;
	});
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
	tableData.value = [...rawData];
}

function getStatusInfo(status: BookingStatus) {
	return statusMap[status];
}
</script>
