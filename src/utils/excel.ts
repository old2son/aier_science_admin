import * as XLSX from 'xlsx';

export interface ExportColumn {
	label: string;
	prop: string;
	exportFormatter?: (value: any) => any;
}

export function exportExcel(columns: ExportColumn[], data: any[], fileName = '导出数据') {
	console.log(columns);
	const exportData = data.map((item) => {
		const row: Record<string, any> = {};

		columns.forEach((col) => {
			const value = item[col.prop];

			row[col.label] = col.exportFormatter ? col.exportFormatter(value) : value;
		});

		return row;
	});

	const ws = XLSX.utils.json_to_sheet(exportData);

	const wb = XLSX.utils.book_new();

	XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

	XLSX.writeFile(wb, `${fileName}.xlsx`);
}
