'use client';

import {
	Play,
	RefreshCw,
	Terminal,
	CheckCircle2,
	FileText,
	Server,
	Key,
	User,
	Hash,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
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

	const [sending, setSending] = useState(false);
	const [requestLog, setRequestLog] = useState<any>(null);
	const [responseLog, setResponseLog] = useState<any>(null);

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
		const payload = {
			recipient_to: recipientTo,
			subject,
			template_id: selectedTemplateId === 'none' ? undefined : selectedTemplateId,
			body: selectedTemplateId === 'none' ? body : undefined,
			variables: Object.keys(templateVars).length > 0 ? templateVars : undefined,
		};
		const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1350'}/api/emails`;

		setRequestLog({ method: 'POST', url, headers: { 'x-api-key': '***' }, body: payload });

		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'x-api-key': rawApiKey },
				body: JSON.stringify(payload),
			});
			const result = await res.json();
			setResponseLog({ status: res.status, data: result });
			if (res.ok) toast({ title: 'Enviado', description: 'Requisição aceita.' });
		} catch (err: any) {
			setResponseLog({ error: err.message });
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="space-y-6 animate-in fade-in duration-500">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Sandbox da API</h2>
					<p className="text-sm text-muted-foreground">
						Teste suas integrações e variáveis de ambiente.
					</p>
				</div>
				<Button
					variant="outline"
					onClick={() => {
						setRequestLog(null);
						setResponseLog(null);
					}}
				>
					<RefreshCw className="mr-2 h-4 w-4" /> Limpar Console
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Configuração da Requisição</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-2">
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
							<div className="space-y-2">
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
							<div className="space-y-2">
								<label className="text-sm font-medium">Destinatário</label>
								<Input
									value={recipientTo}
									onChange={(e) => setRecipientTo(e.target.value)}
									placeholder="email@exemplo.com"
								/>
							</div>
							<div className="space-y-2">
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
					<Card>
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
						onClick={handleSendTest}
						disabled={sending}
						className="w-full py-6 text-lg mt-auto"
					>
						<Play className="mr-2 h-5 w-5" /> {sending ? 'Disparando...' : 'Executar Envio'}
					</Button>
				</div>
			</div>

			<Card className="bg-slate-950 text-slate-50 border-slate-800">
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
