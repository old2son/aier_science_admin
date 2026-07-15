export interface DateRangeValue {
	startDate: string;
	endDate: string;
}

export function formatDate(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function getDefaultQueryDateRange(dayOffset: number) {
	const today = new Date();
	const endDate = new Date(today);
	endDate.setDate(endDate.getDate() + dayOffset);

	return {
		startDate: formatDate(today),
		endDate: formatDate(endDate)
	} satisfies DateRangeValue;
}
