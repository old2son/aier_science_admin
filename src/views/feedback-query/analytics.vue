<template>
	<div class="page-panel">
		<el-form :model="queryForm" inline class="feedback-query-form">
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
			<el-form-item>
				<el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
				<el-button @click="handleReset">重置</el-button>
			</el-form-item>
		</el-form>

		<div class="feedback-overview">
			<div class="feedback-stat-card">
				<div class="feedback-stat-card__label">反馈总数</div>
				<div ref="totalEl" class="feedback-stat-card__value"></div>
			</div>
			<div class="feedback-stat-card">
				<div class="feedback-stat-card__label">平均满意度</div>
				<div ref="avgEl" class="feedback-stat-card__value"></div>
			</div>
			<div class="feedback-stat-card">
				<div class="feedback-stat-card__label">正向推荐率</div>
				<div ref="rateEl" class="feedback-stat-card__value"></div>
			</div>
		</div>

		<div class="feedback-chart-grid">
			<div class="feedback-chart-card">
				<div class="feedback-chart-card__title">满意度概览</div>
				<div ref="satisfactionChartRef" class="feedback-chart"></div>
			</div>
			<div class="feedback-chart-card">
				<div class="feedback-chart-card__title">推荐率分布</div>
				<div ref="recommendChartRef" class="feedback-chart"></div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import { CountUp } from 'countup.js';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { getAllUserFeedbackApi, searchUserFeedbackApi } from '@/api/admin';
import type { Feedback } from '@/types/Feedback';
import { getDefaultQueryDateRange } from '@/utils/date';

defineOptions({
	name: 'FeedbackQueryAnalytics'
});

const queryForm = ref({
	...getDefaultQueryDateRange(7)
});
const tableData = ref<Feedback[]>([]);
const tableLoading = ref(false);
const satisfactionChartRef = ref<HTMLDivElement>();
const recommendChartRef = ref<HTMLDivElement>();
const totalEl = ref<HTMLElement>();
const avgEl = ref<HTMLElement>();
const rateEl = ref<HTMLElement>();

let satisfactionChart: echarts.ECharts | null = null;
let recommendChart: echarts.ECharts | null = null;

const recommendLabelMap: Record<string, string> = {
	'1': '会主动推荐',
	'2': '当有人问起时，会给予正面评价',
	'3': '不会推荐',
	会主动推荐: '会主动推荐',
	'当有人问起时，会给予正面评价': '当有人问起时，会给予正面评价',
	不会推荐: '不会推荐'
};

const feedbackStats = computed(() => {
	const total = tableData.value.length;

	if (!total) {
		return {
			total: 0,
			avgSatisfaction: 0,
			positiveRecommendRate: 0
		};
	}

	const activityTotal = tableData.value.reduce((sum, item) => sum + toSatisfactionNumber(item.activitySatisfied), 0);
	const serviceTotal = tableData.value.reduce((sum, item) => sum + toSatisfactionNumber(item.resSatisfied), 0);
	const facilityTotal = tableData.value.reduce((sum, item) => sum + toSatisfactionNumber(item.facSatisfied), 0);

	const positiveRecommendCount = tableData.value.filter((item) => {
		const recommend = normalizeRecommendValue(item.recommend);
		return recommend === '会主动推荐' || recommend === '当有人问起时，会给予正面评价';
	}).length;

	const avgSatisfaction = (activityTotal + serviceTotal + facilityTotal) / (total * 3);

	return {
		total,
		avgSatisfaction,
		positiveRecommendRate: (positiveRecommendCount / total) * 100
	};
});

const satisfactionChartData = computed(() => {
	const total = tableData.value.length || 1;

	return [
		{
			label: '预约流程满意度',
			value: tableData.value.reduce((sum, item) => sum + toSatisfactionNumber(item.resSatisfied), 0) / total
		},
		{
			label: '场馆设施满意度',
			value: tableData.value.reduce((sum, item) => sum + toSatisfactionNumber(item.facSatisfied), 0) / total
		},
		{
			label: '科普活动满意度',
			value: tableData.value.reduce((sum, item) => sum + toSatisfactionNumber(item.activitySatisfied), 0) / total
		},
	];
});

const recommendChartData = computed(() => {
	const recommendCountMap = {
		会主动推荐: 0,
		'当有人问起时，会给予正面评价': 0,
		不会推荐: 0
	};

	tableData.value.forEach((item) => {
		const recommend = normalizeRecommendValue(item.recommend);
		if (recommend in recommendCountMap) {
			recommendCountMap[recommend as keyof typeof recommendCountMap] += 1;
		}
	});

	return Object.entries(recommendCountMap).map(([name, value]) => ({
		name,
		value
	}));
});

watch(
	() => feedbackStats.value,
	(newVal) => {
		if (!newVal) return;

		if (totalEl.value) {
			new CountUp(totalEl.value, newVal.total).start();
		}

		if (avgEl.value) {
			new CountUp(avgEl.value, newVal.avgSatisfaction, {
				decimalPlaces: 1
			}).start();
		}

		if (rateEl.value) {
			new CountUp(rateEl.value, newVal.positiveRecommendRate, {
				decimalPlaces: 1,
				suffix: '%'
			}).start();
		}
	},
	{ immediate: true }
);

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

function normalizeRecommendValue(value: number | string) {
	const normalizedValue = String(value ?? '').trim();
	return recommendLabelMap[normalizedValue] || normalizedValue;
}

function toSatisfactionNumber(value: number | string) {
	const normalizedValue = Number(value);
	return Number.isFinite(normalizedValue) ? normalizedValue : 0;
}

function ensureCharts() {
	if (satisfactionChartRef.value && !satisfactionChart) {
		satisfactionChart = echarts.init(satisfactionChartRef.value);
	}

	if (recommendChartRef.value && !recommendChart) {
		recommendChart = echarts.init(recommendChartRef.value);
	}
}

function getEmptyChartOption(title: string): echarts.EChartsOption {
	return {
		title: {
			text: title,
			left: 'center',
			top: 'middle',
			textStyle: {
				fontSize: 14,
				fontWeight: 400,
				color: '#94a3b8'
			}
		}
	};
}

function renderCharts() {
	ensureCharts();

	if (satisfactionChart) {
		if (!tableData.value.length) {
			satisfactionChart.setOption(getEmptyChartOption('暂无满意度数据'), true);
		} else {
			satisfactionChart.setOption(
				{
					tooltip: {
						trigger: 'axis',
						axisPointer: {
							type: 'shadow'
						}
					},
					grid: {
						left: 24,
						right: 16,
						top: 28,
						bottom: 20,
						containLabel: true
					},
					xAxis: {
						type: 'category',
						data: satisfactionChartData.value.map((item) => item.label),
						axisTick: {
							show: false
						}
					},
					yAxis: {
						type: 'value',
						min: 0,
						max: 5,
						interval: 1
					},
					series: [
						{
							type: 'bar',
							barWidth: 42,
							data: satisfactionChartData.value.map((item) => Number(item.value.toFixed(2))),
							label: {
								show: true,
								position: 'top',
								formatter: '{c}'
							},
							itemStyle: {
								borderRadius: [8, 8, 0, 0],
								color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
									{ offset: 0, color: '#60a5fa' },
									{ offset: 1, color: '#2563eb' }
								])
							}
						}
					]
				},
				true
			);
		}
	}

	if (recommendChart) {
		if (!tableData.value.length) {
			recommendChart.setOption(getEmptyChartOption('暂无推荐数据'), true);
		} else {
			recommendChart.setOption(
				{
					tooltip: {
						trigger: 'item',
						formatter: '{b}: {c} ({d}%)'
					},
					legend: {
						bottom: 0,
						left: 'center'
					},
					series: [
						{
							name: '推荐率分布',
							type: 'pie',
							radius: ['48%', '72%'],
							center: ['50%', '45%'],
							label: {
								formatter: '{b}\n{d}%'
							},
							data: recommendChartData.value,
							color: ['#22c55e', '#f59e0b', '#94a3b8']
						}
					]
				},
				true
			);
		}
	}
}

function handleChartResize() {
	satisfactionChart?.resize();
	recommendChart?.resize();
}

async function fetchFeedbackList(params?: { startDate?: string; endDate?: string }) {
	tableLoading.value = true;

	try {
		const hasQuery = Boolean(params?.startDate || params?.endDate);
		const response = hasQuery ? await searchUserFeedbackApi(params ?? {}) : await getAllUserFeedbackApi();
		const { data = [] } = response;
		tableData.value = data.filter((item) => Number(item.status ?? 0) !== 1);
	} catch (error) {
		ElMessage.error((error as Error).message || '获取意见反馈失败');
	} finally {
		tableLoading.value = false;
	}
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

onMounted(() => {
	window.addEventListener('resize', handleChartResize);
	nextTick(() => {
		renderCharts();
	});
	fetchFeedbackList(queryForm.value);
});

onBeforeUnmount(() => {
	window.removeEventListener('resize', handleChartResize);
	satisfactionChart?.dispose();
	recommendChart?.dispose();
	satisfactionChart = null;
	recommendChart = null;
});

watch(
	() => tableData.value,
	() => {
		nextTick(() => {
			renderCharts();
		});
	},
	{ deep: true }
);
</script>

<style scoped>
.feedback-query-form {
	margin-bottom: 16px;
}

.feedback-overview {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 16px;
	margin-bottom: 16px;
}

.feedback-stat-card,
.feedback-chart-card {
	padding: 16px;
	border: 1px solid var(--el-border-color-light);
	border-radius: 12px;
	background: var(--el-bg-color);
}

.feedback-stat-card__label {
	font-size: 13px;
	color: var(--el-text-color-secondary);
}

.feedback-stat-card__value {
	margin-top: 8px;
	font-size: 28px;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.feedback-chart-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16px;
}

.feedback-chart-card__title {
	margin-bottom: 12px;
	font-size: 15px;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.feedback-chart {
	height: 320px;
}

@media (width <= 992px) {
	.feedback-overview,
	.feedback-chart-grid {
		grid-template-columns: 1fr;
	}
}
</style>
