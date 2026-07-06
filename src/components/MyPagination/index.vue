<template>
	<div v-if="shouldRender" class="pagination-wrap">
		<el-pagination
			v-model:current-page="currentPageProxy"
			v-model:page-size="pageSizeProxy"
			:total="total"
			:page-sizes="pageSizes"
			:layout="layout"
			:background="background"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
	defineProps<{
		total: number;
		currentPage: number;
		pageSize: number;
		pageSizes?: number[];
		layout?: string;
		background?: boolean;
		hideOnSinglePage?: boolean;
	}>(),
	{
		pageSizes: () => [10, 20, 50, 100],
		layout: 'total, sizes, prev, pager, next, jumper',
		background: true,
		hideOnSinglePage: true
	}
);

const emit = defineEmits<{
	(e: 'update:currentPage', value: number): void;
	(e: 'update:pageSize', value: number): void;
}>();

const shouldRender = computed(() => {
	if (!props.hideOnSinglePage) return true;
	return props.total > props.pageSize;
});

const currentPageProxy = computed({
	get: () => props.currentPage,
	set: (value: number) => emit('update:currentPage', value)
});

const pageSizeProxy = computed({
	get: () => props.pageSize,
	set: (value: number) => emit('update:pageSize', value)
});
</script>

<style scoped>
.pagination-wrap {
	display: flex;
	justify-content: flex-end;
	margin-top: 16px;
}
</style>

