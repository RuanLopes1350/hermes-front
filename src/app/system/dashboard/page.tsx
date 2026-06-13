'use client';

import {
	Activity,
	AlertCircle,
	Clock,
	Layers,
	Loader2,
	Mail,
	Server,
	TrendingUp,
	Users,
	Zap,
	Database,
	User,
	CheckCircle2,
	XCircle,
	CalendarClock,
	FileText,
	PlusCircle,
	MinusCircle,
	RefreshCw,
	MessageSquare
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

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
import { authClient } from '@/src/lib/auth-client';
import { apiFetch } from '@/src/lib/api';
import { useToast } from '@/src/hooks/use-toast';

interface AppUser {
	id: string;
	name: string;
	email: string;
	isAdmin: boolean;
}

export default function DashboardPage() {
	const { data: session, isPending } = authClient.useSession();
	const { toast } = useToast();
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<any>(null);

	const user = session?.user as AppUser | undefined;
	const isAdmin = user?.isAdmin;

	useEffect(() => {
		if (session) {
			fetchDashboardData();

			const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1350';
			const eventSource = new EventSource(`${API_URL}/api/dashboard/stream`, {
				withCredentials: true,
			});

			eventSource.onmessage = (event) => {
				try {
					const queueData = JSON.parse(event.data);
					setData((prev: any) => {
						if (!prev) return prev;
						return { ...prev, queue: queueData };
					});
				} catch (e) {}
			};

			eventSource.onerror = (error) => {
				console.error('SSE Conexão perdida. Tentando reconectar...', error);
			};

			return () => {
				eventSource.close();
			};
		}
	}, [session]);

	const fetchDashboardData = async () => {
		setLoading(true);
		try {
			const endpoint = isAdmin ? '/api/dashboard/admin' : '/api/dashboard/user';
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
		} catch (error) {
			console.error(error);
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
		if (hour >= 6 && hour < 12) return 'Bom dia';
		if (hour >= 12 && hour < 18) return 'Boa tarde';
		return 'Boa noite';
	};

	// Helper para Action Icon (Timeline)
	const getActionIcon = (action: string) => {
		if (action.includes('CREATED') || action.includes('ADDED')) return <PlusCircle className="h-4 w-4 text-emerald-500" />;
		if (action.includes('DELETED') || action.includes('REMOVED')) return <MinusCircle className="h-4 w-4 text-red-500" />;
		if (action.includes('UPDATED') || action.includes('TRANSFERRED')) return <RefreshCw className="h-4 w-4 text-blue-500" />;
		return <MessageSquare className="h-4 w-4 text-amber-500" />;
	};

	const totalSent = isAdmin ? Number(data.summary.totalSent || 0) : Number(data.summary.sent || 0);
	const totalFailed = isAdmin ? Number(data.summary.totalFailed || 0) : Number(data.summary.pending || 0);
	const totalAttempts = totalSent + (isAdmin ? totalFailed : 0);
	const successRate = totalAttempts > 0 ? ((totalSent / totalAttempts) * 100).toFixed(1) : '100';

	// ==========================================
	// CONFIGURAÇÕES DE GRÁFICOS ECHARTS
	// ==========================================

	// 1. Gráfico de Volume por Dia (Stacked Bar)
	const getVolumeByDayOption = (volumeData: any[]) => {
		const dates = (volumeData || []).map((d) =>
			new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
		);
		const sentValues = (volumeData || []).map((d) => Number(d.sent || 0));
		const failedValues = (volumeData || []).map((d) => Number(d.failed || 0));

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

	// 2. Gráfico de Distribuição de Status (Donut)
	const getStatusDistributionOption = (statusData: any[]) => {
		const colorMap: Record<string, string> = {
			sent: '#10b981', // Emerald
			pending: '#f59e0b', // Amber
			failed: '#ef4444', // Red
			retrying: '#3b82f6', // Blue
		};

		const formattedData = (statusData || []).map(d => ({
			value: Number(d.total),
			name: d.status.charAt(0).toUpperCase() + d.status.slice(1),
			itemStyle: { color: colorMap[d.status] || '#94a3b8' }
		}));

		return {
			backgroundColor: 'transparent',
			tooltip: { trigger: 'item' },
			legend: { top: 'bottom' },
			series: [
				{
					name: 'Status',
					type: 'pie',
					radius: ['40%', '70%'],
					avoidLabelOverlap: false,
					itemStyle: {
						borderRadius: 5,
						borderColor: '#fff',
						borderWidth: 2
					},
					label: { show: false, position: 'center' },
					emphasis: {
						label: { show: true, fontSize: 16, fontWeight: 'bold' }
					},
					labelLine: { show: false },
					data: formattedData
				}
			]
		};
	};

	// 3. Admin: Top Serviços por Volume (Horizontal Bar)
	const getTopServicesOption = (topServices: any[]) => {
		const names = (topServices || []).map((s: any) => s.name);
		const counts = (topServices || []).map((s: any) => Number(s.emailCount));
		return {
			backgroundColor: 'transparent',
			tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
			grid: { top: 10, left: 10, right: 10, bottom: 10, containLabel: true },
			xAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false } },
			yAxis: {
				type: 'category',
				data: names,
				axisLabel: { color: '#64748b', fontSize: 11, width: 120, overflow: 'truncate' },
			},
			series: [
				{
					name: 'Envios',
					type: 'bar',
					data: counts,
					barMaxWidth: 20,
					itemStyle: {
						color: {
							type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
							colorStops: [ { offset: 0, color: '#6366f1' }, { offset: 1, color: '#0ea5e9' } ],
						},
						borderRadius: [0, 4, 4, 0],
					},
				},
			],
		};
	};

	// 4. User: Top templates por uso
	const getTopTemplatesOption = (topTemplates: any[]) => {
		const names = (topTemplates || []).map((t: any) => t.name);
		const counts = (topTemplates || []).map((t: any) => Number(t.usage_count));
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
							type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
							colorStops: [ { offset: 0, color: '#10b981' }, { offset: 1, color: '#0ea5e9' } ],
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
					label: 'E-mails na Plataforma',
					value: totalSent.toLocaleString('pt-BR'),
					icon: Zap, color: 'text-blue-600', bg: 'bg-blue-100',
					desc: 'Enviados com sucesso',
				},
				{
					label: 'Taxa de Entrega Global',
					value: `${successRate}%`,
					icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100',
					desc: 'Todas as contas',
				},
				{
					label: 'Usuários Ativos',
					value: data.summary.totalUsers || 0,
					icon: Users, color: 'text-slate-600', bg: 'bg-slate-200',
					desc: 'Cadastrados no Hermes',
				},
				{
					label: 'Serviços Registrados',
					value: data.summary.totalServices || 0,
					icon: Server, color: 'text-indigo-600', bg: 'bg-indigo-100',
					desc: 'Projetos ativos',
				},
		  ]
		: [
				{
					label: 'E-mails Enviados',
					value: totalSent.toLocaleString('pt-BR'),
					icon: Mail, color: 'text-blue-600', bg: 'bg-blue-100',
					desc: 'Total de todos os seus serviços',
				},
				{
					label: 'Taxa de Sucesso',
					value: `${successRate}%`,
					icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100',
					desc: 'Últimos 30 dias',
				},
				{
					label: 'Seus Serviços',
					value: data.summary.services || 0,
					icon: Layers, color: 'text-slate-600', bg: 'bg-slate-200',
					desc: 'Projetos onde você é membro',
				},
				{
					label: 'Templates Ativos',
					value: data.summary.templates || 0,
					icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100',
					desc: 'Templates disponíveis',
				},
		  ];

	return (
		<div className="space-y-6 animate-in fade-in duration-500">
			{/* Cabeçalho */}
			<div>
				<h2 className="text-2xl font-bold tracking-tight">
					☀️ {getGreeting()}, {user?.name?.split(' ')[0] || 'Usuário'}!{' '}
					{isAdmin && (
						<Badge
							variant="outline"
							className="ml-2 bg-yellow-400 text-yellow-900 hover:bg-yellow-200"
						>
							Modo Admin
						</Badge>
					)}
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Aqui está o resumo da sua operação de e-mails.
				</p>
			</div>

			{/* KPI Cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{kpiCards.map((stat, i) => (
					<Card key={i}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
							<div className={`p-2 rounded-md ${stat.bg} ${stat.color}`}>
								<stat.icon className="h-4 w-4" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Gráficos e Timeline */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Gráfico 1: Volume de Envios */}
				<Card className="col-span-1 lg:col-span-2 flex flex-col">
					<CardHeader>
						<CardTitle>Volume de Envios (7 dias)</CardTitle>
						<CardDescription>
							Quantidade de e-mails enviados e falhas por dia
						</CardDescription>
					</CardHeader>
					<CardContent className="flex-1 min-h-[250px]">
						{!data.volumeByDay || data.volumeByDay.length === 0 ? (
							<div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
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
				<Card className="flex flex-col">
					<CardHeader>
						<CardTitle>Distribuição por Status</CardTitle>
						<CardDescription>Status atual de todos os disparos</CardDescription>
					</CardHeader>
					<CardContent className="flex-1 min-h-[250px]">
						{!data.statusDistribution || data.statusDistribution.length === 0 ? (
							<div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
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
				<Card className="col-span-1 flex flex-col max-h-[500px]">
					<CardHeader>
						<CardTitle>Atividade Recente</CardTitle>
						<CardDescription>Últimas ações na plataforma</CardDescription>
					</CardHeader>
					<CardContent className="flex-1 overflow-y-auto">
						{!data.recentActivity || data.recentActivity.length === 0 ? (
							<div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
								<p>Nenhuma atividade recente.</p>
							</div>
						) : (
							<div className="relative border-l border-muted-foreground/20 ml-3 space-y-6 pb-2">
								{data.recentActivity.map((log: any, idx: number) => (
									<div key={idx} className="relative pl-6">
										<span className="absolute -left-2 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background">
											{getActionIcon(log.action)}
										</span>
										<div className="flex flex-col gap-0.5">
											<span className="text-xs text-muted-foreground font-medium">
												{new Date(log.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
											</span>
											<p className="text-sm text-foreground">{log.description}</p>
											<p className="text-xs text-muted-foreground mt-0.5">
												Por <strong>{log.actorName || 'Sistema'}</strong> em <strong>{log.serviceName || 'Desconhecido'}</strong>
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Envios Recentes */}
				<Card className="col-span-1 lg:col-span-2 flex flex-col max-h-[500px]">
					<CardHeader>
						<CardTitle>Últimos Envios</CardTitle>
						<CardDescription>
							Acompanhe o status de entrega dos disparos recentes.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex-1 overflow-y-auto">
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Destinatário</TableHead>
										<TableHead>Assunto</TableHead>
										<TableHead>Serviço</TableHead>
										<TableHead>Prior.</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Horário</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{!data.recentEmails || data.recentEmails.length === 0 ? (
										<TableRow>
											<TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
												Nenhum disparo encontrado.
											</TableCell>
										</TableRow>
									) : (
										data.recentEmails.map((mail: any) => (
											<TableRow key={mail.id} className="group">
												<TableCell className="font-medium">
													<div className="flex items-center gap-2">
														<Mail className="h-4 w-4 text-muted-foreground" />
														<span className="truncate max-w-[120px]" title={mail.recipient}>{mail.recipient}</span>
													</div>
												</TableCell>
												<TableCell className="text-muted-foreground truncate max-w-[150px]" title={mail.subject}>
													{mail.subject}
												</TableCell>
												<TableCell className="text-xs text-muted-foreground truncate max-w-[100px]" title={mail.serviceName}>
													{mail.serviceName || 'N/A'}
												</TableCell>
												<TableCell>
													<Badge className={`text-[10px] uppercase border-none ${mail.priority === 'high' ? 'bg-red-100 text-red-800 hover:bg-red-200' : mail.priority === 'medium' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}>
														{mail.priority}
													</Badge>
												</TableCell>
												<TableCell>
													{mail.status === 'sent' ? (
														<Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">
															Entregue
														</Badge>
													) : mail.status === 'failed' ? (
														<Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none">
															Falha
														</Badge>
													) : (
														<Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none">
															{mail.status === 'pending' ? 'Pendente' : mail.status === 'retrying' ? 'Retentando' : mail.status}
														</Badge>
													)}
												</TableCell>
												<TableCell className="text-right text-muted-foreground text-xs font-mono">
													{new Date(mail.createdAt).toLocaleTimeString('pt-BR', {
														hour: '2-digit',
														minute: '2-digit',
													})}
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
							Painel de Infraestrutura
						</h3>
						<p className="text-sm text-muted-foreground">Métricas globais de sistema e filas do Redis.</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Fila Real-Time */}
						<Card className="col-span-1 lg:col-span-2">
							<CardHeader>
								<CardTitle>Saúde da Fila (Redis / BullMQ)</CardTitle>
								<CardDescription>Monitoramento real-time dos workers de envio.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
									<div className="p-4 rounded-lg bg-amber-50 border border-amber-100 flex flex-col items-center justify-center text-center">
										<Clock className="h-5 w-5 text-amber-500 mb-1" />
										<span className="text-2xl font-bold text-amber-700">{data.queue?.waiting || 0}</span>
										<span className="text-xs font-medium text-amber-600 uppercase tracking-wider">Waiting</span>
									</div>
									<div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-center">
										<Activity className="h-5 w-5 text-blue-500 mb-1" />
										<span className="text-2xl font-bold text-blue-700">{data.queue?.active || 0}</span>
										<span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Active</span>
									</div>
									<div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center text-center">
										<CheckCircle2 className="h-5 w-5 text-emerald-500 mb-1" />
										<span className="text-2xl font-bold text-emerald-700">{data.queue?.completed || 0}</span>
										<span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Completed</span>
									</div>
									<div className="p-4 rounded-lg bg-red-50 border border-red-100 flex flex-col items-center justify-center text-center">
										<AlertCircle className="h-5 w-5 text-red-500 mb-1" />
										<span className="text-2xl font-bold text-red-700">{data.queue?.failed || 0}</span>
										<span className="text-xs font-medium text-red-600 uppercase tracking-wider">Failed</span>
									</div>
									<div className="p-4 rounded-lg bg-purple-50 border border-purple-100 flex flex-col items-center justify-center text-center">
										<CalendarClock className="h-5 w-5 text-purple-500 mb-1" />
										<span className="text-2xl font-bold text-purple-700">{data.queue?.delayed || 0}</span>
										<span className="text-xs font-medium text-purple-600 uppercase tracking-wider">Delayed</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Top Serviços */}
						<Card className="col-span-1">
							<CardHeader>
								<CardTitle>Top Serviços por Volume</CardTitle>
								<CardDescription>Projetos que mais consumiram a fila globalmente.</CardDescription>
							</CardHeader>
							<CardContent className="min-h-[200px]">
								{!data.topServicesByVolume || data.topServicesByVolume.length === 0 ? (
									<div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg py-8">
										Nenhum serviço registrado ainda.
									</div>
								) : (
									<ReactECharts
										option={getTopServicesOption(data.topServicesByVolume)}
										style={{ height: `${Math.max(160, data.topServicesByVolume.length * 36)}px`, width: '100%' }}
										opts={{ renderer: 'svg' }}
									/>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			)}

			{/* ========================================== */}
			{/* CONTEXTO USER (Templates)                  */}
			{/* ========================================== */}
			{!isAdmin && (
				<Card>
					<CardHeader>
						<CardTitle>Top 5 Templates por Uso</CardTitle>
						<CardDescription>Templates com mais disparos acumulados nos seus serviços.</CardDescription>
					</CardHeader>
					<CardContent className="min-h-[220px]">
						{!data.topTemplates || data.topTemplates.length === 0 ? (
							<div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg py-8">
								Nenhum template utilizado ainda.
							</div>
						) : (
							<ReactECharts
								option={getTopTemplatesOption(data.topTemplates)}
								style={{ height: `${Math.max(180, data.topTemplates.length * 40)}px`, width: '100%' }}
								opts={{ renderer: 'svg' }}
							/>
						)}
					</CardContent>
				</Card>
			)}

		</div>
	);
}
