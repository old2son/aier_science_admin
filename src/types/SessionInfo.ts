export interface SessionRow {
	configId: number;
	createTime: string;
	dateTime: string;
	endTime: string;
	expound: number;
	operatorName: string;
	startTime: string;
	surplusNumber: number;
	totalNumber: number;
	updateTime: string | null;
}

export interface SessionQuery {
	startDate?: string;
	endDate?: string;
}
