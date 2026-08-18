'use client';

import { useState, useEffect, useCallback } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/src/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { ConfirmModal } from '@/src/components/ui/confirm-modal';
import {
	Loader2,
	Eye,
	FilterX,
	RefreshCw,
	Ban,
	Download,
	AlertCircle,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';
import { apiFetch } from '@/src/lib/api';
import { useTour } from '@/src/hooks/use-tour';
import { useToast } from '@/src/hooks/use-toast';

interface EmailRecord {
	id: string;
	service_id: string;
	credential_id: string;
	recipient_to: string;
	subject: string;
	status: string;
	template_id?: string | null;
	service_template_id?: string | null;
	body: string | null;
	variables: Record<string, any>;
	created_at: string;
	createdAt?: string;
	serviceName?: string;
	credentialName?: string;
	retry_count?: number;
	error_log?: string | null;
	sent_at?: string | null;
}

interface Service {
	id: string;
	name: string;
}

const LIMIT = 25;

export default function EmailsPage() {
	const { toast } = useToast();

	const [services, setServices] = useState<Service[]>([]);
	const [emails, setEmails] = useState<EmailRecord[]>([]);
	const [templates, setTemplates] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);

	const [filterService, setFilterService] = useState('all');
	const [filterStatus, setFilterStatus] = useState('all');
	const [filterStartDate, setFilterStartDate] = useState('');
	const [filterEndDate, setFilterEndDate] = useState('');
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');

	const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [bulkLoading, setBulkLoading] = useState(false);
	const [showBulkCancelModal, setShowBulkCancelModal] = useState(false);
	const [emailToCancel, setEmailToCancel] = useState<EmailRecord | null>(null);
	const [exporting, setExporting] = useState(false);

	const totalPages = Math.max(1, Math.ceil(total / LIMIT));

	// Busca com debounce — evita disparar uma requisição a cada tecla digitada.
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search.trim()), 500);
		return () => clearTimeout(timer);
	}, [search]);

	// Qualquer mudança de filtro volta pra primeira página.
	useEffect(() => {
		setPage(1);
	}, [filterService, filterStatus, filterStartDate, filterEndDate, debouncedSearch]);

	const buildFilterParams = useCallback(() => {
		const params = new URLSearchParams();
		if (filterService !== 'all') params.set('serviceId', filterService);
		if (filterStatus !== 'all') params.set('status', filterStatus);
		if (debouncedSearch) params.set('search', debouncedSearch);
		if (filterStartDate) params.set('startDate', filterStartDate);
		if (filterEndDate) params.set('endDate', filterEndDate);
		return params;
	}, [filterService, filterStatus, debouncedSearch, filterStartDate, filterEndDate]);

	const fetchEmails = useCallback(async () => {
		setLoading(true);
		try {
			const params = buildFilterParams();
			params.set('limit', String(LIMIT));
			params.set('offset', String((page - 1) * LIMIT));

			const res = await apiFetch(`/api/emails?${params.toString()}`);
			if (res.ok) {
				const result = await res.json();
				setEmails(result.data || []);
				setTotal(result.metadata?.total ?? 0);
				setSelectedIds(new Set());
			} else {
				toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar e-mails.' });
			}
		} catch (err) {
			console.error('Erro ao buscar e-mails', err);
			toast({ variant: 'destructive', title: 'Erro', description: 'Falha de conexão ao carregar e-mails.' });
		} finally {
			setLoading(false);
		}
	}, [buildFilterParams, page, toast]);

	useEffect(() => {
		async function fetchAux() {
			try {
				const [srvRes, tmplRes] = await Promise.all([
					apiFetch('/api/services'),
					apiFetch('/api/templates'),
				]);
				if (tmplRes.ok) setTemplates((await tmplRes.json()).data || []);
				if (srvRes.ok) setServices((await srvRes.json()).data || []);
			} catch (err) {
				console.error('Erro ao buscar dados auxiliares', err);
			}
		}
		fetchAux();
	}, []);

	useEffect(() => {
		fetchEmails();
	}, [fetchEmails]);

	const getStatusBadge = (status: string) => {
		switch (status.toLowerCase()) {
			case 'sent':
				return (
					<Badge variant="secondary" className="bg-success/15 text-success hover:bg-success/15">
						Enviado
					</Badge>
				);
			case 'pending':
				return (
					<Badge variant="secondary" className="bg-warning/15 text-warning hover:bg-warning/15">
						Pendente
					</Badge>
				);
			case 'failed':
				return (
					<Badge variant="secondary" className="bg-destructive/15 text-destructive hover:bg-destructive/15">
						Falhou
					</Badge>
				);
			case 'retrying':
				return (
					<Badge variant="secondary" className="bg-primary/15 text-primary hover:bg-primary/15">
						Reenviando
					</Badge>
				);
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const getLatencyMs = (e: EmailRecord) => {
		if (!e.sent_at) return null;
		const created = new Date(e.created_at || e.createdAt || '').getTime();
		const sent = new Date(e.sent_at).getTime();
		if (isNaN(created) || isNaN(sent)) return null;
		return sent - created;
	};

	const openEmailModal = (email: EmailRecord) => {
		setSelectedEmail(email);
		setDialogOpen(true);
	};

	// --- Ações individuais ---
	const handleRetry = async (email: EmailRecord) => {
		try {
			const res = await apiFetch(`/api/services/${email.service_id}/emails/${email.id}/retry`, {
				method: 'POST',
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Falha ao reenviar e-mail.');
			toast({ title: 'E-mail reenfileirado', description: data.message });
			fetchEmails();
		} catch (err: any) {
			toast({ variant: 'destructive', title: 'Erro ao reenviar', description: err.message });
		}
	};

	const handleConfirmCancel = async () => {
		if (!emailToCancel) return;
		try {
			const res = await apiFetch(`/api/services/${emailToCancel.service_id}/emails/${emailToCancel.id}`, {
				method: 'DELETE',
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Falha ao cancelar e-mail.');
			toast({ title: 'E-mail cancelado', description: data.message });
			fetchEmails();
		} catch (err: any) {
			toast({ variant: 'destructive', title: 'Erro ao cancelar', description: err.message });
			throw err;
		}
	};

	// --- Seleção e ações em massa ---
	const allSelectedOnPage = emails.length > 0 && emails.every((e) => selectedIds.has(e.id));
	const toggleSelectAll = () => {
		setSelectedIds(allSelectedOnPage ? new Set() : new Set(emails.map((e) => e.id)));
	};
	const toggleSelect = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const selectedFailed = emails.filter((e) => selectedIds.has(e.id) && e.status === 'failed');
	const selectedPending = emails.filter((e) => selectedIds.has(e.id) && e.status === 'pending');

	const handleBulkRetry = async () => {
		setBulkLoading(true);
		try {
			const results = await Promise.allSettled(
				selectedFailed.map((e) =>
					apiFetch(`/api/services/${e.service_id}/emails/${e.id}/retry`, { method: 'POST' }),
				),
			);
			const failCount = results.filter((r) => r.status === 'rejected' || !r.value.ok).length;
			toast({
				variant: failCount > 0 ? 'destructive' : undefined,
				title: failCount > 0 ? 'Concluído com falhas' : 'Reenviados',
				description: `${selectedFailed.length - failCount} de ${selectedFailed.length} e-mail(s) reenfileirado(s).`,
			});
			fetchEmails();
		} finally {
			setBulkLoading(false);
		}
	};

	const handleBulkCancel = async () => {
		setBulkLoading(true);
		try {
			const results = await Promise.allSettled(
				selectedPending.map((e) =>
					apiFetch(`/api/services/${e.service_id}/emails/${e.id}`, { method: 'DELETE' }),
				),
			);
			const failCount = results.filter((r) => r.status === 'rejected' || !r.value.ok).length;
			toast({
				variant: failCount > 0 ? 'destructive' : undefined,
				title: failCount > 0 ? 'Concluído com falhas' : 'Cancelados',
				description: `${selectedPending.length - failCount} de ${selectedPending.length} e-mail(s) cancelado(s).`,
			});
			fetchEmails();
		} finally {
			setBulkLoading(false);
			setShowBulkCancelModal(false);
		}
	};

	// --- Exportar CSV ---
	const handleExport = async () => {
		setExporting(true);
		try {
			const params = buildFilterParams();
			const res = await apiFetch(`/api/emails/export?${params.toString()}`);
			if (!res.ok) throw new Error('Falha ao exportar.');
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `emails-${Date.now()}.csv`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (err: any) {
			toast({ variant: 'destructive', title: 'Erro ao exportar', description: err.message });
		} finally {
			setExporting(false);
		}
	};

	const { startTour } = useTour([
		{
			element: '#tour-emails-filters',
			popover: {
				title: 'Filtros',
				description: 'Filtre o histórico por texto (destinatário/assunto), serviço, status ou um intervalo de datas — tudo aplicado direto no servidor, sem limite de 100 registros.',
				side: 'bottom',
			},
		},
		{
			element: '#tour-emails-table',
			popover: {
				title: 'Histórico de Envios',
				description: 'Selecione várias linhas pra reenviar ou cancelar em massa, ou use os ícones de cada linha pra agir individualmente. Clique no olho pra ver o payload completo.',
				side: 'top',
			},
		},
	]);

	return (
		<div className="space-y-6 animate-in fade-in duration-300 ease-out">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-3xl font-bold tracking-tight mb-2">E-mails Enviados</h2>
					<p className="text-muted-foreground text-sm">
						Acompanhe o histórico de envios e o status de entrega de todos os serviços.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={handleExport}
						disabled={exporting}
						className="cursor-pointer w-fit"
					>
						{exporting ? (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						) : (
							<Download className="h-4 w-4 mr-2" />
						)}
						Exportar CSV
					</Button>
					<Button
						onClick={startTour}
						variant="outline"
						className="cursor-pointer border-primary text-primary hover:bg-primary/10 w-fit"
					>
						Tour Guiado
					</Button>
				</div>
			</div>

			{/* Filters */}
			<div id="tour-emails-filters" className="flex flex-col lg:flex-row items-end lg:items-center gap-4 bg-card p-4 rounded-xl border shadow-sm flex-wrap">
				<div className="space-y-1 w-full lg:w-auto flex-1 min-w-[160px]">
					<label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Buscar
					</label>
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Destinatário ou assunto..."
						className="h-10"
					/>
				</div>
				<div className="space-y-1 w-full lg:w-auto flex-1 min-w-[160px]">
					<label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Serviço
					</label>
					<Select value={filterService} onValueChange={setFilterService}>
						<SelectTrigger className="cursor-pointer">
							<SelectValue placeholder="Todos os serviços" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos os serviços</SelectItem>
							{services.map((s) => (
								<SelectItem key={s.id} value={s.id}>
									{s.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1 w-full lg:w-auto flex-1 min-w-[140px]">
					<label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Status
					</label>
					<Select value={filterStatus} onValueChange={setFilterStatus}>
						<SelectTrigger className="cursor-pointer">
							<SelectValue placeholder="Qualquer status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Qualquer status</SelectItem>
							<SelectItem value="pending">Pendente</SelectItem>
							<SelectItem value="retrying">Reenviando</SelectItem>
							<SelectItem value="sent">Enviado</SelectItem>
							<SelectItem value="failed">Falhou</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1 w-full lg:w-auto">
					<label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						De
					</label>
					<Input
						type="date"
						value={filterStartDate}
						onChange={(e) => setFilterStartDate(e.target.value)}
						className="cursor-pointer h-10"
					/>
				</div>
				<div className="space-y-1 w-full lg:w-auto">
					<label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Até
					</label>
					<Input
						type="date"
						value={filterEndDate}
						onChange={(e) => setFilterEndDate(e.target.value)}
						className="cursor-pointer h-10"
					/>
				</div>
				<div className="w-full lg:w-auto">
					<Button
						variant="outline"
						onClick={() => {
							setSearch('');
							setFilterService('all');
							setFilterStatus('all');
							setFilterStartDate('');
							setFilterEndDate('');
						}}
						className="w-full lg:w-auto h-10"
					>
						<FilterX className="h-4 w-4 mr-2" />
						Limpar
					</Button>
				</div>
			</div>

			{/* Barra de ações em massa */}
			{selectedIds.size > 0 && (
				<div className="flex items-center gap-3 bg-primary/5 border border-primary/20 p-3 rounded-xl flex-wrap">
					<span className="text-sm font-medium text-foreground">
						{selectedIds.size} selecionado(s)
					</span>
					<Button
						size="sm"
						variant="outline"
						disabled={selectedFailed.length === 0 || bulkLoading}
						onClick={handleBulkRetry}
						className="cursor-pointer gap-1.5"
					>
						{bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
						Reenviar selecionados ({selectedFailed.length})
					</Button>
					<Button
						size="sm"
						variant="outline"
						disabled={selectedPending.length === 0 || bulkLoading}
						onClick={() => setShowBulkCancelModal(true)}
						className="cursor-pointer gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
					>
						<Ban className="h-3.5 w-3.5" />
						Cancelar selecionados ({selectedPending.length})
					</Button>
				</div>
			)}

			{/* Table */}
			<div id="tour-emails-table" className="rounded-xl border bg-card shadow-sm overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-10">
								<Checkbox checked={allSelectedOnPage} onCheckedChange={toggleSelectAll} />
							</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Serviço</TableHead>
							<TableHead>Destinatário</TableHead>
							<TableHead>Assunto</TableHead>
							<TableHead>Credencial</TableHead>
							<TableHead>Tentativas</TableHead>
							<TableHead>Latência</TableHead>
							<TableHead>Data de Envio</TableHead>
							<TableHead className="text-right">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={10} className="h-24 text-center">
									<Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
								</TableCell>
							</TableRow>
						) : emails.length === 0 ? (
							<TableRow>
								<TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
									Nenhum e-mail encontrado para os filtros selecionados.
								</TableCell>
							</TableRow>
						) : (
							emails.map((email) => {
								const latency = getLatencyMs(email);
								return (
									<TableRow key={email.id} className="hover:bg-muted/50 transition-colors">
										<TableCell>
											<Checkbox
												checked={selectedIds.has(email.id)}
												onCheckedChange={() => toggleSelect(email.id)}
											/>
										</TableCell>
										<TableCell>{getStatusBadge(email.status)}</TableCell>
										<TableCell className="font-medium text-xs">{email.serviceName}</TableCell>
										<TableCell className="text-sm">{email.recipient_to}</TableCell>
										<TableCell className="text-sm max-w-[200px] truncate">{email.subject}</TableCell>
										<TableCell className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">
											{email.credentialName || email.credential_id || 'N/A'}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
												<RefreshCw className="h-3 w-3" />
												{email.retry_count ?? 0}x
											</div>
										</TableCell>
										<TableCell className="text-xs text-muted-foreground font-mono">
											{latency !== null ? `${latency} ms` : '-'}
										</TableCell>
										<TableCell className="text-sm">
											{new Date(email.created_at || email.createdAt || '').toLocaleString()}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end gap-1">
												{email.status === 'failed' && (
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleRetry(email)}
														title="Reenviar"
														className="cursor-pointer text-primary hover:text-primary"
													>
														<RefreshCw className="h-4 w-4" />
													</Button>
												)}
												{email.status === 'pending' && (
													<Button
														variant="ghost"
														size="icon"
														onClick={() => setEmailToCancel(email)}
														title="Cancelar"
														className="cursor-pointer text-destructive hover:text-destructive"
													>
														<Ban className="h-4 w-4" />
													</Button>
												)}
												<Button
													variant="ghost"
													size="icon"
													onClick={() => openEmailModal(email)}
													title="Ver detalhes"
													className="cursor-pointer"
												>
													<Eye className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			{/* Paginação */}
			<div className="flex items-center justify-between gap-4 flex-wrap">
				<p className="text-xs text-muted-foreground">
					{total > 0
						? `Mostrando ${(page - 1) * LIMIT + 1}–${(page - 1) * LIMIT + emails.length} de ${total}`
						: 'Nenhum resultado'}
				</p>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={page <= 1 || loading}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						className="cursor-pointer gap-1"
					>
						<ChevronLeft className="h-4 w-4" /> Anterior
					</Button>
					<span className="text-xs text-muted-foreground px-2">
						Página {page} de {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={page >= totalPages || loading}
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						className="cursor-pointer gap-1"
					>
						Próxima <ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full">
					<DialogHeader>
						<DialogTitle>Detalhes do E-mail</DialogTitle>
					</DialogHeader>
					{selectedEmail && (
						<div className="space-y-6 mt-4 min-w-0 w-full overflow-hidden">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-1 min-w-0">
									<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
										Status
									</p>
									<div>{getStatusBadge(selectedEmail.status)}</div>
								</div>
								<div className="space-y-1 min-w-0">
									<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
										Data do Registro
									</p>
									<p className="text-sm font-medium">
										{new Date(
											selectedEmail.created_at || selectedEmail.createdAt || '',
										).toLocaleString()}
									</p>
								</div>
								<div className="space-y-1 min-w-0">
									<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
										ID do E-mail
									</p>
									<p className="text-sm font-mono break-all">{selectedEmail.id}</p>
								</div>
								<div className="space-y-1 min-w-0">
									<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
										Credencial
									</p>
									<p className="text-sm font-mono break-all">
										{selectedEmail.credentialName || selectedEmail.credential_id || 'N/A'}
									</p>
								</div>
								<div className="space-y-1 min-w-0">
									<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
										Tentativas
									</p>
									<p className="text-sm font-mono">{selectedEmail.retry_count ?? 0}x</p>
								</div>
								<div className="space-y-1 min-w-0">
									<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
										Latência
									</p>
									<p className="text-sm font-mono">
										{getLatencyMs(selectedEmail) !== null
											? `${getLatencyMs(selectedEmail)} ms`
											: 'Processando...'}
									</p>
								</div>
							</div>

							<div className="space-y-1 bg-muted/50 p-3 rounded-xl border min-w-0 overflow-hidden">
								<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Destinatário
								</p>
								<p className="text-sm font-medium break-all">{selectedEmail.recipient_to}</p>
							</div>

							<div className="space-y-1 bg-muted/50 p-3 rounded-xl border min-w-0 overflow-hidden">
								<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Assunto
								</p>
								<p className="text-sm font-medium break-words">{selectedEmail.subject}</p>
							</div>

							{selectedEmail.template_id || selectedEmail.service_template_id ? (
								<div className="space-y-1 bg-primary/5 p-3 rounded-xl border border-primary/20 min-w-0 overflow-hidden">
									<p className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
										<span className="h-2 w-2 rounded-full bg-primary inline-block shrink-0"></span>
										Template Usado
									</p>
									<p className="text-sm font-medium break-words">
										{templates.find(
											(t) =>
												t.id === (selectedEmail.template_id || selectedEmail.service_template_id),
										)?.name ||
											selectedEmail.template_id ||
											selectedEmail.service_template_id}
									</p>
								</div>
							) : null}

							{selectedEmail.variables && Object.keys(selectedEmail.variables).length > 0 && (
								<div className="space-y-2 min-w-0 w-full overflow-hidden">
									<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
										Variáveis
									</p>
									<div className="overflow-hidden rounded-xl border w-full">
										<pre className="bg-muted/30 p-4 text-xs font-mono overflow-x-auto w-full">
											{JSON.stringify(selectedEmail.variables, null, 2)}
										</pre>
									</div>
								</div>
							)}

							{selectedEmail.body && (
								<div className="space-y-2 min-w-0 w-full overflow-hidden">
									<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
										Corpo do E-mail (HTML/Texto)
									</p>
									<div className="bg-background border p-4 rounded-xl text-sm whitespace-pre-wrap break-words overflow-y-auto max-h-64 w-full">
										{selectedEmail.body}
									</div>
								</div>
							)}

							{selectedEmail.error_log && (
								<div className="space-y-2 min-w-0 w-full overflow-hidden">
									<p className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1">
										<AlertCircle className="h-3 w-3 shrink-0" /> Log de Erro / Exception
									</p>
									<pre className="text-xs p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md whitespace-pre-wrap break-all max-h-[150px] overflow-y-auto w-full overflow-x-hidden">
										{selectedEmail.error_log}
									</pre>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			<ConfirmModal
				isOpen={!!emailToCancel}
				onClose={() => setEmailToCancel(null)}
				onConfirm={handleConfirmCancel}
				variant="danger"
				title="Cancelar este e-mail?"
				description={`O envio para "${emailToCancel?.recipient_to}" será cancelado e não sairá da fila.`}
				confirmText="Sim, cancelar"
			/>

			<ConfirmModal
				isOpen={showBulkCancelModal}
				onClose={() => setShowBulkCancelModal(false)}
				onConfirm={handleBulkCancel}
				variant="danger"
				title="Cancelar e-mails selecionados?"
				description={`${selectedPending.length} e-mail(s) pendente(s) serão cancelados e não sairão da fila.`}
				confirmText="Sim, cancelar todos"
			/>
		</div>
	);
}
