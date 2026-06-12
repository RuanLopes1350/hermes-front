'use client';

import { useState, useEffect, useMemo } from 'react';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/src/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Loader2, Eye, FilterX } from 'lucide-react';
import { apiFetch } from '@/src/lib/api';

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
}

interface Service {
	id: string;
	name: string;
}

export default function EmailsPage() {
	const [services, setServices] = useState<Service[]>([]);
	const [emails, setEmails] = useState<EmailRecord[]>([]);
	const [templates, setTemplates] = useState<any[]>([]);
	const [credentials, setCredentials] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const [filterService, setFilterService] = useState('all');
	const [filterStatus, setFilterStatus] = useState('all');
	const [filterDate, setFilterDate] = useState('');

	const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			try {
				const [srvRes, tmplRes] = await Promise.all([
					apiFetch('/api/services'),
					apiFetch('/api/templates'),
				]);

				if (tmplRes.ok) {
					const tmplData = await tmplRes.json();
					setTemplates(tmplData.data || []);
				}

				if (srvRes.ok) {
					const srvData = await srvRes.json();
					const srvs: Service[] = srvData.data || [];
					setServices(srvs);

					const emailsPromises = srvs.map(async (s) => {
						try {
							const [res, credRes] = await Promise.all([
								apiFetch(`/api/services/${s.id}/emails`),
								apiFetch(`/api/services/${s.id}/credentials`),
							]);

							let fetchedEmails = [];
							let fetchedCreds = [];

							if (res.ok) {
								const data = await res.json();
								fetchedEmails = data.data || [];
							}
							if (credRes.ok) {
								const credData = await credRes.json();
								fetchedCreds = credData.data || [];
							}

							return {
								emails: fetchedEmails.map((e: any) => ({ ...e, serviceName: s.name })),
								creds: fetchedCreds,
							};
						} catch (e) {
							return { emails: [], creds: [] };
						}
					});

					const results = await Promise.all(emailsPromises);
					const allEmails = results.flatMap((r) => r.emails);
					const allCreds = results.flatMap((r) => r.creds);

					allEmails.sort(
						(a, b) =>
							new Date(b.created_at || b.createdAt || '').getTime() -
							new Date(a.created_at || a.createdAt || '').getTime(),
					);
					setEmails(allEmails);
					setCredentials(allCreds);
				}
			} catch (err) {
				console.error('Erro ao buscar dados', err);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	const filteredEmails = useMemo(() => {
		return emails.filter((e) => {
			if (filterService !== 'all' && e.service_id !== filterService) return false;
			if (filterStatus !== 'all' && e.status !== filterStatus) return false;
			if (filterDate) {
				const eDate = new Date(e.created_at || e.createdAt || '').toISOString().split('T')[0];
				if (eDate !== filterDate) return false;
			}
			return true;
		});
	}, [emails, filterService, filterStatus, filterDate]);

	const getStatusBadge = (status: string) => {
		switch (status.toLowerCase()) {
			case 'sent':
				return (
					<Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
						Enviado
					</Badge>
				);
			case 'pending':
				return (
					<Badge
						variant="secondary"
						className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/30 border-amber-500/50"
					>
						Pendente
					</Badge>
				);
			case 'failed':
				return <Badge variant="destructive">Falhou</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const openEmailModal = (email: EmailRecord) => {
		setSelectedEmail(email);
		setDialogOpen(true);
	};

	return (
		<div className="space-y-6 animate-in fade-in duration-500">
			<div>
				<h2 className="text-3xl font-bold tracking-tight mb-2">E-mails Enviados</h2>
				<p className="text-muted-foreground text-sm">
					Acompanhe o histórico de envios e o status de entrega de todos os serviços.
				</p>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 bg-card p-4 rounded-xl border">
				<div className="space-y-1 w-full sm:w-auto flex-1">
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
				<div className="space-y-1 w-full sm:w-auto flex-1">
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
							<SelectItem value="sent">Enviado</SelectItem>
							<SelectItem value="failed">Falhou</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1 w-full sm:w-auto flex-1">
					<label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Data
					</label>
					<Input
						type="date"
						value={filterDate}
						onChange={(e) => setFilterDate(e.target.value)}
						className="cursor-pointer h-10"
					/>
				</div>
				<div className="w-full sm:w-auto">
					<Button
						variant="outline"
						onClick={() => {
							setFilterService('all');
							setFilterStatus('all');
							setFilterDate('');
						}}
						className="w-full sm:w-auto h-10"
					>
						<FilterX className="h-4 w-4 mr-2" />
						Limpar
					</Button>
				</div>
			</div>

			{/* Table */}
			<div className="rounded-xl border bg-card overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Status</TableHead>
							<TableHead>Serviço</TableHead>
							<TableHead>Destinatário</TableHead>
							<TableHead>Assunto</TableHead>
							<TableHead>Credencial</TableHead>
							<TableHead>Data de Envio</TableHead>
							<TableHead className="text-right">Ação</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={7} className="h-24 text-center">
									<Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
								</TableCell>
							</TableRow>
						) : filteredEmails.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
									Nenhum e-mail encontrado para os filtros selecionados.
								</TableCell>
							</TableRow>
						) : (
							filteredEmails.map((email) => (
								<TableRow key={email.id} className="hover:bg-muted/50 transition-colors">
									<TableCell>{getStatusBadge(email.status)}</TableCell>
									<TableCell className="font-medium text-xs">{email.serviceName}</TableCell>
									<TableCell className="text-sm">{email.recipient_to}</TableCell>
									<TableCell className="text-sm max-w-[200px] truncate">{email.subject}</TableCell>
									<TableCell className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">
										{credentials.find((c) => c.id === email.credential_id)?.name ||
											email.credential_id ||
											'N/A'}
									</TableCell>
									<TableCell className="text-sm">
										{new Date(email.created_at || email.createdAt || '').toLocaleString()}
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => openEmailModal(email)}
											title="Ver detalhes"
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
										{credentials.find((c) => c.id === selectedEmail.credential_id)?.name ||
											selectedEmail.credential_id ||
											'N/A'}
									</p>
								</div>
							</div>

							<div className="space-y-1 bg-muted p-3 rounded-lg border min-w-0 overflow-hidden">
								<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Destinatário
								</p>
								<p className="text-sm font-medium break-all">{selectedEmail.recipient_to}</p>
							</div>

							<div className="space-y-1 bg-muted p-3 rounded-lg border min-w-0 overflow-hidden">
								<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Assunto
								</p>
								<p className="text-sm font-medium break-words">{selectedEmail.subject}</p>
							</div>

							{selectedEmail.template_id || selectedEmail.service_template_id ? (
								<div className="space-y-1 bg-primary/5 p-3 rounded-lg border border-primary/20 min-w-0 overflow-hidden">
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
										<pre className="bg-black/10 dark:bg-black p-4 text-xs font-mono overflow-x-auto w-full">
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
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
