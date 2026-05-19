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
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/src/components/ui/select';
import { authClient } from '@/src/lib/auth-client';
import { notFound } from 'next/navigation';

export default function SandboxPage() {
	const [sending, setSending] = useState(false);
	const [response, setResponse] = useState<any>(null);
	const { data: session, isPending: isSessionLoading } = authClient.useSession();

	/**
	 * Proteção de Rota: Se não for admin, 404 stealth
	 */
	useEffect(() => {
		if (!isSessionLoading && session && (session.user as any).isAdmin) {
			notFound();
		}
	}, [session, isSessionLoading]);

	const handleSendTest = () => {
		setSending(true);
		setTimeout(() => {
			setResponse({
				status: 202,
				message: 'E-mail enfileirado com sucesso.',
				jobId: 'job_abc123',
				timestamp: new Date().toISOString(),
			});
			setSending(false);
		}, 1500);
	};

	if (isSessionLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<Loader2 className="animate-spin text-primary" size={32} />
			</div>
		);
	}

	return (
		<div className="space-y-12 text-left">
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
				<div>
					<h2 className="text-3xl font-bold tracking-tight mb-2 uppercase text-foreground">
						Sandbox de Testes
					</h2>
					<p className="text-muted-foreground text-sm font-medium italic">
						Simule envios de e-mail e valide suas integrações em tempo real.
					</p>
				</div>

				<Button
					variant="outline"
					className="gap-2 uppercase font-bold tracking-widest text-[10px]"
					onClick={() => setResponse(null)}
				>
					<RefreshCw size={16} /> Limpar Console
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Painel de Configuração de Teste */}
				<Card className="bg-surface border-border-subtle rounded-[40px] p-10 border text-left">
					<CardHeader className="p-0 mb-8 flex flex-row items-center gap-3">
						<Settings2 size={24} className="text-primary" />
						<CardTitle className="text-xl font-bold italic uppercase tracking-tighter text-foreground">
							Configurar Disparo
						</CardTitle>
					</CardHeader>

					<CardContent className="p-0 space-y-8">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-3">
								<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
									Serviço de Origem
								</label>
								<Select defaultValue="srv_1">
									<SelectTrigger className="bg-background border-border-subtle rounded-2xl h-14 italic font-medium">
										<SelectValue placeholder="Selecione..." />
									</SelectTrigger>
									<SelectContent className="bg-surface border-border-subtle">
										<SelectItem value="srv_1">Plataforma Principal</SelectItem>
										<SelectItem value="srv_2">App Mobile</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-3">
								<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
									Template
								</label>
								<Select defaultValue="tmp_1">
									<SelectTrigger className="bg-background border-border-subtle rounded-2xl h-14 italic font-medium">
										<SelectValue placeholder="Selecione..." />
									</SelectTrigger>
									<SelectContent className="bg-surface border-border-subtle">
										<SelectItem value="tmp_1">Boas-vindas</SelectItem>
										<SelectItem value="tmp_2">Recuperação de Senha</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-3">
							<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
								E-mail de Destino
							</label>
							<Input
								placeholder="exemplo@teste.com"
								className="bg-background border-border-subtle rounded-2xl px-6 py-7 text-base focus:border-primary font-medium italic h-14"
							/>
						</div>

						<div className="space-y-3">
							<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
								Payload de Variáveis (JSON)
							</label>
							<div className="bg-background border border-border-subtle rounded-3xl p-6 font-mono text-sm overflow-hidden min-h-[150px]">
								<pre className="text-primary/70 leading-relaxed italic">
									{`{\n  "name": "Usuário Teste",\n  "company": "Hermes Engine"\n}`}
								</pre>
							</div>
						</div>

						<Button
							onClick={handleSendTest}
							disabled={sending}
							className="w-full py-8 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-hover h-16 gap-3"
						>
							{sending ? (
								<Loader2 className="animate-spin" size={20} />
							) : (
								<Play size={20} fill="currentColor" />
							)}
							{sending ? 'Enviando...' : 'Executar Teste de Envio'}
						</Button>
					</CardContent>
				</Card>

				{/* Console de Resposta */}
				<div className="space-y-6 flex flex-col h-full">
					<Card className="bg-surface border-border-subtle rounded-[40px] border flex-1 flex flex-col overflow-hidden">
						<CardHeader className="p-8 border-b border-border-subtle bg-background/30 flex flex-row items-center justify-between space-y-0">
							<CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
								<Terminal size={16} className="text-primary" /> Console de Saída
							</CardTitle>
							{response && (
								<Badge className="bg-success/10 text-success border-none text-[9px] font-black uppercase px-2 py-0.5">
									HTTP 202
								</Badge>
							)}
						</CardHeader>

						<CardContent className="p-8 flex-1 bg-[#0a0f1e] font-mono text-xs overflow-y-auto">
							{!response && !sending && (
								<div className="h-full flex items-center justify-center text-muted-foreground/30 italic">
									Aguardando execução...
								</div>
							)}

							{sending && (
								<div className="text-primary animate-pulse">
									{`> POST /api/send\n> Processing request...\n> Establishing secure connection...`}
								</div>
							)}

							{response && (
								<div className="space-y-4 animate-in fade-in duration-500">
									<p className="text-success font-bold">{`> Response received:`}</p>
									<pre className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
										{JSON.stringify(response, null, 2)}
									</pre>
									<div className="pt-4 border-t border-white/5 flex items-center gap-2 text-muted-foreground italic">
										<CheckCircle2 size={12} className="text-success" />
										Requisição aceita. Verifique os logs para status de entrega.
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					<Card className="bg-primary/5 border border-primary/20 rounded-[32px] p-6 border text-left">
						<div className="flex gap-4">
							<div className="p-3 bg-primary/10 rounded-2xl h-fit">
								<Code size={20} className="text-primary" />
							</div>
							<div>
								<h4 className="font-bold text-sm text-foreground uppercase tracking-tight mb-1">
									Dica de Integração
								</h4>
								<p className="text-muted-foreground text-[11px] italic leading-relaxed">
									Você pode usar nosso SDK oficial para Node.js para integrar este disparo em menos
									de 3 linhas de código.
								</p>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
