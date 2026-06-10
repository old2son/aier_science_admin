import { http, HttpResponse } from 'msw';

const sessionRows = [
	{
		id: 1,
		date: '2026-06-01',
		startTime: '09:00',
		endTime: '10:00',
		totalCount: 50,
		remainCount: 0,
		guideCount: 2,
		createdAt: '2026-05-28 14:22:00',
		operator: '张三'
	},
	{
		id: 2,
		date: '2026-06-02',
		startTime: '10:30',
		endTime: '11:30',
		totalCount: 40,
		remainCount: 15,
		guideCount: 1,
		createdAt: '2026-05-29 09:00:00',
		operator: '李四'
	},
	{
		id: 3,
		date: '2026-06-03',
		startTime: '09:00',
		endTime: '10:00',
		totalCount: 50,
		remainCount: 20,
		guideCount: 3,
		createdAt: '2026-05-28 14:22:00',
		operator: '张三'
	},
	{
		id: 4,
		date: '2026-06-03',
		startTime: '14:30',
		endTime: '15:30',
		totalCount: 50,
		remainCount: 35,
		guideCount: 2,
		createdAt: '2026-05-28 14:25:00',
		operator: '张三'
	},
	{
		id: 5,
		date: '2026-06-04',
		startTime: '09:00',
		endTime: '10:00',
		totalCount: 50,
		remainCount: 50,
		guideCount: 0,
		createdAt: '2026-05-29 09:10:00',
		operator: '李四'
	},
	{
		id: 6,
		date: '2026-06-05',
		startTime: '16:00',
		endTime: '17:00',
		totalCount: 40,
		remainCount: 8,
		guideCount: 1,
		createdAt: '2026-05-30 11:00:00',
		operator: '王五'
	}
];

const bookingRows = [
	{
		id: 1,
		name: '张三',
		phone: '13812341234',
		idCard: '310101199001011234',
		groupType: '团队预约',
		groupCount: 15,
		attachment: '身份证.pdf',
		date: '2026-06-03',
		startTime: '09:00',
		endTime: '10:00',
		status: 'verified',
		createdAt: '2026-06-01 10:30:00'
	},
	{
		id: 2,
		name: '李四',
		phone: '13987655678',
		idCard: '320203198503205678',
		groupType: '个人预约',
		groupCount: 3,
		attachment: '-',
		date: '2026-06-04',
		startTime: '14:30',
		endTime: '15:30',
		status: 'pending',
		createdAt: '2026-06-02 09:15:00'
	},
	{
		id: 3,
		name: '王五',
		phone: '13765439012',
		idCard: '330282197811089012',
		groupType: '团队预约',
		groupCount: 25,
		attachment: '团队名单.xlsx',
		date: '2026-06-01',
		startTime: '10:30',
		endTime: '11:30',
		status: 'expired',
		createdAt: '2026-05-28 16:20:00'
	},
	{
		id: 4,
		name: '赵六',
		phone: '13698763456',
		idCard: '440305199201023456',
		groupType: '个人预约',
		groupCount: 2,
		attachment: '-',
		date: '2026-06-05',
		startTime: '09:00',
		endTime: '10:00',
		status: 'pending',
		createdAt: '2026-06-03 08:45:00'
	},
	{
		id: 5,
		name: '孙七',
		phone: '13543217890',
		idCard: '510104198806157890',
		groupType: '团队预约',
		groupCount: 30,
		attachment: '团体预约表.docx',
		date: '2026-06-05',
		startTime: '16:00',
		endTime: '17:00',
		status: 'pending',
		createdAt: '2026-06-03 11:20:00'
	},
	{
		id: 6,
		name: '周八',
		phone: '13387652345',
		idCard: '420117199505122345',
		groupType: '个人预约',
		groupCount: 1,
		attachment: '-',
		date: '2026-06-02',
		startTime: '14:30',
		endTime: '15:30',
		status: 'verified',
		createdAt: '2026-05-30 14:55:00'
	}
];

const activityRows = [
	{
		id: 1,
		title: '2026年爱尔眼科公众开放日',
		background: '为提升公众爱眼护眼意识，开展眼健康科普宣传活动',
		location: '爱尔眼科医院一楼大厅',
		startDate: '2026-06-15',
		endDate: '2026-06-15',
		startTime: '09:00',
		endTime: '10:00',
		totalCount: 30,
		remainCount: 12,
		createdAt: '2026-06-01 10:00:00',
		operator: '管理员'
	},
	{
		id: 2,
		title: '全国爱眼日特别活动',
		background: '配合全国爱眼日开展系列科普活动',
		location: '爱尔眼科医院三楼报告厅',
		startDate: '2026-06-06',
		endDate: '2026-06-06',
		startTime: '14:30',
		endTime: '15:30',
		totalCount: 50,
		remainCount: 0,
		createdAt: '2026-05-20 09:30:00',
		operator: '张医生'
	},
	{
		id: 3,
		title: '青少年近视防控讲座',
		background: '针对中小学生开展近视防控科普讲座，提高防控意识',
		location: '爱尔眼科医院二楼会议室',
		startDate: '2026-06-20',
		endDate: '2026-06-20',
		startTime: '10:30',
		endTime: '11:30',
		totalCount: 40,
		remainCount: 25,
		createdAt: '2026-06-05 14:00:00',
		operator: '李医生'
	}
];

function inRange(date: string, startDate: string, endDate: string) {
	if (startDate && date < startDate) return false;
	if (endDate && date > endDate) return false;
	return true;
}

export const handlers = [
	http.post('/api/auth/login', async ({ request }) => {
		const body = (await request.json().catch(() => ({}))) as Partial<{
			username: string;
			password: string;
		}>;

		const username = body.username ?? '';
		const password = body.password ?? '';

		if (!username || !password) {
			return HttpResponse.json(
				{
					code: 400,
					message: '请输入账号和密码'
				},
				{ status: 400 }
			);
		}

		return HttpResponse.json({
			code: 0,
			message: 'success',
			data: {
				token: `mock-token-${Date.now()}`,
				userInfo: {
					id: 1,
					name: username,
					role: username === 'admin' ? '系统管理员' : '运营人员',
					avatar: ''
				}
			}
		});
	}),

	http.get('/api/science/sessions', ({ request }) => {
		const url = new URL(request.url);
		const startDate = url.searchParams.get('startDate') ?? '';
		const endDate = url.searchParams.get('endDate') ?? '';
		const list = sessionRows.filter((row) => inRange(row.date, startDate, endDate));

		return HttpResponse.json({
			code: 0,
			message: 'success',
			data: list
		});
	}),

	http.get('/api/science/bookings', ({ request }) => {
		const url = new URL(request.url);
		const startDate = url.searchParams.get('startDate') ?? '';
		const endDate = url.searchParams.get('endDate') ?? '';
		const timeSlot = url.searchParams.get('timeSlot') ?? '';
		const name = url.searchParams.get('name') ?? '';
		const phone = url.searchParams.get('phone') ?? '';
		const groupType = url.searchParams.get('groupType') ?? '';
		const status = url.searchParams.get('status') ?? '';
		const list = bookingRows.filter((row) => {
			if (!inRange(row.date, startDate, endDate)) return false;
			if (timeSlot && `${row.startTime}-${row.endTime}` !== timeSlot) return false;
			if (name && !row.name.includes(name)) return false;
			if (phone && !row.phone.includes(phone)) return false;
			if (groupType && row.groupType !== groupType) return false;
			if (status && row.status !== status) return false;
			return true;
		});

		return HttpResponse.json({
			code: 0,
			message: 'success',
			data: list
		});
	}),

	http.get('/api/activity/sessions', ({ request }) => {
		const url = new URL(request.url);
		const startDate = url.searchParams.get('startDate') ?? '';
		const endDate = url.searchParams.get('endDate') ?? '';
		const list = activityRows.filter((row) => {
			if (startDate && row.startDate < startDate) return false;
			if (endDate && row.endDate > endDate) return false;
			return true;
		});

		return HttpResponse.json({
			code: 0,
			message: 'success',
			data: list
		});
	})
];
