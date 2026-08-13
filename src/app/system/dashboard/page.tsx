'use client';

import {
	Activity,
	AlertCircle,
	Clock,
	Loader2,
	Mail,
	Server,
	TrendingUp,
	Users,
	Zap,
	CheckCircle2,
	CalendarClock,
	CalendarDays,
	FileText,
	PlusCircle,
	MinusCircle,
	RefreshCw,
	MessageSquare,
	TrendingDown,
	Eye,
	ShieldAlert,
	Sun,
	Sunrise,
	Moon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { z } from 'zod';

const sseQueueSchema = z.object({
	waiting: z.number().nonnegative().default(0),
	active: z.number().nonnegative().default(0),
	completed: z.number().nonnegative().default(0),
	failed: z.number().nonnegative().default(0),
	delayed: z.number().nonnegative().default(0),
});
import {
	DashboardData,
	VolumeData,
	StatusData,
	ActivityLog,
	RecentEmail,
	TopService,
	TopTemplate,
	InactiveCredential,
} from '@/src/types/api';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/src/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/src/components/ui/select';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from '@/src/components/ui/sheet';
import { authClient } from '@/src/lib/auth-client';
import { apiFetch } from '@/src/lib/api';
import { useToast } from '@/src/hooks/use-toast';
import { useTour } from '@/src/hooks/use-tour';
import { Button } from '@/src/components/ui/button';

interface AppUser {
	id: string;
	name: string;
	email: string;
	role: 'super_admin' | 'admin' | 'user';
}

export default function DashboardPage() {
	const { data: session, isPending } = authClient.useSession();
	const { toast } = useToast();
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<DashboardData | null>(null);
	const [days, setDays] = useState(7);

	const [selectedEmail, setSelectedEmail] = useState<RecentEmail | null>(null);
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	const user = session?.user as AppUser | undefined;
	const isAdmin = (user?.role === 'super_admin' || user?.role === 'admin');

	const [sseStatus, setSseStatus] = useState<'connecting' | 'connected' | 'disconnected'>(
		'connecting',
	);

	const { startTour } = useTour([
		{
			element: '#tour-kpi-cards',
			popover: {
				title: 'Indicadores Principais',
				description: 'Visão rápida do volume de e-mails de hoje, taxa de entrega e os principais números da sua operação.',
				side: 'bottom',
			},
		},
		{
			element: '#tour-volume-chart',
			popover: {
				title: 'Volume de Envios',
				description: 'Compara enviados x falhas ao longo do período selecionado. Use o seletor de período no topo para ajustar a janela de análise.',
				side: 'top',
			},
		},
		{
			element: '#tour-status-chart',
			popover: {
				title: 'Distribuição por Status',
				description: 'Proporção de e-mails em cada status (enviado, pendente, falha, retentando) na janela atual.',
				side: 'left',
			},
		},
		{
			element: '#tour-activity-timeline',
			popover: {
				title: 'Atividade Recente',
				description: 'Linha do tempo de auditoria: criação de credenciais, templates, rotação de chaves e outras ações relevantes.',
				side: 'right',
			},
		},
		{
			element: '#tour-recent-emails',
			popover: {
				title: 'Últimos Envios',
				description: 'Os disparos mais recentes com status e latência. Clique no ícone de olho para ver detalhes e reprocessar envios falhos.',
				side: 'top',
			},
		},
		...(isAdmin
			? [
					{
						element: '#tour-queue-health',
						popover: {
							title: 'Saúde da Fila (Redis / BullMQ)',
							description: 'Métricas em tempo real (via SSE) da fila de processamento: quantos jobs estão esperando, ativos, concluídos ou falhados agora.',
							side: 'bottom' as const,
						},
					},
					{
						element: '#tour-infra-charts',
						popover: {
							title: 'Infraestrutura Global',
							description: 'Volume por serviço ao longo do tempo e ranking dos serviços com mais envios e mais falhas — útil para identificar tenants com problemas.',
							side: 'top' as const,
						},
					},
				]
			: [
					{
						element: '#tour-top-templates',
						popover: {
							title: 'Top Templates',
							description: 'Os templates mais usados nos seus serviços, ordenados por quantidade de disparos.',
							side: 'top' as const,
						},
					},
				]),
	]);

	const handleRetryEmail = async () => {
		if (!selectedEmail || !selectedEmail.serviceId) return;
		try {
			const res = await apiFetch(`/api/services/${selectedEmail.serviceId}/emails/${selectedEmail.id}/retry`, {
				method: 'POST',
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Erro ao reprocessar');

			toast({
				title: 'E-mail reenfileirado',
				description: data.message || 'O e-mail retornou para a fila (DLQ).',
			});

			setSelectedEmail((prev) => prev ? { ...prev, status: 'pending' } : prev);
		} catch (error: any) {
			toast({
				title: 'Erro ao reprocessar',
				description: error.message,
				variant: 'destructive',
			});
		}
	};

	useEffect(() => {
		let currentEventSource: EventSource | undefined;
		let reconnectTimeout: NodeJS.Timeout;
		let retryDelay = 1000;

		const initSSE = () => {
			if (!session) return;
			setSseStatus('connecting');

			const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1350';
			currentEventSource = new EventSource(`${API_URL}/api/dashboard/stream`, {
				withCredentials: true,
			});

			currentEventSource.onopen = () => {
				setSseStatus('connected');
				retryDelay = 1000; // Reseta o delay ao conectar com sucesso
			};

			currentEventSource.onmessage = (event) => {
				try {
					const rawData = JSON.parse(event.data);
					const queueData = sseQueueSchema.parse(rawData);
					setData((prev: DashboardData | null) => {
						if (!prev) return prev;
						return { ...prev, queue: queueData };
					});
				} catch (e) {
					console.warn('[SSE] Evento malformado recebido, ignorando...', e);
				}
			};

			currentEventSource.onerror = () => {
				if (currentEventSource) {
					currentEventSource.close();
				}
				setSseStatus('disconnected');
				
				// Reconexão com backoff exponencial (máx 30s)
				clearTimeout(reconnectTimeout);
				reconnectTimeout = setTimeout(() => {
					retryDelay = Math.min(retryDelay * 2, 30000);
					initSSE();
				}, retryDelay);
			};
		};

		if (session) {
			fetchDashboardData();
			initSSE();
		}

		return () => {
			if (currentEventSource) {
				currentEventSource.close();
			}
			clearTimeout(reconnectTimeout);
		};
	}, [session, days]);

	const fetchDashboardData = async () => {
		setLoading(true);
		try {
			const endpoint = isAdmin
				? `/api/dashboard/admin?days=${days}`
				: `/api/dashboard/user?days=${days}`;
			const response = await apiFetch(endpoint);
			const result = await response.json();

			if (response.ok) {
				setData(result.data);
			} else {
				toast({
					variant: 'destructive',
					title: 'Erro',
					description: result.message || 'Falha ao carregar métricas.',
				});
			}
		} catch {
			// silent: toast already handles user-visible errors
		} finally {
			setLoading(false);
		}
	};

	if (isPending || loading || !data || !data.summary) {
		return (
			<div className="flex h-[80vh] items-center justify-center">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-sm font-medium text-muted-foreground">Processando telemetria...</p>
				</div>
			</div>
		);
	}

	// Helper para Saudação
	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour >= 6 && hour < 12) return { text: 'Bom dia', Icon: Sunrise };
		if (hour >= 12 && hour < 18) return { text: 'Boa tarde', Icon: Sun };
		return { text: 'Boa noite', Icon: Moon };
	};
	const greeting = getGreeting();

	// Helper para Action Icon (Timeline)
	const getActionIcon = (action: string) => {
		if (action.includes('CREATED') || action.includes('ADDED'))
			return <PlusCircle className="h-4 w-4 text-emerald-500" />;
		if (action.includes('DELETED') || action.includes('REMOVED'))
			return <MinusCircle className="h-4 w-4 text-red-500" />;
		if (action.includes('UPDATED') || action.includes('TRANSFERRED'))
			return <RefreshCw className="h-4 w-4 text-blue-500" />;
		return <MessageSquare className="h-4 w-4 text-amber-500" />;
	};

	// Calculations
	const totalSent = isAdmin ? Number(data.summary.totalSent || 0) : Number(data.summary.sent || 0);
	const totalFailed = isAdmin
		? Number(data.summary.totalFailed || 0)
		: Number(data.summary.failed || 0);
	const totalAttempts = totalSent + totalFailed;
	const successRate = totalAttempts > 0 ? ((totalSent / totalAttempts) * 100).toFixed(1) : '100';

	// Delta Today vs Yesterday
	const todayCount = Number(data.summary.today || 0);
	const yesterdayCount = Number(data.summary.yesterday || 0);
	const deltaToday =
		yesterdayCount === 0
			? todayCount > 0
				? 100
				: 0
			: ((todayCount - yesterdayCount) / yesterdayCount) * 100;

	const deltaIcon =
		deltaToday >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
	const deltaColor = deltaToday >= 0 ? 'text-emerald-600' : 'text-red-500';

	// ==========================================
	// CONFIGURAÇÕES DE GRÁFICOS ECHARTS
	// ==========================================

	// 1. Gráfico de Volume por Dia (Stacked Bar)
	const getVolumeByDayOption = (volumeData: VolumeData[]) => {
		const dates = (volumeData || []).map((d: VolumeData) =>
			new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
		);
		const sentValues = (volumeData || []).map((d: VolumeData) => Number(d.sent || 0));
		const failedValues = (volumeData || []).map((d: VolumeData) => Number(d.failed || 0));

		return {
			backgroundColor: 'transparent',
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' },
			},
			legend: { data: ['Enviados', 'Falhas'], bottom: 0 },
			grid: { top: 20, left: 10, right: 10, bottom: 30, containLabel: true },
			xAxis: {
				type: 'category',
				data: dates,
				axisLine: { lineStyle: { color: '#cbd5e1' } },
				axisLabel: { color: '#64748b' },
			},
			yAxis: {
				type: 'value',
				splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
				axisLabel: { color: '#64748b' },
			},
			series: [
				{
					name: 'Enviados',
					type: 'bar',
					stack: 'total',
					data: sentValues,
					itemStyle: { color: '#10b981' },
				},
				{
					name: 'Falhas',
					type: 'bar',
					stack: 'total',
					data: failedValues,
					itemStyle: { color: '#ef4444' },
				},
			],
		};
	};

	// 1b. Volume Multi-Série (Admin Only)
	const getVolumeByServiceOption = (volumeData: VolumeData[]) => {
		if (!volumeData || volumeData.length === 0) return {};

		const datesSet = new Set<string>();
		const servicesSet = new Set<string>();

		volumeData.forEach((d: VolumeData) => {
			datesSet.add(d.date);
			if (d.serviceName) servicesSet.add(d.serviceName);
		});

		const dates = Array.from(datesSet).sort();
		const services = Array.from(servicesSet);

		const series = services.map((service) => {
			return {
				name: service,
				type: 'line',
				smooth: true,
				data: dates.map((date) => {
					const entry = volumeData.find((d: VolumeData) => d.date === date && d.serviceName === service);
					return entry ? entry.total : 0;
				}),
			};
		});

		return {
			backgroundColor: 'transparent',
			tooltip: { trigger: 'axis' },
			legend: { data: services, bottom: 0, type: 'scroll' },
			grid: { top: 20, left: 10, right: 10, bottom: 30, containLabel: true },
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: dates.map((d) =>
					new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
				),
				axisLine: { lineStyle: { color: '#cbd5e1' } },
			},
			yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } } },
			series,
		};
	};

	// 2. Gráfico de Distribuição de Status (Donut)
	const getStatusDistributionOption = (statusData: StatusData[]) => {
		const colorMap: Record<string, string> = {
			sent: '#10b981', // Emerald
			pending: '#f59e0b', // Amber
			failed: '#ef4444', // Red
			retrying: '#3b82f6', // Blue
		};

		const formattedData = (statusData || []).map((d: StatusData) => ({
			value: Number(d.total),
			name: d.status.charAt(0).toUpperCase() + d.status.slice(1),
			itemStyle: { color: colorMap[d.status] || '#94a3b8' },
		}));

		return {
			backgroundColor: 'transparent',
			tooltip: { trigger: 'item' },
			legend: { top: 'bottom' },
			series: [
				{
					name: 'Status',
					type: 'pie',
					radius: ['45%', '70%'],
					avoidLabelOverlap: false,
					itemStyle: {
						borderRadius: 5,
						borderColor: '#fff',
						borderWidth: 2,
					},
					label: { show: false, position: 'center', formatter: '{b}\n{d}%' },
					emphasis: {
						label: { show: true, fontSize: 16, fontWeight: 'bold' },
					},
					labelLine: { show: false },
					data: formattedData,
				},
			],
		};
	};

	// 3. Admin: Top Serviços por Volume (Horizontal Bar)
	const getTopServicesOption = (topServices: TopService[]) => {
		const names = (topServices || []).map((s: TopService) => s.name);
		const counts = (topServices || []).map((s: TopService) => Number(s.emailCount || s.total || 0));
		return {
			backgroundColor: 'transparent',
			tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
			grid: { top: 10, left: 10, right: 10, bottom: 10, containLabel: true },
			xAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false } },
			yAxis: {
				type: 'category',
				inverse: true,
				data: names,
				axisLabel: { color: '#64748b', fontSize: 11, width: 120, overflow: 'truncate' },
			},
			series: [
				{
					name: 'Métricas',
					type: 'bar',
					data: counts,
					barMaxWidth: 20,
					itemStyle: {
						color: {
							type: 'linear',
							x: 0,
							y: 0,
							x2: 1,
							y2: 0,
							colorStops: [
								{ offset: 0, color: '#6366f1' },
								{ offset: 1, color: '#0ea5e9' },
							],
						},
						borderRadius: [0, 4, 4, 0],
					},
				},
			],
		};
	};

	const getTopServicesFailuresOption = (topServices: TopService[]) => {
		const names = (topServices || []).map((s: TopService) => s.name);
		const rates = (topServices || []).map((s: TopService) => Number(s.failureRate || 0));
		return {
			backgroundColor: 'transparent',
			tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c}% Falhas' },
			grid: { top: 10, left: 10, right: 10, bottom: 10, containLabel: true },
			xAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false } },
			yAxis: {
				type: 'category',
				inverse: true,
				data: names,
				axisLabel: { color: '#64748b', fontSize: 11, width: 120, overflow: 'truncate' },
			},
			series: [
				{
					name: 'Taxa Falha',
					type: 'bar',
					data: rates,
					barMaxWidth: 20,
					itemStyle: {
						color: '#ef4444',
						borderRadius: [0, 4, 4, 0],
					},
				},
			],
		};
	};

	// 4. User: Top templates por uso
	const getTopTemplatesOption = (topTemplates: TopTemplate[]) => {
		const names = (topTemplates || []).map((t: TopTemplate) => t.name);
		const counts = (topTemplates || []).map((t: TopTemplate) => Number(t.usage_count || 0));
		return {
			backgroundColor: 'transparent',
			tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
			grid: { top: 10, left: 10, right: 10, bottom: 10, containLabel: true },
			xAxis: {
				type: 'value',
				axisLabel: { color: '#64748b' },
				splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
			},
			yAxis: {
				type: 'category',
				inverse: true,
				data: names,
				axisLabel: { color: '#64748b', fontSize: 11, width: 120, overflow: 'truncate' },
			},
			series: [
				{
					name: 'Usos',
					type: 'bar',
					data: counts,
					barMaxWidth: 20,
					itemStyle: {
						color: {
							type: 'linear',
							x: 0,
							y: 0,
							x2: 1,
							y2: 0,
							colorStops: [
								{ offset: 0, color: '#10b981' },
								{ offset: 1, color: '#0ea5e9' },
							],
						},
						borderRadius: [0, 4, 4, 0],
					},
				},
			],
		};
	};

	// ==========================================
	// CONFIGURAÇÃO DOS CARDS DE KPI
	// ==========================================
	const kpiCards = isAdmin
		? [
			{
				label: 'E-mails Hoje',
				value: todayCount.toLocaleString('pt-BR'),
				icon: Zap,
				color: 'text-blue-600',
				bg: 'bg-blue-100',
				desc: (
					<span className={`flex items-center gap-1 ${deltaColor}`}>
						{deltaIcon} {Math.abs(deltaToday).toFixed(1)}% vs Ontem
					</span>
				),
			},
			{
				label: 'Taxa de Entrega Global',
				value: `${successRate}%`,
				icon: CheckCircle2,
				color: 'text-emerald-600',
				bg: 'bg-emerald-100',
				desc: 'Taxa histórica',
			},
			{
				label: 'Sessões Ativas',
				value: data.summary.activeSessions || 0,
				icon: Users,
				color: 'text-slate-600',
				bg: 'bg-slate-200',
				desc: 'Usuários online (tokens válidos)',
			},
			{
				label: 'Serviços Registrados',
				value: data.summary.totalServices || 0,
				icon: Server,
				color: 'text-indigo-600',
				bg: 'bg-indigo-100',
				desc: 'Projetos ativos na plataforma',
			},
		]
		: [
			{
				label: 'E-mails Hoje',
				value: todayCount.toLocaleString('pt-BR'),
				icon: Mail,
				color: 'text-blue-600',
				bg: 'bg-blue-100',
				desc: (
					<span className={`flex items-center gap-1 ${deltaColor}`}>
						{deltaIcon} {Math.abs(deltaToday).toFixed(1)}% vs Ontem
					</span>
				),
			},
			{
				label: 'Status Pendentes / Falhas',
				value: `${data.summary.failed || 0} / ${data.summary.retrying || 0}`,
				icon: AlertCircle,
				color: 'text-red-600',
				bg: 'bg-red-100',
				desc: 'Falhas permanentes / Em retentativa',
			},
			{
				label: 'Próximo Agendado',
				value: data.nextScheduled
					? new Date(data.nextScheduled).toLocaleTimeString('pt-BR', {
						hour: '2-digit',
						minute: '2-digit',
					})
					: 'Nenhum',
				icon: CalendarClock,
				color: 'text-purple-600',
				bg: 'bg-purple-100',
				desc: data.nextScheduled
					? new Date(data.nextScheduled).toLocaleDateString('pt-BR')
					: 'Sem fila agendada',
			},
			{
				label: 'Templates Ativos',
				value: data.summary.templates || 0,
				icon: FileText,
				color: 'text-indigo-600',
				bg: 'bg-indigo-100',
				desc: 'Prontos para uso',
			},
		];

	return (
		<div className="space-y-6 animate-in fade-in duration-300 ease-out">
			{/* Alerta de Credenciais Inativas */}
			{!isAdmin && data.inactiveCredentials && data.inactiveCredentials.length > 0 && (
				<div className="bg-destructive/8 border border-destructive/20 text-destructive p-4 rounded-xl flex items-start gap-3">
					<ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
					<div>
						<h4 className="font-semibold text-sm">Credenciais Inativas Detectadas</h4>
						<p className="text-xs mt-1 mb-2 text-destructive/80">
							Os seguintes serviços estão com credenciais desativadas ou inválidas. As próximas
							entregas falharão silenciosamente até serem corrigidas:
						</p>
						<ul className="list-disc list-inside text-xs font-medium bg-destructive/5 p-2.5 rounded-lg">
							{data.inactiveCredentials.map((c: InactiveCredential) => (
								<li key={c.credId}>
									Serviço <strong>{c.serviceName}</strong> — {c.credName}
								</li>
							))}
						</ul>
					</div>
				</div>
			)}

			{/* Cabeçalho */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
						<greeting.Icon className="h-5 w-5 text-muted-foreground shrink-0" />
						{greeting.text}, {user?.name?.split(' ')[0] || 'Usuário'}!
						{isAdmin && (
							<Badge
								variant="outline"
								className="ml-1 bg-primary/10 text-primary border-primary/20 font-medium text-xs"
							>
								Admin
							</Badge>
						)}
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Aqui está o resumo da sua operação de e-mails.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button
						onClick={startTour}
						variant="outline"
						className="cursor-pointer border-primary text-primary hover:bg-primary/10"
					>
						Tour Guiado
					</Button>
					<Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
						<SelectTrigger className="w-[168px] bg-background gap-2">
							<CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
							<SelectValue placeholder="Período" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7">Últimos 7 dias</SelectItem>
							<SelectItem value="14">Últimos 14 dias</SelectItem>
							<SelectItem value="30">Últimos 30 dias</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* KPI Cards */}
			<div id="tour-kpi-cards" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{kpiCards.map((stat, i) => (
					<Card key={i} className="shadow-sm">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
							<div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
								<stat.icon className="h-4 w-4" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold tracking-tight">{stat.value}</div>
							<div className="text-xs text-muted-foreground mt-1">{stat.desc}</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Gráficos e Timeline */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Gráfico 1: Volume de Envios */}
				<Card id="tour-volume-chart" className="col-span-1 lg:col-span-2 flex flex-col shadow-sm">
					<CardHeader>
						<CardTitle>Volume de Envios ({days} dias)</CardTitle>
						<CardDescription>Quantidade de e-mails enviados e falhas acumuladas</CardDescription>
					</CardHeader>
					<CardContent className="flex-1 min-h-[280px]">
						{!data.volumeByDay || data.volumeByDay.length === 0 ? (
							<div className="h-full flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-xl py-10">
								Aguardando tráfego para gerar gráficos.
							</div>
						) : (
							<ReactECharts
								option={getVolumeByDayOption(data.volumeByDay)}
								style={{ height: '100%', width: '100%' }}
								opts={{ renderer: 'svg' }}
							/>
						)}
					</CardContent>
				</Card>

				{/* Gráfico 2: Distribuição de Status */}
				<Card id="tour-status-chart" className="flex flex-col shadow-sm">
					<CardHeader>
						<CardTitle>Distribuição por Status</CardTitle>
						<CardDescription>Visualização do estado atual de envios</CardDescription>
					</CardHeader>
					<CardContent className="flex-1 min-h-[280px]">
						{!data.statusDistribution || data.statusDistribution.length === 0 ? (
							<div className="h-full flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-xl py-10">
								Sem dados disponíveis
							</div>
						) : (
							<ReactECharts
								option={getStatusDistributionOption(data.statusDistribution)}
								style={{ height: '100%', width: '100%' }}
								opts={{ renderer: 'svg' }}
							/>
						)}
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Timeline de Atividades */}
				<Card id="tour-activity-timeline" className="col-span-1 flex flex-col max-h-[500px] shadow-sm">
					<CardHeader>
						<CardTitle>Atividade Recente</CardTitle>
						<CardDescription>Últimas ações na plataforma</CardDescription>
					</CardHeader>
					<CardContent className="flex-1 overflow-y-auto">
						{!data.recentActivity || data.recentActivity.length === 0 ? (
							<div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl">
								<p className="text-sm">Nenhuma atividade recente.</p>
							</div>
						) : (
							<div className="relative border-l border-muted-foreground/20 ml-3 space-y-6 pb-2">
								{data.recentActivity.map((log: ActivityLog, idx: number) => (
									<div key={idx} className="relative pl-6">
										<span className="absolute -left-2 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background border border-border">
											{getActionIcon(log.action)}
										</span>
										<div className="flex flex-col gap-0.5">
											<span className="text-xs text-muted-foreground">
												{new Date(log.createdAt).toLocaleString('pt-BR', {
													dateStyle: 'short',
													timeStyle: 'short',
												})}
											</span>
											<p className="text-sm text-foreground leading-snug">{log.description}</p>
											<p className="text-xs text-muted-foreground mt-0.5">
												Por <strong>{log.actorName || 'Sistema'}</strong> —{' '}
												<span className="text-primary/80">{log.serviceName || 'Desconhecido'}</span>
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Envios Recentes */}
				<Card id="tour-recent-emails" className="col-span-1 lg:col-span-2 flex flex-col max-h-[500px] shadow-sm">
					<CardHeader>
						<CardTitle>Últimos Envios e Disparos</CardTitle>
						<CardDescription>
							Acompanhe o status e a latência de entrega em tempo real.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex-1 overflow-y-auto">
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Destinatário / Assunto</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Tentativas</TableHead>
										<TableHead>Latência</TableHead>
										<TableHead className="text-right">Ação</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{!data.recentEmails || data.recentEmails.length === 0 ? (
										<TableRow>
											<TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
												Nenhum disparo encontrado.
											</TableCell>
										</TableRow>
									) : (
										data.recentEmails.map((mail: RecentEmail) => (
											<TableRow key={mail.id} className="group">
												<TableCell>
													<div className="flex flex-col gap-0.5">
														<span
															className="font-medium text-sm truncate max-w-[200px]"
															title={mail.recipient}
														>
															{mail.recipient}
														</span>
														<span
															className="text-xs text-muted-foreground truncate max-w-[200px]"
															title={mail.subject}
														>
															{mail.subject}
														</span>
													</div>
												</TableCell>
												<TableCell>
													{mail.status === 'sent' ? (
														<Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none font-bold">
															Entregue
														</Badge>
													) : mail.status === 'failed' ? (
														<Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none font-bold">
															Falha
														</Badge>
													) : (
														<Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none font-bold">
															{mail.status === 'pending'
																? 'Pendente'
																: mail.status === 'retrying'
																	? 'Retentando'
																	: mail.status}
														</Badge>
													)}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
														<RefreshCw className="h-3 w-3" />
														{mail.retryCount}x
													</div>
												</TableCell>
												<TableCell>
													<div className="text-xs text-muted-foreground font-mono">
														{mail.latencyMs !== null ? `${mail.latencyMs} ms` : '-'}
													</div>
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-muted-foreground hover:text-primary"
														onClick={() => {
															setSelectedEmail(mail);
															setIsSheetOpen(true);
														}}
													>
														<Eye className="h-4 w-4" />
													</Button>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* ========================================== */}
			{/* PAINEL DE INFRAESTRUTURA (ADMIN ONLY)      */}
			{/* ========================================== */}
			{isAdmin && (
				<div className="space-y-6 pt-6 border-t mt-8">
					<div>
						<h3 className="text-lg font-bold flex items-center gap-2">
							<Server className="h-5 w-5 text-indigo-500" />
							Painel de Infraestrutura Global
						</h3>
						<p className="text-sm text-muted-foreground">
							Métricas técnicas da plataforma, filas BullMQ e performance de tenants.
						</p>
					</div>

					{/* Fila Real-Time */}
					<Card id="tour-queue-health" className="shadow-sm">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<div>
								<CardTitle>Saúde da Fila (Redis / BullMQ)</CardTitle>
								<CardDescription>Monitoramento real-time dos workers de envio.</CardDescription>
							</div>
							<div className="flex items-center gap-2">
								{sseStatus === 'disconnected' && (
									<Button
										size="sm"
										variant="outline"
										onClick={() => window.location.reload()}
										className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
									>
										<RefreshCw className="h-4 w-4" />
										Reconectar Live
									</Button>
								)}
								{sseStatus === 'connected' && (
									<Badge
										variant="outline"
										className="bg-emerald-50 text-emerald-600 border-emerald-200 shadow-none"
									>
										<div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
										Live
									</Badge>
								)}
								{sseStatus === 'connecting' && (
									<Badge
										variant="outline"
										className="bg-amber-50 text-amber-600 border-amber-200 shadow-none hover:bg-amber-50"
									>
										<Loader2 className="h-3 w-3 mr-1 animate-spin" />
										Conectando
									</Badge>
								)}
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
								<div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center text-center gap-0.5">
									<Clock className="h-4 w-4 text-amber-500 mb-1" />
									<span className="text-2xl font-bold tracking-tight text-amber-700">
										{data.queue?.waiting || 0}
									</span>
									<span className="text-xs font-medium text-amber-600">
										Espera
									</span>
								</div>
								<div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-center gap-0.5">
									<Activity className="h-4 w-4 text-blue-500 mb-1" />
									<span className="text-2xl font-bold tracking-tight text-blue-700">
										{data.queue?.active || 0}
									</span>
									<span className="text-xs font-medium text-blue-600">
										Ativo
									</span>
								</div>
								<div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center text-center gap-0.5">
									<CheckCircle2 className="h-4 w-4 text-emerald-500 mb-1" />
									<span className="text-2xl font-bold tracking-tight text-emerald-700">
										{data.queue?.completed || 0}
									</span>
									<span className="text-xs font-medium text-emerald-600">
										Concluído
									</span>
								</div>
								<div className="p-4 rounded-xl bg-red-50 border border-red-100 flex flex-col items-center justify-center text-center gap-0.5">
									<AlertCircle className="h-4 w-4 text-red-500 mb-1" />
									<span className="text-2xl font-bold tracking-tight text-red-700">{data.queue?.failed || 0}</span>
									<span className="text-xs font-medium text-red-600">
										Falha
									</span>
								</div>
								<div className="p-4 rounded-xl bg-purple-50 border border-purple-100 flex flex-col items-center justify-center text-center gap-0.5">
									<CalendarClock className="h-4 w-4 text-purple-500 mb-1" />
									<span className="text-2xl font-bold tracking-tight text-purple-700">
										{data.queue?.delayed || 0}
									</span>
									<span className="text-xs font-medium text-purple-600">
										Agendado
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Grafico Multi-Serie e Top Serviços */}
					<div id="tour-infra-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card className="shadow-sm">
							<CardHeader>
								<CardTitle>Volume Multi-Tenants ({days} dias)</CardTitle>
								<CardDescription>
									Carga de envios agrupada por serviço ao longo do tempo.
								</CardDescription>
							</CardHeader>
							<CardContent className="min-h-[250px]">
								{!data.volumeByService || data.volumeByService.length === 0 ? (
									<div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg py-8">
										Sem dados disponíveis.
									</div>
								) : (
									<ReactECharts
										option={getVolumeByServiceOption(data.volumeByService)}
										style={{ height: '100%', width: '100%', minHeight: '250px' }}
										opts={{ renderer: 'svg' }}
									/>
								)}
							</CardContent>
						</Card>

						<div className="grid grid-cols-1 gap-6">
							<Card className="shadow-sm">
								<CardHeader className="pb-2">
									<CardTitle className="text-sm">Top Serviços: Volume</CardTitle>
								</CardHeader>
								<CardContent>
									{!data.topServicesByVolume || data.topServicesByVolume.length === 0 ? (
										<div className="h-[100px] flex items-center justify-center text-muted-foreground text-xs border border-dashed rounded">
											Nenhum dado.
										</div>
									) : (
										<ReactECharts
											option={getTopServicesOption(data.topServicesByVolume)}
											style={{ height: '120px', width: '100%' }}
											opts={{ renderer: 'svg' }}
										/>
									)}
								</CardContent>
							</Card>

							<Card className="shadow-sm">
								<CardHeader className="pb-2">
									<CardTitle className="text-sm">Top Serviços: Falhas (Crítico)</CardTitle>
								</CardHeader>
								<CardContent>
									{!data.topServicesByFailures || data.topServicesByFailures.length === 0 ? (
										<div className="h-[100px] flex items-center justify-center text-muted-foreground text-xs border border-dashed rounded">
											Nenhum dado.
										</div>
									) : (
										<ReactECharts
											option={getTopServicesFailuresOption(data.topServicesByFailures)}
											style={{ height: '120px', width: '100%' }}
											opts={{ renderer: 'svg' }}
										/>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			)}

			{/* ========================================== */}
			{/* CONTEXTO USER (Templates)                  */}
			{/* ========================================== */}
			{!isAdmin && (
				<Card id="tour-top-templates" className="shadow-sm">
					<CardHeader>
						<CardTitle>Top 5 Templates por Uso</CardTitle>
						<CardDescription>
							Templates com mais disparos acumulados nos seus serviços.
						</CardDescription>
					</CardHeader>
					<CardContent className="min-h-[220px]">
						{!data.topTemplates || data.topTemplates.length === 0 ? (
							<div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg py-8">
								Nenhum template utilizado ainda.
							</div>
						) : (
							<ReactECharts
								option={getTopTemplatesOption(data.topTemplates)}
								style={{
									height: `${Math.max(180, data.topTemplates.length * 40)}px`,
									width: '100%',
								}}
								opts={{ renderer: 'svg' }}
							/>
						)}
					</CardContent>
				</Card>
			)}

			{/* Sheet de Detalhes de Email */}
			<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
				<SheetContent className="w-[90vw] sm:max-w-[450px] overflow-y-auto p-6 overflow-x-hidden flex flex-col gap-0">
					<SheetHeader className="mb-6 shrink-0">
						<SheetTitle className="flex items-center gap-2">
							<Mail className="h-5 w-5 text-primary" />
							Detalhes do Envio
						</SheetTitle>
						<SheetDescription>
							Verifique as credenciais, logs de erro e latência desse disparo.
						</SheetDescription>
					</SheetHeader>

					{selectedEmail && (
						<div className="space-y-6 w-full flex-1">
							{/* Status e Infos */}
							<div className="grid grid-cols-2 gap-x-4 gap-y-6 w-full">
								<div className="space-y-1 min-w-0">
									<label className="text-[10px] uppercase font-bold text-muted-foreground truncate block">
										Status Atual
									</label>
									<div>
										{selectedEmail.status === 'sent' ? (
											<Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none font-bold">
												Entregue
											</Badge>
										) : selectedEmail.status === 'failed' ? (
											<Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none font-bold">
												Falhou
											</Badge>
										) : (
											<Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none font-bold truncate max-w-full block">
												{selectedEmail.status}
											</Badge>
										)}
									</div>
								</div>
								<div className="space-y-1 min-w-0">
									<label className="text-[10px] uppercase font-bold text-muted-foreground truncate block">
										Prioridade
									</label>
									<div>
										<Badge
											variant="outline"
											className="text-[10px] uppercase truncate max-w-full block"
										>
											{selectedEmail.priority}
										</Badge>
									</div>
								</div>

								<div className="space-y-1 min-w-0">
									<label
										className="text-[10px] uppercase font-bold text-muted-foreground truncate block"
										title="Latência BullMQ"
									>
										Latência
									</label>
									<div
										className="text-xs font-mono font-medium truncate w-full"
										title={
											selectedEmail.latencyMs ? `${selectedEmail.latencyMs} ms` : 'Processando...'
										}
									>
										{selectedEmail.latencyMs ? `${selectedEmail.latencyMs} ms` : 'Processando...'}
									</div>
								</div>
								<div className="space-y-1 min-w-0">
									<label className="text-[10px] uppercase font-bold text-muted-foreground truncate block">
										Tentativas
									</label>
									<div className="text-xs font-mono font-medium truncate w-full">
										{selectedEmail.retryCount}x
									</div>
								</div>
							</div>

							<div className="border-t pt-4 space-y-4 w-full">
								<div className="space-y-1 w-full min-w-0">
									<label className="text-[10px] uppercase font-semibold tracking-widest text-muted-foreground block">
										Destinatário
									</label>
									<div className="text-sm font-medium p-2.5 bg-muted rounded-xl break-words w-full overflow-hidden">
										{selectedEmail.recipient}
									</div>
								</div>
								<div className="space-y-1 w-full min-w-0">
									<label className="text-[10px] uppercase font-semibold tracking-widest text-muted-foreground block">
										Assunto
									</label>
									<div className="text-sm p-2.5 bg-muted rounded-xl break-words w-full overflow-hidden">
										{selectedEmail.subject}
									</div>
								</div>
								<div className="space-y-1 w-full min-w-0">
									<label className="text-[10px] uppercase font-semibold tracking-widest text-muted-foreground block">
										Serviço de Origem
									</label>
									<div className="text-sm p-2.5 bg-primary/10 text-primary font-semibold rounded-xl break-words w-full overflow-hidden">
										{selectedEmail.serviceName}
									</div>
								</div>
							</div>

							{/* Erro */}
							{selectedEmail.errorLog && (
								<div className="border-t pt-4 w-full">
									<div className="flex items-center justify-between mb-2">
										<label className="text-[10px] uppercase font-bold text-red-600 flex items-center gap-1">
											<AlertCircle className="h-3 w-3 shrink-0" /> Log de Erro / Exception
										</label>
										{selectedEmail.status === 'failed' && (
											<Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={handleRetryEmail}>
												<RefreshCw className="h-3 w-3" /> Reprocessar
											</Button>
										)}
									</div>
									<pre className="text-[10px] p-3 bg-red-50 text-red-900 border border-red-200 rounded-md whitespace-pre-wrap break-all max-h-[150px] overflow-y-auto w-full overflow-x-hidden">
										{selectedEmail.errorLog}
									</pre>
								</div>
							)}

							<div className="border-t pt-4 space-y-3 w-full">
								<div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground w-full">
									<div className="min-w-0">
										<span className="block text-[10px] uppercase mb-0.5 truncate">Criado em:</span>
										<span className="font-mono truncate block">
											{selectedEmail.createdAt ? new Date(selectedEmail.createdAt).toLocaleString('pt-BR') : '-'}
										</span>
									</div>
									{selectedEmail.sentAt && (
										<div className="min-w-0">
											<span className="block text-[10px] uppercase mb-0.5 truncate">
												Enviado em:
											</span>
											<span className="font-mono truncate block">
												{new Date(selectedEmail.sentAt).toLocaleString('pt-BR')}
											</span>
										</div>
									)}
								</div>
								<div className="flex flex-col items-start text-[10px] text-muted-foreground/80 mt-2 p-2 bg-muted/50 rounded-md w-full min-w-0">
									<span className="uppercase mb-0.5 block truncate w-full">ID da Mensagem:</span>
									<span className="font-mono break-all text-[11px] w-full overflow-hidden">
										{selectedEmail.id}
									</span>
								</div>
							</div>
						</div>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}
