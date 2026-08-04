export interface ApiError {
	error: boolean;
	code: number;
	message: string;
	errors?: string[];
}

export interface ApiResponse<T> {
	error: boolean;
	code: number;
	message: string | null;
	data: T;
}

export interface DashboardSummary {
	today: number;
	yesterday: number;
	sent: number;
	failed: number;
	retrying?: number;
	templates?: number;
	totalSent?: number;
	totalFailed?: number;
	activeSessions?: number;
	totalServices?: number;
}

export interface VolumeData {
	date: string;
	sent: number;
	failed: number;
	total: number;
	serviceName?: string;
}

export interface StatusData {
	status: string;
	total: number;
}

export interface ActivityLog {
	action: string;
	description: string;
	createdAt: string;
	actorName?: string;
	serviceName?: string;
}

export interface RecentEmail {
	id: string;
	recipient: string;
	subject: string;
	status: 'pending' | 'sent' | 'failed' | 'retrying';
	retryCount: number;
	latencyMs: number | null;
}

export interface TopService {
	name: string;
	emailCount?: number;
	total?: number;
	failureRate?: number;
}

export interface TopTemplate {
	name: string;
	usage_count: number;
}

export interface InactiveCredential {
	credId: string;
	serviceName: string;
	credName: string;
}

export interface DashboardData {
	summary: DashboardSummary;
	volumeByDay: VolumeData[];
	statusDistribution: StatusData[];
	recentActivity: ActivityLog[];
	recentEmails: RecentEmail[];
	topServices?: TopService[];
	topServicesByFailures?: TopService[];
	topTemplates?: TopTemplate[];
	inactiveCredentials?: InactiveCredential[];
	nextScheduled?: string | null;
	queue?: any;
}
