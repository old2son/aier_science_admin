export interface TableColumn {
	type?: 'index' | 'selection' | 'expand';
	prop?: string;
	label?: string;
	width?: number | string;
	minWidth?: number | string;
	align?: 'left' | 'center' | 'right';
	fixed?: boolean | 'left' | 'right';
	showOverflowTooltip?: boolean;
	slot?: boolean;
	hide?: boolean;
	exportFormatter?: (value: any) => any;
}
