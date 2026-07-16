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

			<my-table
				v-loading="tableLoading"
				:data="pagedTableData"
				:columns="columns"
				@sort-change="handleSortChange"
			>
				<template #phone="{ row }">
					{{ row.phone || '-' }}
				</template>

				<template #visitLabel="{ row }">
					{{ getBookingVisitLabel(row) }}
				</template>

				<template #idCard="{ row }">
					{{ row.idNumber || '-' }}
				</template>

				<template #groupType="{ row }">
					<el-tag size="small">{{ getBookingGroupType(row) }}</el-tag>
				</template>

				<template #groupCount="{ row }">
					<el-popover
						v-if="hasMembers(row)"
						placement="left"
						trigger="click"
						width="360"
						popper-class="companion-popover"
					>
						<template #reference>
							<el-button type="primary" link>
								{{ getBookingMemberCount(row) }}
							</el-button>
						</template>

						<div class="companion-list">
							<div
								v-for="(companion, index) in row.members"
								:key="`${companion.reId}-${index}`"
								class="companion-card"
							>
								<div class="companion-card__header">
									<span class="companion-card__name">{{ companion.userName }}</span>
									<el-tag size="small" effect="plain">第{{ Number(index) + 1 }}人</el-tag>
								</div>
								<div class="companion-card__meta">
									<span>{{ companion.documentType }}</span>
									<span>{{ companion.idNumber }}</span>
									<span>{{ companion.userAge }}岁</span>
								</div>
								<div class="companion-card__phone">{{ companion.userPhone }}</div>
							</div>
						</div>
					</el-popover>
					<span v-else>{{ getBookingMemberCount(row) }}</span>
				</template>

				<template #excelUrl="{ row }">
					<span v-if="row?.excelUrl">
						<!-- <el-link :href="row.excelUrl" target="_blank" type="primary" underline="never">
							查看附件
						</el-link> -->

						<el-link type="primary" underline="never" @click="openExcel(row.excelUrl, row.name)"> 查看附件 </el-link>
					</span>
					<span v-else class="text-slate-400">-</span>
				</template>

				<template #status="{ row }">
					<el-tag :type="getStatusInfo(row.status)?.type">
						{{ getStatusInfo(row.status)?.label }}
					</el-tag>
				</template>

				<template #action="{ row }">
					<template v-if="row.status === 0">
						<el-button type="primary" link @click="handleConfirm(row.reId)"> 确认参观 </el-button>
						<el-divider direction="vertical" />
						<el-button type="danger" link @click="handleCancel(row.reId)"> 取消参观 </el-button>
					</template>
				</template>
			</my-table>

			<my-pagination
				v-model:current-page="pagination.currentPage"
				v-model:page-size="pagination.pageSize"
				:total="tableData.length"
			/>
		</div>

		<el-dialog v-model="dialogVisible" align-center>
			<OpenFileViewer
				v-if="fileData"
				:file="fileData"
				:file-name="fileData.name"
				width="100%"
				height="640px"
				fit="contain"
				:toolbar="toolbarConfig"
				:theme="theme"
				:plugins="plugins"
			/>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { Download, Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import MyTable from '@/components/MyTable/index.vue';
import MyPagination from '@/components/MyPagination/index.vue';
import type { TableColumn } from '@/components/MyTable/types';
import { STORAGE_KEY } from '@/constants/storage';

import {
	getAllScienceReservationsApi,
	searchScienceReservationsNativeApi,
	type SearchScienceReservationsParams,
	confirmAttendanceApi,
	cancelAppointmentApi
} from '@/api/admin';
import { type BookingRow, type BookingStatus } from '@/types/BookingInfo';
import { getDefaultQueryDateRange } from '@/utils/date';
import { exportExcel } from '@/utils/excel';


/** 查看附件开始 */
import { OpenFileViewer } from '@open-file-viewer/vue';
import { officePlugin } from '@open-file-viewer/core';
import '@open-file-viewer/core/style.css';

const dialogVisible = ref(false);
const fileData = ref<File>();
const theme = ref<'light' | 'dark' | 'auto'>('auto');
const plugins = [officePlugin()];


const toolbarConfig = {
	zoom: true,
	rotate: true,
	download: true,
	fullscreen: true,
	search: true,
	labels: {
		download: '下载文件',
		print: '打印',
		fullscreen: '全屏',
		search: '搜索'
	}
};

async function loadFile(url: string, name: string) {
	// 测试用
	// const url = 'https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/template_regist_team.xlsx';

	try {
		const response = await fetch(url);

		const blob = await response.blob();

		fileData.value = new File([blob], `${name}.xlsx`, {
			type: blob.type
		});
	} catch (error) {
		ElMessage.error('文件加载失败');
	}
}

function openExcel(url: string, name: string) {
	loadFile(url, name);
	theme.value = (localStorage.getItem(STORAGE_KEY.THEME_KEY) ?? 'auto') as 'light' | 'dark' | 'auto';
	dialogVisible.value = true;
}
/** 查看附件结束 */

type BookingViewRow = BookingRow & {
	groupType: string;
	startTime: string;
	endTime: string;
};

const columns: TableColumn[] = [
	{
		label: '预约id',
		prop: 'reId',
		slot: false,
		minWidth: 70,
		align: 'center'
	},
	{
		label: '预约参观',
		prop: 'visitLabel',
		slot: true,
		minWidth: 100,
		showOverflowTooltip: true
	},
	{
		label: '姓名',
		prop: 'name',
		slot: false,
		minWidth: 85
	},
	{
		label: '手机',
		prop: 'phone',
		slot: true,
		minWidth: 110
	},
	{
		label: '证件',
		prop: 'idCard',
		slot: true,
		minWidth: 100,
		showOverflowTooltip: true
	},
	{
		label: '年龄',
		prop: 'age',
		slot: false,
		hide: true,
		minWidth: 60
	},
	{
		label: '成团方式',
		prop: 'groupType',
		slot: true,
		minWidth: 130,
		align: 'center'
	},
	{
		label: '人数',
		prop: 'groupCount',
		slot: true,
		minWidth: 60,
		align: 'center'
	},
	{
		label: '附件',
		prop: 'excelUrl',
		slot: true,
		minWidth: 80
	},
	{
		label: '日期',
		prop: 'dateTime',
		slot: false,
		minWidth: 95,
		sortable: 'custom'
	},
	{
		label: '开始时间',
		prop: 'startTime',
		slot: false,
		minWidth: 95,
		align: 'center',
		sortable: 'custom'
	},
	{
		label: '结束时间',
		prop: 'endTime',
		slot: false,
		minWidth: 75,
		align: 'center'
	},
	{
		label: '状态',
		prop: 'status',
		slot: true,
		minWidth: 80,
		align: 'center',
		exportFormatter: (value: BookingStatus) => statusMap[value]?.label ?? value
	},
	{
		label: '创建时间',
		prop: 'createTime',
		slot: false,
		minWidth: 150,
		sortable: 'custom'
	},
	{
		label: '操作',
		prop: 'action',
		slot: true,
		minWidth: 150,
		align: 'center',
		fixed: 'right'
	}
];

/** 状态映射 */
const statusMap: Record<BookingStatus, { label: string; type: '' | 'warning' | 'success' | 'info' | 'danger' }> = {
	0: { label: '未使用', type: 'warning' },
	1: { label: '已过期', type: 'info' },
	2: { label: '已使用', type: 'success' },
	3: { label: '已取消', type: 'danger' }
};

/** 手机号脱敏：前3后4，中间 **** */
// function maskPhone(phone: string): string {
// 	if (phone.length !== 11) return phone;
// 	return `${phone.slice(0, 3)}****${phone.slice(7)}`;
// }

/** 身份证脱敏：前3后4，中间 *********** */
// function maskIdCard(idCard: string): string {
// 	if (idCard.length < 8) return idCard;
// 	const starCount = idCard.length - 7;
// 	return `${idCard.slice(0, 3)}${'*'.repeat(starCount)}${idCard.slice(-4)}`;
// }

// 获取第一个成年人
function getPrimaryCompanion(row: BookingRow) {
	return row.members.find((companion) => companion.userPhone);
}

function hasMembers(row: BookingRow) {
	return Array.isArray(row.members) && row.members.length > 0;
}

function getBookingGroupType(row: BookingRow) {
	const isActivity = Number(row.activityId) !== 0;
	const isPersonal = hasMembers(row);

	if (isActivity && isPersonal) {
		return '活动预约（个人）';
	}

	if (isActivity && !isPersonal) {
		return '活动预约（团队）';
	}

	if (!isActivity && isPersonal) {
		return '个人预约';
	}

	return '团队预约';
}

function getBookingVisitLabel(row: BookingRow) {
	if (Number(row.activityId) !== 0) {
		return row.activityName || '-';
	}

	return hasMembers(row) ? '个人预约' : '团队预约';
}

function getBookingMemberCount(row: BookingRow) {
	return row.members?.length || row.colleagues || 0;
}

function getBookingDisplayName(row: BookingRow) {
	if (!hasMembers(row)) return row.name || '-';
	return getPrimaryCompanion(row)?.userName || '-';
}

function getBookingDisplayPhone(row: BookingRow) {
	if (!hasMembers(row)) return row.phone || '-';
	return getPrimaryCompanion(row)?.userPhone || '-';
}

// function getBookingDisplayIdCard(row: BookingRow) {
// 	if (!hasMembers(row)) return row.idNumber || '-';
// 	return getPrimaryCompanion(row)?.idNumber || '-';
// }

function getExportRows(row: BookingRow) {
	if (!hasMembers(row)) {
		return [
			{
				...row,
				visitLabel: getBookingVisitLabel(row),
				groupType: getBookingGroupType(row),
				name: getBookingDisplayName(row),
				phone: getBookingDisplayPhone(row),
				idCard: '-',
				groupCount: getBookingMemberCount(row)
			}
		];
	}

	return row.members.map((companion) => ({
		...row,
		visitLabel: getBookingVisitLabel(row),
		groupType: getBookingGroupType(row),
		reId: companion.reId || row.reId,
		name: companion.userName,
		phone: companion.userPhone,
		age: companion.userAge,
		idCard: companion.idNumber,
		groupCount: getBookingMemberCount(row)
	}));
}

function normalizeBookingRow(row: BookingRow): BookingViewRow {
	// const primaryCompanion = getPrimaryCompanion(row);
	const groupType = getBookingGroupType(row);
	const [startTime, endTime] = (row.timeSlot || '').split('-');

	return {
		...row,
		groupType,
		startTime,
		endTime
	};

	// if (!hasMembers(row) || !primaryCompanion) {
	// 	return {
	// 		...row,
	// 		reId: row.reId,
	// 		groupType,
	// 		startTime,
	// 		endTime
	// 	};
	// }

	// return {
	// 	...row,
	// 	groupType,
	// 	reId: row.reId || primaryCompanion.reId,
	// 	name: row.name || primaryCompanion.userName,
	// 	phone: row.phone || primaryCompanion.userPhone,
	// 	idNumber: row.idNumber || primaryCompanion.idNumber,
	// 	startTime,
	// 	endTime
	// };
}

const queryForm = ref({
	...getDefaultQueryDateRange(7),
	timeSlot: '' as string,
	name: '' as string,
	phone: '' as string,
	groupType: '' as string,
	status: '' as string
});

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

/** 成团方式选项 */
const groupTypeOptions = [
	{ label: '个人预约', value: '个人预约' },
	{ label: '团队预约', value: '团队预约' },
	{ label: '活动预约（个人）', value: '活动预约（个人）' },
	{ label: '活动预约（团队）', value: '活动预约（团队）' }
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
	{ label: '未使用', value: 0 },
	{ label: '已过期', value: 1 },
	{ label: '已使用', value: 2 },
	{ label: '已取消', value: 3 }
];

/** 表格展示数据（默认全部，查询后为过滤结果） */
const tableData = ref<BookingViewRow[]>([]);
const tableLoading = ref(false);
const pagination = reactive({
	currentPage: 1,
	pageSize: 10
});
const sortState = reactive<{
	prop: '' | 'dateTime' | 'startTime' | 'createTime';
	order: '' | 'ascending' | 'descending';
}>({
	prop: '',
	order: ''
});

function parseDateTimeString(dateStr: string) {
	return new Date(dateStr.replace(' ', 'T')).getTime();
}

function parseTimeString(timeStr: string) {
	const [hour = 0, minute = 0] = timeStr.split(':').map(Number);
	return hour * 60 + minute;
}

const sortedTableData = computed(() => {
	if (!sortState.prop || !sortState.order) {
		return tableData.value;
	}

	const sortFactor = sortState.order === 'ascending' ? 1 : -1;
	return [...tableData.value].sort((a, b) => {
		switch (sortState.prop) {
			case 'dateTime':
				return (parseDateString(a.dateTime).getTime() - parseDateString(b.dateTime).getTime()) * sortFactor;
			case 'startTime':
				return (parseTimeString(a.startTime) - parseTimeString(b.startTime)) * sortFactor;
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

function mapGroupTypeToApiValue(groupType: string) {
	const groupTypeMap: Record<string, number> = {
		个人预约: 1,
		团队预约: 2,
		'活动预约（个人）': 3,
		'活动预约（团队）': 4
	};

	return groupTypeMap[groupType];
}

function buildSearchParams(params = queryForm.value): SearchScienceReservationsParams {
	const requestParams: SearchScienceReservationsParams = {};

	if (params.startDate) requestParams.startDate = params.startDate;
	if (params.endDate) requestParams.endDate = params.endDate;
	if (params.timeSlot) requestParams.timeRange = params.timeSlot;
	if (params.name) requestParams.name = params.name;
	if (params.phone) requestParams.phone = params.phone;
	if (params.status !== '') requestParams.status = Number(params.status);

	const groupTypeValue = mapGroupTypeToApiValue(params.groupType);

	if (typeof groupTypeValue === 'number') {
		requestParams.groupType = groupTypeValue;
	}

	return requestParams;
}

async function loadAllBookings() {
	const response = await getAllScienceReservationsApi();
	tableData.value = (response.data ?? []).map(normalizeBookingRow);
	pagination.currentPage = 1;
}

async function searchBookings(params = queryForm.value) {
	const { data = [] } = await searchScienceReservationsNativeApi(buildSearchParams(params));
	tableData.value = (data ?? []).map(normalizeBookingRow);
	pagination.currentPage = 1;
}

async function fetchBookings(params = queryForm.value, useSearch = false) {
	tableLoading.value = true;

	try {
		if (useSearch) {
			await searchBookings(params);
			return;
		}
		await loadAllBookings();
	} finally {
		nextTick(() => {
			tableLoading.value = false;
		});
	}
}

/** 点击查询：多条件组合过滤 */
function handleSearch() {
	const { startDate, endDate } = queryForm.value;

	if (startDate && endDate && parseDateString(startDate).getTime() > parseDateString(endDate).getTime()) {
		ElMessage.warning('开始日期不可大于结束日期');
		return;
	}

	fetchBookings(queryForm.value, true);
}

/** 重置查询条件与数据 */
function handleReset() {
	queryForm.value = {
		...getDefaultQueryDateRange(7),
		timeSlot: '',
		name: '',
		phone: '',
		groupType: '',
		status: ''
	};
	fetchBookings(queryForm.value, true);
}

function handleSortChange({ prop, order }: { prop: string; order: 'ascending' | 'descending' | null }) {
	const sortableProps = ['dateTime', 'startTime', 'createTime'] as const;

	if (!sortableProps.includes(prop as (typeof sortableProps)[number])) {
		sortState.prop = '';
		sortState.order = '';
		return;
	}

	sortState.prop = (prop as (typeof sortableProps)[number]) ?? '';
	sortState.order = order ?? '';
	pagination.currentPage = 1;
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
			label: item.label as string,
			prop: item.prop as string,
			exportFormatter: item.exportFormatter
		}));

	// 手动插入年龄
	// exportColumns.splice(4, 0, {
	// 	label: '年龄',
	// 	prop: 'age'
	// });

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
		exportExcel(exportColumns, exportData, exportMode === 'current' ? '科普馆预约查询-当前页' : '科普馆预约查询');

		ElMessage.success('导出成功');
	} catch (error) {
		console.error(error);
		ElMessage.error('导出失败');
	}
}

/** 确认参观 */
function handleConfirm(reId: number) {
	ElMessageBox.confirm('确认该预约已参观？操作后状态将变更为「已使用」。', '确认参观', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning'
	})
		.then(() => {
			return confirmAttendanceApi({ reId });
		})
		.then((res) => {
			if (res.code === 200 && res.message === '修改成功！') {
				fetchBookings();
			} else {
				ElMessage.error(res.message ?? '操作失败！');
			}
		})
		.catch(() => {
			// 用户取消
		});
}

/** 取消参观 */
function handleCancel(reId: number) {
	ElMessageBox.confirm('确认取消该预约？操作后状态将变更为「已取消」，且不可恢复。', '取消参观', {
		confirmButtonText: '确认取消',
		cancelButtonText: '返回',
		type: 'warning',
		confirmButtonClass: 'el-button--danger'
	})
		.then(() => {
			return cancelAppointmentApi({ reId });
		})
		.then((res) => {
			if (res.code === 200 && res.message === '取消成功！') {
				fetchBookings();
			} else {
				ElMessage.error(res.message ?? '操作失败！');
			}
		})
		.catch(() => {
			// 用户取消
		});
}

function getStatusInfo(status: BookingStatus) {
	return statusMap[status];
}

watch(
	() => [tableData.value.length, pagination.pageSize],
	() => {
		const maxPage = Math.max(Math.ceil(tableData.value.length / pagination.pageSize), 1);
		if (pagination.currentPage > maxPage) {
			pagination.currentPage = maxPage;
		}
	}
);

onMounted(() => {
	fetchBookings(queryForm.value, true);
});
</script>

<style scoped>
.companion-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
	max-height: 320px;
	overflow-y: auto;
}

.companion-card {
	padding: 10px 12px;
	border: 1px solid var(--el-border-color-lighter);
	border-radius: 8px;
	background: var(--el-fill-color-blank);
}

.companion-card__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	margin-bottom: 6px;
}

.companion-card__name {
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.companion-card__meta {
	display: flex;
	flex-wrap: wrap;
	gap: 8px 12px;
	font-size: 12px;
	color: var(--el-text-color-regular);
}

.companion-card__phone {
	margin-top: 6px;
	font-size: 12px;
	color: var(--el-text-color-secondary);
}
</style>
