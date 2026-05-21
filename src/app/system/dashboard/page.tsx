'use client';

import {
	CheckCircle2,
	Clock,
	AlertCircle,
	Activity,
	TrendingUp,
	ArrowUpRight,
	Users,
	User,
	Server,
	Layers,
	Loader2,
	Terminal,
	Zap,
	Database,
	Key,
	Mail,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
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
import { authClient } from '@/src/lib/auth-client';
import { apiFetch } from '@/src/lib/api';
import { useToast } from '@/src/hooks/use-toast';
import ReactECharts from 'echarts-for-react';

interface AppUser {
	id: string;
	name: string;
	email: string;
	isAdmin: boolean;
}

export default function DashboardPage() {
	const { data: session, isPending: isSessionLoading } = authClient.useSession();
	const { toast } = useToast();
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<any>(null);

	const user = session?.user as AppUser | undefined;
	const isAdmin = user?.isAdmin;

	useEffect(() => {
		if (session) {
			fetchDashboardData();
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
					title: 'Erro de Sincronização',
					description: result.message || 'Falha ao carregar métricas.',
				});
			}
		} catch (error) {
			console.error('Erro ao buscar dados do dashboard:', error);
		} finally {
			setLoading(false);
		}
	};

	if (isSessionLoading || loading) {
		return (
			<div className="h-screen flex items-center justify-center -mt-20">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="animate-spin text-primary" size={48} />
					<p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
						Coletando Métricas em Tempo Real...
					</p>
				</div>
			</div>
		);
	}

	// Configuração comum para os gráficos ECharts
	const getLatencyOption = (latencyData: any[]) => {
		const dates = latencyData.map(d => new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }));
		const values = latencyData.map(d => Number(d.avg_latency).toFixed(2));

		return {
			backgroundColor: 'transparent',
			tooltip: {
				trigger: 'axis',
				backgroundColor: '#1e293b',
				borderColor: '#3b82f6',
				textStyle: { color: '#f8fafc', fontSize: 10, fontWeight: 'bold' },
				formatter: '{b}: {c}s'
			},
			grid: { top: '10%', left: '3%', right: '4%', bottom: '3%', containLabel: true },
			xAxis: {
				type: 'category',
				data: dates,
				axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
				axisLabel: { color: '#94a3b8', fontSize: 9, fontWeight: 'bold', margin: 15 },
				boundaryGap: false
			},
			yAxis: {
				type: 'value',
				axisLine: { show: false },
				splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
				axisLabel: { color: '#94a3b8', fontSize: 9, formatter: '{value}s' }
			},
			series: [{
				data: values,
				type: 'line',
				smooth: true,
				symbol: 'circle',
				symbolSize: 8,
				lineStyle: { width: 4, color: '#3b82f6' },
				itemStyle: { color: '#3b82f6', borderWidth: 2, borderColor: '#fff' },
				areaStyle: {
					color: {
						type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
						colorStops: [
							{ offset: 0, color: 'rgba(59,130,246,0.3)' },
							{ offset: 1, color: 'transparent' }
						]
					}
				}
			}]
		};
	};

	if (isAdmin) {
		/**
		 * DASHBOARD ADMINISTRADOR (INFRA)
		 */
		const adminStats = [
			{
				label: 'E-mails Disparados',
				value: data.summary.totalSent.toLocaleString(),
				icon: Zap,
				color: 'text-success',
				bg: 'bg-success/10',
			},
			{
				label: 'Taxa de Falha',
				value: data.summary.totalSent > 0
					? ((data.summary.totalFailed / (data.summary.totalSent + data.summary.totalFailed)) * 100).toFixed(2) + '%'
					: '0%',
				icon: AlertCircle,
				color: 'text-danger',
				bg: 'bg-danger/10',
			},
			{
				label: 'Usuários Ativos',
				value: data.summary.totalUsers,
				icon: Users,
				color: 'text-primary',
				bg: 'bg-primary/10',
			},
			{
				label: 'Serviços Conectados',
				value: data.summary.totalServices,
				icon: Server,
				color: 'text-foreground',
				bg: 'bg-white/5',
			},
		];

		return (
			<div className="space-y-10 text-left animate-in fade-in duration-700">
				<div>
					<h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
						Console de Infraestrutura
					</h2>
					<p className="text-muted-foreground text-sm italic font-medium">
						Visão global da plataforma e saúde dos processos de mensageria.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{adminStats.map((stat, i) => (
						<Card key={i} className="bg-surface border-border-subtle rounded-[32px] p-8 hover:border-primary/30 transition-all group border shadow-sm">
							<div className="flex justify-between items-start mb-6">
								<div className={`${stat.bg} p-3 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>
									<stat.icon size={24} />
								</div>
								<Badge className="bg-white/5 text-muted-foreground border-none text-[8px] font-black uppercase px-2 py-0.5">
									Global
								</Badge>
							</div>
							<div className="space-y-1">
								<p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
									{stat.label}
								</p>
								<h3 className="text-3xl font-bold italic text-foreground tracking-tighter">
									{stat.value}
								</h3>
							</div>
						</Card>
					))}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Gráfico de Latência ECharts */}
					<Card className="lg:col-span-2 bg-surface border-border-subtle rounded-[40px] p-10 flex flex-col border shadow-sm text-left">
						<div className="flex justify-between items-center mb-10">
							<div>
								<CardTitle className="text-xl font-bold uppercase italic tracking-tighter text-foreground">
									Latência de Disparo
								</CardTitle>
								<CardDescription className="text-muted-foreground text-xs italic">
									Tempo médio de processamento (segundos) nos últimos 7 dias.
								</CardDescription>
							</div>
							<div className="flex items-center gap-2">
								<span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
								<span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Live Monitor</span>
							</div>
						</div>

						<div className="flex-1 min-h-[300px]">
							{data.latency.length === 0 ? (
								<div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 italic gap-3">
									<Activity size={48} />
									<p className="text-xs uppercase font-black tracking-widest">Sem dados de latência</p>
								</div>
							) : (
								<ReactECharts
									option={getLatencyOption(data.latency)}
									style={{ height: '300px', width: '100%' }}
									opts={{ renderer: 'svg' }}
								/>
							)}
						</div>
					</Card>

					{/* Fila Redis */}
					<Card className="bg-surface border-border-subtle rounded-[40px] p-10 flex flex-col border shadow-sm text-left">
						<CardHeader className="p-0 mb-8 flex flex-row items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-xl text-primary">
								<Database size={20} />
							</div>
							<CardTitle className="text-xl font-bold uppercase italic tracking-tighter text-foreground">
								Processamento
							</CardTitle>
						</CardHeader>

						<CardContent className="p-0 space-y-6">
							<div className="space-y-4">
								{[
									{ label: 'Aguardando na Fila', value: data.queue.waiting, color: 'bg-primary' },
									{ label: 'Em Processamento', value: data.queue.active, color: 'bg-success' },
									{ label: 'Falhas Críticas', value: data.queue.failed, color: 'bg-danger' },
								].map((item, i) => (
									<div key={i} className="space-y-2 p-5 bg-background/40 rounded-3xl border border-border-subtle/50">
										<div className="flex justify-between items-center mb-1">
											<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
												{item.label}
											</span>
											<span className="text-sm font-black italic">{item.value}</span>
										</div>
										<div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
											<div className={`h-full ${item.color} ${item.value > 0 ? 'animate-pulse' : ''}`} style={{ width: item.value > 0 ? '100%' : '0%' }} />
										</div>
									</div>
								))}
							</div>

							<div className="pt-4 p-6 bg-primary/5 border border-primary/20 rounded-3xl italic text-[11px] text-muted-foreground leading-relaxed">
								O Hermes utiliza instâncias de workers isolados via BullMQ para garantir entrega assíncrona.
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Lista de Todos os Serviços (Admin Only) */}
				<Card className="bg-surface border-border-subtle rounded-[40px] overflow-hidden border shadow-sm text-left">
					<div className="p-8 border-b border-border-subtle bg-background/30 flex justify-between items-center">
						<CardTitle className="text-lg font-bold uppercase italic tracking-tighter text-foreground flex items-center gap-2">
							<Server size={18} className="text-primary" /> Projetos na Plataforma
						</CardTitle>
					</div>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader className="bg-background/50">
								<TableRow className="border-b border-border-subtle/30">
									<TableHead className="px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Projeto</TableHead>
									<TableHead className="px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Proprietário</TableHead>
									<TableHead className="px-8 text-right text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Criado em</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.allServices.map((srv: any) => (
									<TableRow key={srv.id} className="hover:bg-white/5 border-b border-border-subtle/30 transition-colors">
										<TableCell className="px-8 py-5">
											<div className="flex flex-col">
												<span className="font-bold text-foreground text-sm uppercase italic">{srv.name}</span>
												<span className="text-[9px] text-muted-foreground font-mono uppercase">ID: {srv.id.split('-')[0]}...</span>
											</div>
										</TableCell>
										<TableCell className="px-8 py-5">
											<Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[9px] uppercase px-3 py-1">
												<User size={10} className="mr-1.5" /> {srv.ownerName}
											</Badge>
										</TableCell>
										<TableCell className="px-8 py-5 text-right text-muted-foreground text-xs italic font-medium">
											{new Date(srv.createdAt).toLocaleDateString('pt-BR')}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</Card>

				{/* Tabela de Auditoria Global */}
				<Card className="bg-surface border-border-subtle rounded-[40px] overflow-hidden border shadow-sm text-left">
					<div className="p-8 border-b border-border-subtle bg-background/30 flex justify-between items-center">
						<CardTitle className="text-lg font-bold uppercase italic tracking-tighter text-foreground flex items-center gap-2">
							<Terminal size={18} className="text-primary" /> Logs
						</CardTitle>
						<Link href="/system/logs">
							<Button variant="outline" className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-border-subtle hover:bg-white/5 h-10">
								Ver Todos os Logs
							</Button>
						</Link>
					</div>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader className="bg-background/50">
								<TableRow className="border-b border-border-subtle/30">
									<TableHead className="px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Método</TableHead>
									<TableHead className="px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Endpoint</TableHead>
									<TableHead className="px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</TableHead>
									<TableHead className="px-8 text-right text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Data/Hora</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.recentLogs.map((log: any) => (
									<TableRow key={log.id} className="hover:bg-white/5 border-b border-border-subtle/30 transition-colors">
										<TableCell className="px-8 py-5">
											<Badge variant="outline" className="bg-background border-border-subtle font-black text-[9px] uppercase px-2 py-0.5">
												{log.method}
											</Badge>
										</TableCell>
										<TableCell className="px-8 py-5 font-mono text-xs text-foreground/70">{log.endpoint}</TableCell>
										<TableCell className="px-8 py-5">
											<span className={`text-[10px] font-bold uppercase tracking-widest ${log.status_code >= 400 ? 'text-danger' : 'text-success'}`}>
												HTTP {log.status_code}
											</span>
										</TableCell>
										<TableCell className="px-8 py-5 text-right text-muted-foreground text-xs font-mono">
											{new Date(log.createdAt).toLocaleString('pt-BR')}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</Card>
			</div>
		);
	}

	//  DASHBOARD USUÁRIO (OPERACIONAL)
	const userStats = [
		{
			label: 'Minha Vazão (Envios)',
			value: data.summary.sent.toLocaleString(),
			icon: Mail,
			color: 'text-primary',
			bg: 'bg-primary/10',
		},
		{
			label: 'Pendentes / Retentativa',
			value: data.summary.pending,
			icon: Clock,
			color: 'text-warning',
			bg: 'bg-warning/10',
		},
		{
			label: 'Projetos Ativos',
			value: data.summary.services,
			icon: Server,
			color: 'text-foreground',
			bg: 'bg-white/5',
		},
		{
			label: 'Templates Criados',
			value: data.summary.templates,
			icon: Layers,
			color: 'text-success',
			bg: 'bg-success/10',
		},
	];

	return (
		<div className="space-y-10 text-left animate-in fade-in duration-700">
			<div>
				<h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
					Dashboard Operacional
				</h2>
				<p className="text-muted-foreground text-sm italic font-medium">
					Monitoramento de performance e envios das suas aplicações.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{userStats.map((stat, i) => (
					<Card key={i} className="bg-surface border-border-subtle rounded-[32px] p-8 hover:border-primary/30 transition-all group border shadow-sm">
						<div className="flex justify-between items-start mb-6">
							<div className={`${stat.bg} p-3 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>
								<stat.icon size={24} />
							</div>
							<Badge className="bg-white/5 text-muted-foreground border-none text-[8px] font-black uppercase px-2 py-0.5">
								Ativo
							</Badge>
						</div>
						<div className="space-y-1">
							<p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
								{stat.label}
							</p>
							<h3 className="text-3xl font-bold italic text-foreground tracking-tighter">
								{stat.value}
							</h3>
						</div>
					</Card>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Volume de Envios Pessoais com ECharts */}
				<Card className="lg:col-span-2 bg-surface border-border-subtle rounded-[40px] p-10 flex flex-col border shadow-sm text-left">
					<CardTitle className="text-xl font-bold uppercase italic tracking-tighter text-foreground mb-10">
						Performance de Entrega (Latência)
					</CardTitle>

					<div className="flex-1 min-h-[300px]">
						{data.latency.length === 0 ? (
							<div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 italic gap-3">
								<TrendingUp size={48} />
								<p className="text-xs uppercase font-black tracking-widest">Aguardando dados de despacho</p>
							</div>
						) : (
							<ReactECharts
								option={getLatencyOption(data.latency)}
								style={{ height: '300px', width: '100%' }}
								opts={{ renderer: 'svg' }}
							/>
						)}
					</div>
				</Card>

				{/* Top Templates */}
				<Card className="bg-surface border-border-subtle rounded-[40px] p-10 flex flex-col border shadow-sm text-left">
					<CardHeader className="p-0 mb-8 flex flex-row items-center gap-3">
						<div className="p-2 bg-primary/10 rounded-xl text-primary">
							<Layers size={20} />
						</div>
						<CardTitle className="text-xl font-bold uppercase italic tracking-tighter text-foreground">
							Top Templates
						</CardTitle>
					</CardHeader>

					<CardContent className="p-0 space-y-5">
						{data.topTemplates.length === 0 ? (
							<div className="py-20 text-center opacity-20 italic text-xs uppercase font-bold tracking-widest">
								Aguardando Dados...
							</div>
						) : (
							data.topTemplates.map((tmpl: any, i: number) => (
								<div key={i} className="p-4 bg-background/40 rounded-2xl border border-border-subtle/50 flex justify-between items-center group hover:border-primary/40 transition-colors">
									<div className="flex flex-col">
										<span className="text-xs font-bold text-foreground uppercase tracking-tight truncate max-w-[120px]">
											{tmpl.name}
										</span>
										<span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Métricas de Uso</span>
									</div>
									<div className="flex items-center gap-3">
										<span className="text-lg font-black italic text-primary">{tmpl.usage_count}</span>
										<div className="w-1 h-8 bg-primary/20 rounded-full overflow-hidden">
											<div className="bg-primary w-full" style={{ height: '70%' }} />
										</div>
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>
			</div>

			{/* Últimos Disparos */}
			<Card className="bg-surface border-border-subtle rounded-[40px] overflow-hidden border shadow-sm text-left">
				<div className="p-8 border-b border-border-subtle bg-background/30 flex justify-between items-center">
					<CardTitle className="text-lg font-bold uppercase italic tracking-tighter text-foreground flex items-center gap-2">
						<Activity size={18} className="text-primary" /> Últimos Disparos
					</CardTitle>
				</div>
				<div className="overflow-x-auto">
					<Table>
						<TableHeader className="bg-background/50">
							<TableRow className="border-b border-border-subtle/30 hover:bg-transparent">
								<TableHead className="px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Destinatário</TableHead>
								<TableHead className="px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Assunto</TableHead>
								<TableHead className="px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</TableHead>
								<TableHead className="px-8 text-right text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Horário</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.recentEmails.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="h-40 text-center text-muted-foreground italic text-xs uppercase font-bold tracking-widest opacity-30">
										Nenhum e-mail enviado recentemente.
									</TableCell>
								</TableRow>
							) : (
								data.recentEmails.map((mail: any) => (
									<TableRow key={mail.id} className="hover:bg-white/5 border-b border-border-subtle/30 transition-colors">
										<TableCell className="px-8 py-5 font-bold text-foreground italic text-xs">{mail.recipient}</TableCell>
										<TableCell className="px-8 py-5 text-xs text-muted-foreground truncate max-w-[200px]">{mail.subject}</TableCell>
										<TableCell className="px-8 py-5">
											<Badge className={`${mail.status === 'sent' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
												} border-none font-black text-[9px] uppercase px-2 py-0.5`}>
												{mail.status}
											</Badge>
										</TableCell>
										<TableCell className="px-8 py-5 text-right text-muted-foreground text-xs font-mono">
											{new Date(mail.createdAt).toLocaleTimeString('pt-BR')}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</Card>
		</div>
	);
}
