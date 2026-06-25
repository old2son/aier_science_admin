<template>
	<!-- <el-table v-loading="tableLoading" :data="tableData" border stripe style="width: 100%">
		<el-table-column
			v-for="col in columns"
			:key="col.prop"
			:label="col.label"
			:prop="col.prop"
			:min-width="col.minWidth"
			:align="col.align"
		>
			<template v-if="col.slot" #default="scope">
				<slot :name="col.slot" v-bind="scope" />
			</template>

			<template v-else #default="{ row }">
				{{ row[col.prop] }}
			</template>
		</el-table-column>
	</el-table> -->

	<el-table v-loading="loading" :data="data" border stripe style="width: 100%">
		<el-table-column v-for="col in visibleColumns" :key="col.prop || col.type" v-bind="col">
			<template v-if="col.slot" #default="scope">
				<slot :name="col.prop" v-bind="scope" />
			</template>

			<template v-else #default="{ row, $index }">
				{{ getCellValue(row, col, $index) }}
			</template>
		</el-table-column>
	</el-table>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { TableColumn } from './types';

const props = defineProps<{
	loading?: boolean;
	data: any[];
	columns: TableColumn[];
}>();

const visibleColumns = computed(() => props.columns.filter((col) => !col.hide));

const getCellValue = (row: Record<string, any>, col: TableColumn, index: number) => {
	if (col.type === 'index') {
		return index + 1;
	}

	if (!col.prop) {
		return '';
	}

	return row[col.prop];
};
</script>
