'use client';

import {
	Send,
	Code,
	Terminal,
	Play,
	Settings2,
	CheckCircle2,
	AlertCircle,
	Loader2,
	RefreshCw,
	Server,
	Key,
	FileText,
	User,
	Hash,
	ChevronRight,
	Database,
	Mail,
} from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/src/components/ui/select';
import { authClient } from '@/src/lib/auth-client';
import { apiFetch } from '@/src/lib/api';
import { useToast } from '@/src/hooks/use-toast';
import { notFound } from 'next/navigation';

interface Service {
	id: string;
	name: string;
}

interface ApiKey {
	id: string;
	name: string;
	prefix: string;
	key?: string; // Algumas rotas podem retornar a key crua apenas na criação, mas aqui usaremos o prefixo para identificar
}

interface Template {
	id: string;
	name: string;
	html_content: string;
	subject_template: string;
}

interface AppUser {
	id: string;
	name: string;
	email: string;
	isAdmin: boolean;
}

export default function SandboxPage() {
	const { data: session, isPending: isSessionLoading } = authClient.useSession();
	const { toast } = useToast();

	const user = session?.user as AppUser | undefined;

	// Dados do Banco
	const [services, setServices] = useState<Service[]>([]);
	const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
	const [templates, setTemplates] = useState<Template[]>([]);

	// Seleções
	const [selectedServiceId, setSelectedServiceId] = useState<string>('');
	const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>('');
	const [rawApiKey, setRawApiKey] = useState<string>(''); // Para o usuário colar a chave real
	const [selectedTemplateId, setSelectedTemplateId] = useState<string>('none');

	// Campos de Envio
	const [recipientTo, setRecipientTo] = useState('');
	const [subject, setSubject] = useState('');
	const [body, setBody] = useState('');
	const [templateVars, setTemplateVars] = useState<Record<string, string>>({});

	// Estados de Execução
	const [loadingData, setLoadingData] = useState(true);
	const [sending, setSending] = useState(false);
	const [requestLog, setRequestLog] = useState<any>(null);
	const [responseLog, setResponseLog] = useState<any>(null);

	/**
	 * Carga Inicial: Serviços e Templates
	 */
	useEffect(() => {
		if (!isSessionLoading && user?.isAdmin) {
			const fetchData = async () => {
				setLoadingData(true);
				try {
					const [srvRes, tmplRes] = await Promise.all([
						apiFetch('/api/services'),
						apiFetch('/api/templates'),
					]);

					const srvData = await srvRes.json();
					const tmplData = await tmplRes.json();

					setServices(srvData.data || []);
					setTemplates(tmplData.data || []);
				} catch (err) {
					toast({
						variant: 'destructive',
						title: 'Erro de Carga',
						description: 'Não foi possível carregar os dados iniciais.',
					});
				} finally {
					setLoadingData(false);
				}
			};
			fetchData();
		}
	}, [user, isSessionLoading, toast]);

	/**
	 * Carga de API Keys ao selecionar Serviço
	 */
	useEffect(() => {
		if (selectedServiceId) {
			const fetchKeys = async () => {
				try {
					const res = await apiFetch(`/api/services/${selectedServiceId}/api-keys`);
					const data = await res.json();
					setApiKeys(data.data || []);
					setSelectedApiKeyId(''); // Reseta a chave ao trocar de serviço
				} catch (err) {
					console.error('Erro ao buscar chaves:', err);
				}
			};
			fetchKeys();
		} else {
			setApiKeys([]);
		}
	}, [selectedServiceId]);

	/**
	 * Parser de Variáveis do Template
	 */
	const extractedVars = useMemo(() => {
		if (selectedTemplateId === 'none') return [];
		const tmpl = templates.find((t) => t.id === selectedTemplateId);
		if (!tmpl) return [];

		// Regex para encontrar {{variavel}}
		const matches = tmpl.html_content.match(/{{(.*?)}}/g);
		if (!matches) return [];

		// Remove chaves e duplicatas
		return Array.from(new Set(matches.map((m) => m.replace(/{{|}}/g, '').trim())));
	}, [selectedTemplateId, templates]);

	// Inicializa o objeto de variáveis quando o template muda
	useEffect(() => {
		const newVars: Record<string, string> = {};
		extractedVars.forEach((v) => {
			newVars[v] = '';
		});
		setTemplateVars(newVars);

		const tmpl = templates.find((t) => t.id === selectedTemplateId);
		if (tmpl) {
			setSubject(tmpl.subject_template);
		} else {
			setSubject('');
		}
	}, [extractedVars, selectedTemplateId, templates]);

	/**
	 * Execução do Teste
	 */
	const handleSendTest = async () => {
		if (!selectedServiceId || !rawApiKey || !recipientTo) {
			toast({
				variant: 'destructive',
				title: 'Campos Obrigatórios',
				description: 'Preencha o Serviço, API Key e Destinatário.',
			});
			return;
		}

		setSending(true);
		setRequestLog(null);
		setResponseLog(null);

		const payload = {
			recipient_to: recipientTo,
			subject: subject,
			template_id: selectedTemplateId === 'none' ? undefined : selectedTemplateId,
			body: selectedTemplateId === 'none' ? body : undefined,
			variables: Object.keys(templateVars).length > 0 ? templateVars : undefined,
		};

		const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/services/${selectedServiceId}/emails`;

		setRequestLog({
			method: 'POST',
			url,
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': `${rawApiKey.substring(0, 8)}...`,
			},
			body: payload,
		});

		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': rawApiKey,
				},
				body: JSON.stringify(payload),
			});

			const result = await res.json();
			setResponseLog({
				status: res.status,
				statusText: res.statusText,
				data: result,
			});

			if (res.ok) {
				toast({ title: 'Sucesso', description: 'E-mail enfileirado com sucesso!' });
			} else {
				toast({
					variant: 'destructive',
					title: `Erro ${res.status}`,
					description: result.message || 'Falha ao processar envio.',
				});
			}
		} catch (err: any) {
			setResponseLog({ error: err.message });
			toast({
				variant: 'destructive',
				title: 'Erro de Conexão',
				description: 'Não foi possível contatar a API.',
			});
		} finally {
			setSending(false);
		}
	};

	if (isSessionLoading || loadingData) {
		return (
			<div className="h-screen flex items-center justify-center -mt-20">
				<Loader2 className="animate-spin text-primary" size={48} />
			</div>
		);
	}

	return (
		<div className="space-y-8 pb-20 text-left animate-in fade-in duration-700">
			{/* Header */}
			<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
				<div className="space-y-1">
					<h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
						Sandbox Inteligente
					</h2>
					<p className="text-muted-foreground text-sm italic font-medium">
						Laboratório de validação de integrações e payloads transacionais.
					</p>
				</div>

				<Button
					variant="outline"
					onClick={() => {
						setRequestLog(null);
						setResponseLog(null);
					}}
					className="gap-2 uppercase font-black tracking-widest text-[10px] border-border-subtle hover:bg-white/5 cursor-pointer h-10 px-6"
				>
					<RefreshCw size={14} /> Resetar Console
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Lado Esquerdo: Configurações e Composição (Col 8) */}
				<div className="lg:col-span-8 space-y-8">
					{/* Card 1: Contexto (Serviço e Key) */}
					<Card className="bg-surface border-border-subtle rounded-[40px] p-8 border shadow-sm">
						<CardHeader className="p-0 mb-8 flex flex-row items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-xl">
								<Database size={20} className="text-primary" />
							</div>
							<CardTitle className="text-xl font-bold uppercase italic tracking-tighter text-foreground">
								Configuração de Origem
							</CardTitle>
						</CardHeader>

						<CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-8">
							<div className="space-y-3">
								<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-1 flex items-center gap-2">
									<Server size={12} className="text-primary" /> Selecionar Serviço
								</label>
								<Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
									<SelectTrigger className="bg-background border-border-subtle rounded-2xl h-14 italic font-medium focus:ring-1 focus:ring-primary">
										<SelectValue placeholder="Selecione um serviço..." />
									</SelectTrigger>
									<SelectContent className="bg-surface border-border-subtle">
										{services.map((s) => (
											<SelectItem key={s.id} value={s.id}>
												{s.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-3">
								<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-1 flex items-center gap-2">
									<Key size={12} className="text-primary" /> API Key (Autenticação)
								</label>
								<Input
									type="password"
									value={rawApiKey}
									onChange={(e) => setRawApiKey(e.target.value)}
									placeholder="hm_live_xxxxxxxxxxxx"
									disabled={!selectedServiceId}
									className="bg-background border-border-subtle rounded-2xl px-6 h-14 font-mono focus:ring-1 focus:ring-primary"
								/>
								<p className="text-[9px] text-muted-foreground italic px-1">
									{apiKeys.length > 0
										? `Este serviço possui ${apiKeys.length} chave(s) ativa(s).`
										: 'Aguardando seleção de serviço...'}
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Card 2: Destinatário e Template */}
					<Card className="bg-surface border-border-subtle rounded-[40px] p-8 border shadow-sm">
						<CardHeader className="p-0 mb-8 flex flex-row items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-xl">
								<Mail size={20} className="text-primary" />
							</div>
							<CardTitle className="text-xl font-bold uppercase italic tracking-tighter text-foreground">
								Composição da Mensagem
							</CardTitle>
						</CardHeader>

						<CardContent className="p-0 space-y-8">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div className="space-y-3">
									<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-1 flex items-center gap-2">
										<User size={12} className="text-primary" /> Destinatário (To)
									</label>
									<Input
										value={recipientTo}
										onChange={(e) => setRecipientTo(e.target.value)}
										placeholder="cliente@exemplo.com"
										className="bg-background border-border-subtle rounded-2xl px-6 h-14 italic font-medium focus:ring-1 focus:ring-primary"
									/>
								</div>
								<div className="space-y-3">
									<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-1 flex items-center gap-2">
										<FileText size={12} className="text-primary" /> Escolher Template
									</label>
									<Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
										<SelectTrigger className="bg-background border-border-subtle rounded-2xl h-14 italic font-medium focus:ring-1 focus:ring-primary">
											<SelectValue placeholder="Envio manual (sem template)" />
										</SelectTrigger>
										<SelectContent className="bg-surface border-border-subtle">
											<SelectItem value="none">-- Sem Template (Texto Puro) --</SelectItem>
											{templates
												.filter((t) => !t.id.includes('global') || selectedServiceId) // simplificação
												.map((t) => (
													<SelectItem key={t.id} value={t.id}>
														{t.name}
													</SelectItem>
												))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="space-y-3">
								<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-1">
									Assunto do E-mail
								</label>
								<Input
									value={subject}
									onChange={(e) => setSubject(e.target.value)}
									placeholder="Assunto da mensagem..."
									className="bg-background border-border-subtle rounded-2xl px-6 h-14 italic font-medium focus:ring-1 focus:ring-primary"
								/>
							</div>

							{selectedTemplateId === 'none' && (
								<div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
									<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-1">
										Conteúdo da Mensagem (HTML/Texto)
									</label>
									<textarea
										value={body}
										onChange={(e) => setBody(e.target.value)}
										className="w-full bg-background border border-border-subtle rounded-3xl p-6 h-48 italic font-medium focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
										placeholder="Olá, este é um teste..."
									/>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Lado Direito: Variáveis Dinâmicas e Botão (Col 4) */}
				<div className="lg:col-span-4 space-y-8">
					<Card className="bg-surface border-border-subtle rounded-[40px] p-8 border shadow-xl flex flex-col h-full">
						<CardHeader className="p-0 mb-8 flex flex-row items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-xl">
								<Hash size={20} className="text-primary" />
							</div>
							<CardTitle className="text-xl font-bold uppercase italic tracking-tighter text-foreground">
								Dados Dinâmicos
							</CardTitle>
						</CardHeader>

						<CardContent className="p-0 flex-1 space-y-6">
							{selectedTemplateId === 'none' ? (
								<div className="h-40 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border-subtle rounded-3xl opacity-40 italic">
									<FileText size={32} className="mb-3" />
									<p className="text-xs">Nenhum template selecionado para mapear variáveis.</p>
								</div>
							) : extractedVars.length === 0 ? (
								<div className="h-40 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border-subtle rounded-3xl opacity-40 italic">
									<CheckCircle2 size={32} className="mb-3" />
									<p className="text-xs">Este template não possui variáveis dinâmicas.</p>
								</div>
							) : (
								<div className="space-y-5 animate-in slide-in-from-right-4 duration-500">
									{extractedVars.map((v) => (
										<div key={v} className="space-y-2">
											<label className="text-[9px] font-black text-primary uppercase tracking-widest px-1">
												{v}
											</label>
											<Input
												value={templateVars[v] || ''}
												onChange={(e) =>
													setTemplateVars((prev) => ({ ...prev, [v]: e.target.value }))
												}
												placeholder={`Valor para ${v}...`}
												className="bg-background border-border-subtle rounded-xl h-11 italic text-xs"
											/>
										</div>
									))}
								</div>
							)}
						</CardContent>

						<div className="mt-10">
							<Button
								onClick={handleSendTest}
								disabled={sending}
								className="w-full py-8 rounded-[24px] bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:bg-primary-hover h-16 gap-3 cursor-pointer group"
							>
								{sending ? (
									<Loader2 className="animate-spin" size={20} />
								) : (
									<Play size={20} fill="currentColor" />
								)}
								{sending ? 'Disparando...' : 'Executar Envio'}
								<ChevronRight
									size={18}
									className="ml-auto opacity-30 group-hover:translate-x-1 transition-transform"
								/>
							</Button>
						</div>
					</Card>
				</div>

				{/* Console: Full Width (Col 12) */}
				<div className="lg:col-span-12">
					<Card className="bg-[#0a0f1e] border-border-subtle rounded-[40px] border shadow-2xl overflow-hidden">
						<CardHeader className="p-6 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
							<CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
								<Terminal size={16} className="text-primary" /> Audit Trail & Response Console
							</CardTitle>
							{responseLog && (
								<Badge
									className={`${
										responseLog.status < 400 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
									} border-none text-[10px] font-black uppercase px-3 py-1`}
								>
									HTTP {responseLog.status || 'ERR'}
								</Badge>
							)}
						</CardHeader>

						<CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5 h-[350px]">
							{/* Request Side */}
							<div className="p-8 overflow-y-auto custom-scrollbar">
								<p className="text-[10px] font-bold text-primary/50 uppercase tracking-widest mb-4">
									Outbound Request
								</p>
								{!requestLog ? (
									<div className="h-full flex items-center justify-center opacity-20 italic text-sm">
										Aguardando execução...
									</div>
								) : (
									<pre className="font-mono text-xs text-primary/80 leading-relaxed whitespace-pre-wrap">
										{JSON.stringify(requestLog, null, 2)}
									</pre>
								)}
							</div>

							{/* Response Side */}
							<div className="p-8 overflow-y-auto custom-scrollbar bg-black/20">
								<p className="text-[10px] font-bold text-success/50 uppercase tracking-widest mb-4">
									Inbound Response
								</p>
								{!responseLog ? (
									<div className="h-full flex items-center justify-center opacity-20 italic text-sm">
										Aguardando resposta do servidor...
									</div>
								) : (
									<pre className="font-mono text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap">
										{JSON.stringify(responseLog, null, 2)}
									</pre>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
