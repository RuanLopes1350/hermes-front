'use client';

import { Eye, Hash, Key, Play, RefreshCw, Server, Terminal, User } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { sendHermesEmailAction } from './actions';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/src/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/src/components/ui/select';
import { apiFetch } from '@/src/lib/api';
import { useToast } from '@/src/hooks/use-toast';
import { useTour } from '@/src/hooks/use-tour';

export default function SandboxPage() {
	const { toast } = useToast();
	const [services, setServices] = useState<any[]>([]);
	const [templates, setTemplates] = useState<any[]>([]);

	const [selectedServiceId, setSelectedServiceId] = useState('');
	const [rawApiKey, setRawApiKey] = useState('');
	const [selectedTemplateId, setSelectedTemplateId] = useState('none');
	const [recipientTo, setRecipientTo] = useState('');
	const [subject, setSubject] = useState('');
	const [body, setBody] = useState('');
	const [templateVars, setTemplateVars] = useState<Record<string, string>>({});

	const [previewHtml, setPreviewHtml] = useState('');
	const [previewErrors, setPreviewErrors] = useState<string[]>([]);
	const [previewing, setPreviewing] = useState(false);

	const [sending, setSending] = useState(false);
	const [requestLog, setRequestLog] = useState<any>(null);
	const [responseLog, setResponseLog] = useState<any>(null);

	const { startTour } = useTour([
		{
			element: '#tour-sandbox-service',
			popover: {
				title: 'Escolha o Serviço',
				description: 'Selecione qual Serviço (namespace) você quer usar para testar o envio.',
				side: 'bottom',
			},
		},
		{
			element: '#tour-sandbox-apikey',
			popover: {
				title: 'Chave de API',
				description: 'Cole aqui a API Key da credencial do serviço escolhido. Ela nunca é salva, só usada para este teste.',
				side: 'bottom',
			},
		},
		{
			element: '#tour-sandbox-recipient',
			popover: {
				title: 'Destinatário',
				description: 'O e-mail que vai receber o disparo de teste.',
				side: 'bottom',
			},
		},
		{
			element: '#tour-sandbox-template',
			popover: {
				title: 'Template (opcional)',
				description: 'Escolha um template MJML já cadastrado ou use "Nenhum" para enviar um conteúdo direto.',
				side: 'bottom',
			},
		},
		{
			element: '#tour-sandbox-vars',
			popover: {
				title: 'Variáveis do Template',
				description: 'Se o template tiver variáveis do tipo {{nome}}, elas aparecem aqui automaticamente para você preencher.',
				side: 'left',
			},
		},
		{
			element: '#tour-sandbox-send',
			popover: {
				title: 'Executar Envio',
				description: 'Dispara o e-mail de verdade usando o SDK hermes-client, direto do servidor (Server Action).',
				side: 'top',
			},
		},
		{
			element: '#tour-sandbox-preview',
			popover: {
				title: 'Preview do E-mail',
				description: 'Mostra exatamente como o e-mail vai chegar, já com os valores reais que você digitou nas variáveis — como esse é um envio de verdade, confira aqui antes de disparar.',
				side: 'top',
			},
		},
		{
			element: '#tour-sandbox-terminal',
			popover: {
				title: 'Terminal de Execução',
				description: 'Acompanhe aqui o payload exato enviado (Request) e a resposta da API (Response) — ótimo para depurar integrações.',
				side: 'top',
			},
		},
	]);

	useEffect(() => {
		const loadData = async () => {
			try {
				const [srvRes, tmplRes] = await Promise.all([
					apiFetch('/api/services'),
					apiFetch('/api/templates'),
				]);
				const [srv, tmpl] = await Promise.all([srvRes.json(), tmplRes.json()]);
				setServices(srv.data || []);
				setTemplates(tmpl.data || []);
			} catch (e) {}
		};
		loadData();
	}, []);

	const extractedVars = useMemo<string[]>(() => {
		if (selectedTemplateId === 'none') return [];
		const tmpl = templates.find((t) => t.id === selectedTemplateId);
		if (!tmpl) return [];
		const matches = tmpl.html_content?.match(/{{(.*?)}}/g);
		if (!matches) return [];
		return Array.from(new Set(matches.map((m: string) => m.replace(/{{|}}/g, '').trim())));
	}, [selectedTemplateId, templates]);

	useEffect(() => {
		const tmpl = templates.find((t) => t.id === selectedTemplateId);
		setSubject(tmpl ? tmpl.subject_template : '');
	}, [selectedTemplateId, templates]);

	// Preview do e-mail com os dados REAIS digitados (isso aqui dispara envio de verdade,
	// então mostrar exatamente o que vai sair evita surpresa).
	useEffect(() => {
		if (selectedTemplateId === 'none') {
			// Sem template: o corpo digitado já É o HTML final, sem chamada à API.
			setPreviewHtml(body);
			setPreviewErrors([]);
			setPreviewing(false);
			return;
		}

		const tmpl = templates.find((t) => t.id === selectedTemplateId);
		if (!tmpl?.html_content) {
			setPreviewHtml('');
			setPreviewErrors([]);
			return;
		}

		setPreviewing(true);
		const timer = setTimeout(async () => {
			try {
				const response = await apiFetch('/api/templates/preview', {
					method: 'POST',
					body: JSON.stringify({ mjml: tmpl.html_content, variables: templateVars }),
				});
				const result = await response.json().catch(() => null);
				if (response.ok) {
					setPreviewHtml(result?.html || '');
					setPreviewErrors(result?.errors || []);
				} else {
					setPreviewHtml('');
					setPreviewErrors([result?.message || 'Falha ao gerar o preview.']);
				}
			} catch {
				setPreviewHtml('');
				setPreviewErrors(['Falha de conexão ao gerar o preview.']);
			} finally {
				setPreviewing(false);
			}
		}, 1500);

		return () => clearTimeout(timer);
	}, [selectedTemplateId, templates, templateVars, body]);

	// Só pra exibição no cabeçalho do preview — substitui {{var}} pelos valores já digitados.
	const previewSubject = useMemo(() => {
		if (!subject) return '';
		return subject.replace(/{{\s*([\w.]+)\s*}}/g, (_match, key) => templateVars[key] || `{{${key}}}`);
	}, [subject, templateVars]);

	const handleSendTest = async () => {
		if (!selectedServiceId || !rawApiKey || !recipientTo) {
			toast({
				variant: 'destructive',
				title: 'Atenção',
				description: 'Preencha Serviço, API Key e Destinatário.',
			});
			return;
		}

		setSending(true);
		const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1350';

		// Mantém o payload apenas para log visual do Request
		const payload = {
			recipient_to: recipientTo,
			subject,
			template_id: selectedTemplateId === 'none' ? undefined : selectedTemplateId,
			body: selectedTemplateId === 'none' ? body : undefined,
			variables: Object.keys(templateVars).length > 0 ? templateVars : undefined,
		};

		setRequestLog({
			method: 'POST',
			url: `${baseUrl}/api/emails`,
			headers: { 'x-api-key': '***' },
			body: payload,
		});

		try {
			// Chama a Server Action (que roda no ambiente Node.js)
			const response = await sendHermesEmailAction({
				baseUrl,
				apiKey: rawApiKey,
				recipientTo,
				subject,
				selectedTemplateId,
				body,
				templateVars,
			});

			if (response.success) {
				setResponseLog({ status: 'success', data: response.data });
				toast({
					title: 'Enviado',
					description: 'Requisição aceita usando o SDK Hermes (via Server Action).',
				});
			} else {
				setResponseLog({ error: response.error });
			}
		} catch (err: any) {
			setResponseLog({ error: err.message || err });
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="space-y-6 animate-in fade-in duration-300 ease-out">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Sandbox da API</h2>
					<p className="text-sm text-muted-foreground">
						Teste suas integrações e variáveis de ambiente.
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={startTour}
						variant="outline"
						className="cursor-pointer border-primary text-primary hover:bg-primary/10"
					>
						Tour Guiado
					</Button>
					<Button
						variant="outline"
						className="cursor-pointer"
						onClick={() => {
							setRequestLog(null);
							setResponseLog(null);
						}}
					>
						<RefreshCw className="mr-2 h-4 w-4" /> Limpar Console
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle className="text-lg">Configuração da Requisição</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div id="tour-sandbox-service" className="space-y-2">
								<label className="text-sm font-medium">Serviço</label>
								<Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
									<SelectTrigger>
										<SelectValue placeholder="Selecione..." />
									</SelectTrigger>
									<SelectContent>
										{services.map((s) => (
											<SelectItem key={s.id} value={s.id}>
												{s.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div id="tour-sandbox-apikey" className="space-y-2">
								<label className="text-sm font-medium">Chave de API</label>
								<Input
									type="password"
									value={rawApiKey}
									onChange={(e) => setRawApiKey(e.target.value)}
									placeholder="hm_live_..."
									disabled={!selectedServiceId}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div id="tour-sandbox-recipient" className="space-y-2">
								<label className="text-sm font-medium">Destinatário</label>
								<Input
									value={recipientTo}
									onChange={(e) => setRecipientTo(e.target.value)}
									placeholder="email@exemplo.com"
								/>
							</div>
							<div id="tour-sandbox-template" className="space-y-2">
								<label className="text-sm font-medium">Template HTML</label>
								<Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
									<SelectTrigger>
										<SelectValue placeholder="Envio manual" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">Nenhum (Texto Puro)</SelectItem>
										{templates
											.filter((t) => t.global || t.service_id === selectedServiceId)
											.map((t) => (
												<SelectItem key={t.id} value={t.id}>
													{t.name}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Assunto</label>
							<Input value={subject} onChange={(e) => setSubject(e.target.value)} />
						</div>

						{selectedTemplateId === 'none' && (
							<div className="space-y-2">
								<label className="text-sm font-medium">Conteúdo (HTML/TXT)</label>
								<textarea
									value={body}
									onChange={(e) => setBody(e.target.value)}
									className="w-full h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
								/>
							</div>
						)}
					</CardContent>
				</Card>

				<div className="space-y-6 flex flex-col h-full">
					<Card id="tour-sandbox-vars" className="shadow-sm">
						<CardHeader>
							<CardTitle className="text-lg">Variáveis do Template</CardTitle>
						</CardHeader>
						<CardContent>
							{extractedVars.length === 0 ? (
								<div className="text-sm text-muted-foreground text-center py-6">
									Nenhuma variável detectada no template selecionado.
								</div>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{extractedVars.map((v) => (
										<div key={v} className="space-y-2">
											<label className="text-xs font-semibold text-primary">{v}</label>
											<Input
												value={templateVars[v] || ''}
												onChange={(e) =>
													setTemplateVars((prev) => ({ ...prev, [v]: e.target.value }))
												}
												className="h-9"
											/>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					<Button
						id="tour-sandbox-send"
						onClick={handleSendTest}
						disabled={sending}
						className="w-full py-6 text-lg mt-auto cursor-pointer"
					>
						<Play className="mr-2 h-5 w-5" /> {sending ? 'Disparando...' : 'Executar Envio'}
					</Button>
				</div>
			</div>

			<Card id="tour-sandbox-preview" className="shadow-sm overflow-hidden">
				<CardHeader className="border-b py-3">
					<CardTitle className="text-lg flex items-center gap-2">
						<Eye className="h-4 w-4 text-emerald-500" /> Preview do E-mail
						{previewing && (
							<span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 rounded-full px-2 py-0.5 animate-pulse">
								Renderizando
							</span>
						)}
					</CardTitle>
					<CardDescription>
						Isso dispara um envio real — confira exatamente o que vai chegar antes de clicar em
						&quot;Executar Envio&quot;.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					<div className="border-b bg-muted/30 px-4 py-2 text-xs text-muted-foreground space-y-0.5">
						<p>
							<span className="font-semibold text-foreground">Para:</span> {recipientTo || '—'}
						</p>
						<p>
							<span className="font-semibold text-foreground">Assunto:</span> {previewSubject || '—'}
						</p>
					</div>

					{previewErrors.length > 0 && (
						<div className="border-b bg-warning/10 px-4 py-3 flex gap-2 text-xs text-foreground">
							<span className="font-semibold text-warning shrink-0">Erro ao renderizar:</span>
							<div className="flex flex-col gap-1">
								{previewErrors.map((e, i) => (
									<span key={i} className="text-muted-foreground">
										{e}
									</span>
								))}
							</div>
						</div>
					)}

					{previewHtml ? (
						<iframe
							srcDoc={previewHtml}
							className="w-full h-[500px] bg-white border-none"
							title="Preview do e-mail"
						/>
					) : (
						<div className="h-40 flex items-center justify-center text-sm text-muted-foreground italic">
							{selectedTemplateId === 'none'
								? 'Digite um conteúdo em "Conteúdo (HTML/TXT)" para pré-visualizar.'
								: 'Selecione um template para pré-visualizar.'}
						</div>
					)}
				</CardContent>
			</Card>

			<Card id="tour-sandbox-terminal" className="bg-slate-950 text-slate-50 border-slate-800 shadow-sm">
				<CardHeader className="border-b border-slate-800 py-3">
					<CardTitle className="text-sm flex items-center gap-2">
						<Terminal className="h-4 w-4" /> Terminal de Execução
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
					<div className="p-4 h-64 overflow-y-auto">
						<p className="text-xs font-mono text-slate-400 mb-2">Request</p>
						<pre className="text-xs font-mono text-blue-400 whitespace-pre-wrap">
							{requestLog ? JSON.stringify(requestLog, null, 2) : 'Aguardando requisição...'}
						</pre>
					</div>
					<div className="p-4 h-64 overflow-y-auto bg-black/20">
						<p className="text-xs font-mono text-slate-400 mb-2">Response</p>
						<pre
							className={`text-xs font-mono whitespace-pre-wrap ${responseLog?.error ? 'text-red-400' : 'text-emerald-400'}`}
						>
							{responseLog ? JSON.stringify(responseLog, null, 2) : 'Aguardando resposta...'}
						</pre>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
