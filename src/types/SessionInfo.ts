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

export interface ActivitySessionRow {
	activityBannerUrl: string;
	activityCoverUrl: string;
	activityId: number;
	activityName: string;
	activityTime: string;
	createTime: string;
	endDate: string;
	endTime: string;
	operatorName: string | null;
	place: string;
	startTime: string;
	status: number;
	surplusNumber: number;
	theBackground: string;
	totalNumber: number;
	updateTime: string | null;
}

export interface ActivitySessionQuery {
	startDate?: string;
	endDate?: string;
}
