export type BookingStatus = 0 | 1 | 2 | 3;

export interface BookingMember {
	activityId: number;
	documentType: string;
	idNumber: string;
	reId: number;
	userAge: number;
	userName: string;
	userPhone: string;
}

export interface BookingRow {
	activityId: number;
	activityName: string;
	age: number | null;
	cancel: number | null;
	channel: string | null;
	colleagueName: string | null;
	colleagues: number;
	createTime: string;
	dateTime: string;
	excelUrl: string | null;
	expound: number;
	idNumber: string;
	members: BookingMember[];
	name: string | null;
	numbers: number;
	phone: string | null;
	reId: number;
	status: number;
	timeSlot: string;
	type: number;
	unitName: string | null;
	week: string;
}
