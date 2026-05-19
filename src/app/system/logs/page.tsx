'use client';

import {
	Search,
	Download,
	CheckCircle2,
	XCircle,
	Clock,
	Eye,
	Filter,
	Loader2,
	RefreshCw,
} from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/src/components/ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/src/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { apiFetch } from '@/src/lib/api';
import { useToast } from '@/src/hooks/use-toast';

interface Log {
	id: string;
	method: string;
	status_code: number;
	endpoint: string;
	ip_address: string | null;
	api_key_id: string | null;
	user_id: string | null;
	createdAt: string;
}

interface ApiResponse<T> {
	error: boolean;
	code: number;
	message: string | null;
	data: T;
	errors: any[];
}

export default function LogsPage() {
	const [logs, setLogs] = useState<Log[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const { toast } = useToast();

	const fetchLogs = useCallback(async () => {
		try {
			setLoading(true);
			const response = await apiFetch('/api/logs?limit=100');
			const result: ApiResponse<Log[]> = await response.json();

			if (!response.ok || result.error) {
				throw new Error(result.message || 'Erro ao buscar logs.');
			}

			setLogs(Array.isArray(result.data) ? result.data : []);
		} catch (error: any) {
			console.error('Erro na integração /api/logs:', error);
			toast({
				variant: 'destructive',
				title: 'Falha ao carregar logs',
				description: error.message || 'Não foi possível conectar ao servidor.',
			});
		} finally {
			setLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		fetchLogs();
	}, [fetchLogs]);

	const filteredLogs = useMemo(() => {
		return logs.filter((log) => {
			const matchesSearch =
				log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
				log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(log.ip_address && log.ip_address.includes(searchTerm));

			const matchesStatus =
				statusFilter === 'all' ||
				(statusFilter === 'success' && log.status_code < 400) ||
				(statusFilter === 'failed' && log.status_code >= 400);

			return matchesSearch && matchesStatus;
		});
	}, [logs, searchTerm, statusFilter]);

	const stats = useMemo(() => {
		const errors = logs.filter((l) => l.status_code >= 400).length;
		const total = logs.length;
		return { errors, total };
	}, [logs]);

	return (
		<div className="space-y-10">
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-left">
				<div>
					<h2 className="text-3xl font-bold tracking-tight mb-2 uppercase">Logs de Auditoria</h2>
					<p className="text-muted-foreground text-sm font-medium italic">
						Monitore o histórico de requisições e atividade da API.
					</p>
				</div>

				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="icon"
						onClick={fetchLogs}
						disabled={loading}
						className="rounded-xl border-border-subtle cursor-pointer"
					>
						<RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
					</Button>
					<Button
						variant="outline"
						className="gap-2 uppercase tracking-widest font-bold text-[10px] cursor-pointer"
					>
						<Download size={16} /> Exportar CSV
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<Card className="lg:col-span-3 bg-surface border-border-subtle rounded-[32px] overflow-hidden shadow-sm">
					<div className="p-6 border-b border-border-subtle bg-background/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div className="relative flex-1">
							<Search
								className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
								size={18}
							/>
							<Input
								placeholder="Buscar por endpoint, IP ou ID..."
								className="pl-12 bg-background border-border-subtle rounded-2xl italic"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-[180px] bg-background border-border-subtle rounded-xl font-bold uppercase text-[10px] tracking-wider">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent className="bg-surface border-border-subtle">
								<SelectItem value="all">Todos Status</SelectItem>
								<SelectItem value="success">Sucesso (2xx/3xx)</SelectItem>
								<SelectItem value="failed">Erro (4xx/5xx)</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="border-b border-border-subtle bg-background/50 hover:bg-background/50">
									<TableHead className="px-8 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
										Método / Status
									</TableHead>
									<TableHead className="px-8 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
										Endpoint
									</TableHead>
									<TableHead className="px-8 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
										Origem
									</TableHead>
									<TableHead className="px-8 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
										Data / Hora
									</TableHead>
									<TableHead className="px-8 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
										Ações
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading && logs.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="h-48 text-center">
											<div className="flex flex-col items-center justify-center gap-3 text-muted-foreground font-medium">
												<Loader2 className="animate-spin text-primary" size={32} />
												<span className="italic">Sincronizando auditoria...</span>
											</div>
										</TableCell>
									</TableRow>
								) : filteredLogs.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={5}
											className="h-48 text-center text-muted-foreground italic"
										>
											Nenhum log encontrado para os critérios selecionados.
										</TableCell>
									</TableRow>
								) : (
									filteredLogs.map((log) => (
										<TableRow
											key={log.id}
											className="border-b border-border-subtle/50 hover:bg-white/5 transition-colors group"
										>
											<TableCell className="px-8 py-6">
												<div className="flex items-center gap-3">
													<span className="text-[10px] font-black uppercase w-8">{log.method}</span>
													{log.status_code < 400 ? (
														<Badge className="bg-success/10 text-success border-none text-[10px] font-bold px-2 py-0.5">
															{log.status_code}
														</Badge>
													) : (
														<Badge className="bg-danger/10 text-danger border-none text-[10px] font-bold px-2 py-0.5">
															{log.status_code}
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell className="px-8 py-6 text-left">
												<p
													className="text-sm font-mono text-foreground truncate max-w-[200px]"
													title={log.endpoint}
												>
													{log.endpoint}
												</p>
												<p className="text-[9px] text-muted-foreground uppercase tracking-tighter">
													ID: {log.id}
												</p>
											</TableCell>
											<TableCell className="px-8 py-6 text-left">
												<p className="text-[10px] font-bold text-muted-foreground italic">
													{log.ip_address || 'IP desconhecido'}
												</p>
												{log.api_key_id && (
													<Badge
														variant="outline"
														className="text-[8px] h-4 mt-1 border-primary/20 text-primary"
													>
														API KEY
													</Badge>
												)}
											</TableCell>
											<TableCell className="px-8 py-6 text-left">
												<div className="flex items-center gap-2 text-muted-foreground">
													<Clock size={14} />
													<span className="text-xs font-mono">
														{new Date(log.createdAt).toLocaleString('pt-BR')}
													</span>
												</div>
											</TableCell>
											<TableCell className="px-8 py-6 text-right">
												<Button
													variant="ghost"
													size="icon"
													className="text-muted-foreground hover:text-primary cursor-pointer"
												>
													<Eye size={18} />
												</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</Card>

				<div className="space-y-6 text-left">
					<Card className="bg-surface border-border-subtle rounded-3xl p-6">
						<CardHeader className="p-0 mb-6">
							<CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
								<Filter size={14} className="text-primary" /> Visão Geral
							</CardTitle>
						</CardHeader>
						<CardContent className="p-0 space-y-4">
							<div className="p-4 bg-background/50 rounded-2xl border border-border-subtle hover:border-primary/30 transition-all cursor-pointer group">
								<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 group-hover:text-primary">
									Erros Recentes
								</p>
								<p className="text-2xl font-bold text-danger">{stats.errors}</p>
							</div>
							<div className="p-4 bg-background/50 rounded-2xl border border-border-subtle">
								<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
									Total de Requisições
								</p>
								<p className="text-2xl font-bold text-foreground">{stats.total}</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
