'use client';

import { useState } from 'react';
import {
	BookOpen,
	User,
	Layers,
	Mail,
	Key,
	Terminal,
	ExternalLink,
	ArrowRight,
	ArrowLeft,
	CheckCircle2,
	ChevronRight,
	Copy,
	Check,
	Sparkles,
	Settings,
	ShieldCheck,
	PlayCircle,
	AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { ThemeToggle } from '@/src/components/theme-toggle';

export default function TutorialPage() {
	const [currentStep, setCurrentStep] = useState(0);
	const [codeLanguage, setCodeLanguage] = useState<'curl' | 'javascript' | 'python'>('curl');
	const [smtpType, setSmtpType] = useState<'plain' | 'oauth2'>('oauth2');
	const [generatedKey, setGeneratedKey] = useState('');
	const [copied, setCopied] = useState(false);

	const steps = [
		{ id: 'register', title: 'Cadastro e Acesso', icon: User },
		{ id: 'service', title: 'Criação de Serviço', icon: Layers },
		{ id: 'smtp', title: 'SMTP e Google OAuth2', icon: Settings },
		{ id: 'templates', title: 'Criação de Templates', icon: Sparkles },
		{ id: 'apikey', title: 'Chaves de API', icon: Key },
		{ id: 'send', title: 'Enviando E-mails', icon: Terminal },
		{ id: 'swagger', title: 'Documentação Swagger', icon: BookOpen },
	];

	const handleCopy = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const generateSimulatedKey = () => {
		const randomHex = Array.from({ length: 32 }, () =>
			Math.floor(Math.random() * 16).toString(16)
		).join('');
		setGeneratedKey(`hermes_live_${randomHex.substring(0, 24)}`);
	};

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
			{/* Header */}
			<header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
				<div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6">
					<div className="flex items-center gap-3">
						<img src="/hermes-icon.svg" alt="Hermes Icon" className="h-6 w-6" />
						<span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
							Hermes
						</span>
						<Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
							Guia do Desenvolvedor
						</Badge>
					</div>
					<div className="flex items-center gap-3">
						<ThemeToggle />
						<Link href="/auth/sign-in">
							<Button variant="ghost" className="cursor-pointer">
								Entrar
							</Button>
						</Link>
						<Link href="/auth/sign-up">
							<Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-lg shadow-primary/20">
								Criar Conta Grátis
							</Button>
						</Link>
					</div>
				</div>
			</header>

			{/* Main Grid */}
			<div className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Sidebar Steps */}
				<aside className="lg:col-span-3 space-y-2">
					<div className="p-4 bg-muted/50 rounded-xl border border-border mb-6">
						<h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Fluxo de Integração</h3>
						<p className="text-xs text-muted-foreground/70">Siga o passo a passo para integrar seu sistema com o Hermes.</p>
					</div>

					<nav className="space-y-1">
						{steps.map((step, idx) => {
							const StepIcon = step.icon;
							const isActive = currentStep === idx;
							const isCompleted = currentStep > idx;

							return (
								<button
									key={step.id}
									onClick={() => setCurrentStep(idx)}
									className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-300 group cursor-pointer ${isActive
											? 'bg-primary/10 border-l-4 border-primary text-foreground font-medium shadow-sm'
											: 'text-muted-foreground hover:text-foreground hover:bg-muted/60 border-l-4 border-transparent'
										}`}
								>
									<span
										className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs transition-colors ${isActive
												? 'bg-primary text-primary-foreground'
												: isCompleted
													? 'bg-accent text-accent-foreground border border-primary/30'
													: 'bg-muted text-muted-foreground group-hover:bg-secondary'
											}`}
									>
										{isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
									</span>
									<StepIcon className={`h-4 w-4 shrink-0 transition-transform ${isActive ? 'scale-110 text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
									<span className="text-sm truncate">{step.title}</span>
								</button>
							);
						})}
					</nav>
				</aside>

				{/* Content Panel */}
				<main className="lg:col-span-9 flex flex-col min-w-0">
					<div className="flex-1 bg-card border border-border rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
						{/* Background glow effects */}
						<div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
						<div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

						{/* STEP 1: REGISTER */}
						{currentStep === 0 && (
							<div className="space-y-6 animate-in fade-in duration-500">
								<div className="space-y-2">
									<Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">Passo 1</Badge>
									<h2 className="text-3xl font-extrabold text-foreground tracking-tight">Cadastro e Acesso Seguro</h2>
									<p className="text-muted-foreground text-base">
										O Hermes utiliza o <strong>Better Auth</strong> para gerenciar sessões, senhas e logins sociais com segurança de ponta.
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
									<div className="space-y-4">
										<div className="flex gap-4">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
												<User className="h-5 w-5" />
											</div>
											<div>
												<h4 className="text-foreground font-bold">Criação de Conta</h4>
												<p className="text-sm text-muted-foreground">
													Cadastre-se usando seu e-mail ou utilize o login social do Google para acesso instantâneo.
												</p>
											</div>
										</div>

										<div className="flex gap-4">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/50 text-accent-foreground">
												<ShieldCheck className="h-5 w-5" />
											</div>
											<div>
												<h4 className="text-foreground font-bold">Controle de Privilégios</h4>
												<p className="text-sm text-muted-foreground">
													O primeiro usuário registrado na base ganha perfil Administrador (<code className="text-primary text-xs">isAdmin: true</code>), permitindo gerenciar outros usuários e visualizar auditorias completas de envios.
												</p>
											</div>
										</div>
									</div>

									{/* Visual mockup of register card */}
									<Card className="bg-background border-border shadow-xl max-w-sm mx-auto w-full">
										<CardHeader className="space-y-1 pb-4">
											<CardTitle className="text-lg text-foreground font-bold text-center">Criar conta no Hermes</CardTitle>
											<CardDescription className="text-muted-foreground text-xs text-center">Entre com seus dados para começar</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="space-y-1">
												<label className="text-[10px] uppercase font-bold text-muted-foreground">Nome Completo</label>
												<div className="bg-muted border border-border rounded-lg p-2.5 text-xs text-muted-foreground">Desenvolvedor Hermes</div>
											</div>
											<div className="space-y-1">
												<label className="text-[10px] uppercase font-bold text-muted-foreground">E-mail corporativo</label>
												<div className="bg-muted border border-border rounded-lg p-2.5 text-xs text-muted-foreground">dev@suaempresa.com</div>
											</div>
											<div className="space-y-1">
												<label className="text-[10px] uppercase font-bold text-muted-foreground">Senha de Acesso</label>
												<div className="bg-muted border border-border rounded-lg p-2.5 text-xs text-muted-foreground">••••••••••••••</div>
											</div>
											<Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 cursor-not-allowed">
												Criar conta
											</Button>
											<div className="relative flex py-1 items-center">
												<div className="flex-grow border-t border-border"></div>
												<span className="flex-shrink mx-3 text-[10px] text-muted-foreground/50 font-bold uppercase">Ou</span>
												<div className="flex-grow border-t border-border"></div>
											</div>
											<Button variant="outline" className="w-full text-xs h-9 cursor-not-allowed flex items-center justify-center gap-2">
												<svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
													<path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.57 15.01 1 12 1 7.24 1 3.2 3.74 1.25 7.74l3.84 2.98C6.03 7.74 8.78 5.04 12 5.04z" />
													<path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.45h6.47c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.87c2.16-1.99 3.41-4.92 3.41-8.55z" />
													<path fill="#FBBC05" d="M5.09 14.76c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.25 7.15C.45 8.79 0 10.62 0 12.5s.45 3.71 1.25 5.35l3.84-3.09z" />
													<path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.02.68-2.33 1.09-3.96 1.09-3.22 0-5.97-2.7-6.91-5.68l-3.84 2.98C3.2 20.26 7.24 23 12 23z" />
												</svg>
												Registrar com o Google
											</Button>
										</CardContent>
									</Card>
								</div>
							</div>
						)}

						{/* STEP 2: CREATING SERVICE */}
						{currentStep === 1 && (
							<div className="space-y-6 animate-in fade-in duration-500">
								<div className="space-y-2">
									<Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">Passo 2</Badge>
									<h2 className="text-3xl font-extrabold text-foreground tracking-tight">Criação de Serviço (Tenant)</h2>
									<p className="text-muted-foreground text-base">
										No Hermes, um <strong>Serviço</strong> atua como uma partição lógica (Tenant). Todos os e-mails, templates, logs e chaves de API pertencem a um serviço específico.
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
									{/* Interactive simulation */}
									<Card className="bg-background border-border p-6 shadow-sm space-y-4">
										<div className="flex items-center justify-between pb-2 border-b border-border">
											<span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Novo Serviço</span>
											<Badge className="bg-primary/10 text-primary border border-primary/20">Dashboard</Badge>
										</div>
										<div className="space-y-3">
											<div className="space-y-1">
												<label className="text-[10px] font-bold uppercase text-muted-foreground">Nome do Serviço</label>
												<input
													type="text"
													readOnly
													value="E-commerce API"
													className="w-full bg-muted border border-border rounded-lg p-2.5 text-xs text-foreground outline-none"
												/>
											</div>
											<div className="space-y-1">
												<label className="text-[10px] font-bold uppercase text-muted-foreground">Finalidade / Descrição</label>
												<textarea
													readOnly
													value="Disparar e-mails de confirmação de compras e rastreios de pedidos."
													rows={2}
													className="w-full bg-muted border border-border rounded-lg p-2.5 text-xs text-foreground outline-none resize-none"
												/>
											</div>
											<Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 cursor-not-allowed">
												Criar Serviço
											</Button>
										</div>
									</Card>

									<div className="space-y-4">
										<div className="flex gap-4">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
												<Layers className="h-5 w-5" />
											</div>
											<div>
												<h4 className="text-foreground font-bold">Isolamento Multi-Tenant</h4>
												<p className="text-sm text-muted-foreground">
													Crie múltiplos serviços (ex: <em>Faturamento</em>, <em>Marketing</em>, <em>Suporte</em>). O acesso a um serviço é isolado entre os membros convidados.
												</p>
											</div>
										</div>

										<div className="flex gap-4">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/50 text-accent-foreground">
												<User className="h-5 w-5" />
											</div>
											<div>
												<h4 className="text-foreground font-bold">Membros do Serviço</h4>
												<p className="text-sm text-muted-foreground">
													Como proprietário do serviço, você pode convidar outros usuários pelo e-mail deles para colaborar no mesmo painel de métricas.
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* STEP 3: SMTP & GOOGLE OAUTH2 */}
						{currentStep === 2 && (
							<div className="space-y-6 animate-in fade-in duration-500">
								<div className="space-y-2">
									<Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">Passo 3</Badge>
									<h2 className="text-3xl font-extrabold text-foreground tracking-tight">Provedor de E-mail (SMTP / OAuth2)</h2>
									<p className="text-muted-foreground text-base">
										Para enviar e-mails de forma confiável, configure uma <strong>Credencial</strong>. O Hermes suporta autenticação SMTP tradicional por senha e autenticação moderna OAuth2 com o Google.
									</p>
								</div>

								{/* Toggle Selector */}
								<div className="flex justify-center border-b border-border pb-2">
									<div className="bg-muted p-1 rounded-lg border border-border flex gap-2">
										<button
											onClick={() => setSmtpType('oauth2')}
											className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${smtpType === 'oauth2'
													? 'bg-primary text-primary-foreground shadow'
													: 'text-muted-foreground hover:text-foreground'
												}`}
										>
											Google OAuth2 (Recomendado)
										</button>
										<button
											onClick={() => setSmtpType('plain')}
											className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${smtpType === 'plain'
													? 'bg-primary text-primary-foreground shadow'
													: 'text-muted-foreground hover:text-foreground'
												}`}
										>
											SMTP Simples (Senha)
										</button>
									</div>
								</div>

								{smtpType === 'oauth2' ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
										<div className="space-y-4 text-sm text-muted-foreground">
											<h3 className="text-foreground font-bold text-base flex items-center gap-2">
												<span className="h-2 w-2 rounded-full bg-success inline-block"></span>
												Por que usar Google OAuth2?
											</h3>
											<p>
												O Google está descontinuando o uso de senhas tradicionais (menos seguras). O OAuth2 autentica o Hermes via tokens de acesso dinâmicos sem expor sua senha.
											</p>

											<div className="p-4 bg-muted/50 rounded-xl border border-border space-y-2 text-xs">
												<h4 className="text-foreground font-bold uppercase tracking-wider">Como configurar:</h4>
												<ol className="list-decimal list-inside space-y-1 text-muted-foreground">
													<li>Crie um projeto no Google Cloud Console.</li>
													<li>Configure a tela de Consentimento OAuth e crie uma credencial de ID do Cliente.</li>
													<li>Adicione a URI de redirecionamento autorizada.</li>
													<li>Utilize o fluxo do Hermes para logar em sua conta do Gmail de envio e obter o <strong>Refresh Token</strong>.</li>
												</ol>
											</div>
										</div>

										<Card className="bg-background border-border p-5 shadow-sm space-y-3">
											<div className="space-y-1">
												<label className="text-[10px] font-bold uppercase text-muted-foreground">Tipo de Autenticação</label>
												<div className="bg-muted border border-border rounded-lg p-2.5 text-xs text-foreground font-semibold flex items-center justify-between">
													<span>OAuth2 (Google API)</span>
													<Badge className="bg-success/10 text-success border border-success/20">Seguro</Badge>
												</div>
											</div>
											<div className="space-y-1">
												<label className="text-[10px] font-bold uppercase text-muted-foreground">Google Client ID</label>
												<input type="text" readOnly value="1069303710668-cniot9...apps.googleusercontent.com" className="w-full bg-muted border border-border rounded-lg p-2.5 text-xs text-muted-foreground outline-none" />
											</div>
											<div className="space-y-1">
												<label className="text-[10px] font-bold uppercase text-muted-foreground">Google Client Secret</label>
												<input type="text" readOnly value="GOCSPX-u1234..." className="w-full bg-muted border border-border rounded-lg p-2.5 text-xs text-muted-foreground outline-none" />
											</div>
											<div className="space-y-1">
												<label className="text-[10px] font-bold uppercase text-muted-foreground">Gmail do Remetente</label>
												<input type="text" readOnly value="envios@suaempresa.com" className="w-full bg-muted border border-border rounded-lg p-2.5 text-xs text-foreground outline-none" />
											</div>
											<div className="space-y-1">
												<label className="text-[10px] font-bold uppercase text-muted-foreground">Refresh Token</label>
												<input type="text" readOnly value="1//04hWp3..." className="w-full bg-muted border border-border rounded-lg p-2.5 text-xs text-muted-foreground outline-none" />
											</div>
										</Card>
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
										<div className="space-y-4 text-sm text-muted-foreground">
											<h3 className="text-foreground font-bold text-base">Configuração SMTP Comum</h3>
											<p>
												Ideal para servidores de e-mail próprios, SendGrid, Mailgun, Amazon SES ou servidores internos de hospedagem corporativa.
											</p>

											<div className="p-4 bg-muted/50 rounded-xl border border-border space-y-2 text-xs">
												<h4 className="text-foreground font-bold uppercase tracking-wider">Segurança das Credenciais:</h4>
												<p className="text-muted-foreground">
													As senhas (<code className="text-primary">passkey</code>) e segredos armazenados são criptografados no banco de dados com algoritmo AES-256-CBC de padrão industrial, impedindo vazamentos mesmo com acesso físico às tabelas.
												</p>
											</div>
										</div>

										<Card className="bg-background border-border p-5 shadow-sm space-y-3">
											<div className="space-y-1">
												<label className="text-[10px] font-bold uppercase text-muted-foreground">SMTP Host</label>
												<input type="text" readOnly value="smtp.sendgrid.net" className="w-full bg-muted border border-border rounded-lg p-2.5 text-xs text-foreground outline-none" />
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-1">
													<label className="text-[10px] font-bold uppercase text-muted-foreground">Porta</label>
													<input type="text" readOnly value="465" className="w-full bg-muted border border-border rounded-lg p-2.5 text-xs text-foreground outline-none" />
												</div>
												<div className="space-y-1">
													<label className="text-[10px] font-bold uppercase text-muted-foreground">SSL / TLS</label>
													<div className="bg-success/10 border border-success/20 rounded-lg p-2.5 text-xs text-success font-bold">Ativo (SSL)</div>
												</div>
											</div>
											<div className="space-y-1">
												<label className="text-[10px] font-bold uppercase text-muted-foreground">Usuário SMTP</label>
												<input type="text" readOnly value="apikey" className="w-full bg-muted border border-border rounded-lg p-2.5 text-xs text-foreground outline-none" />
											</div>
											<div className="space-y-1">
												<label className="text-[10px] font-bold uppercase text-muted-foreground">Senha SMTP</label>
												<input type="text" readOnly value="••••••••••••••••••••••••" className="w-full bg-muted border border-border rounded-lg p-2.5 text-xs text-muted-foreground outline-none" />
											</div>
										</Card>
									</div>
								)}
							</div>
						)}

						{/* STEP 4: TEMPLATES */}
						{currentStep === 3 && (
							<div className="space-y-6 animate-in fade-in duration-500">
								<div className="space-y-2">
									<Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">Passo 4</Badge>
									<h2 className="text-3xl font-extrabold text-foreground tracking-tight">Templates Dinâmicos com MJML e Handlebars</h2>
									<p className="text-muted-foreground text-base">
										Crie e-mails responsivos que abrem perfeitamente no celular e desktop usando a sintaxe robusta do <strong>MJML</strong> aliada às variáveis dinâmicas do <strong>Handlebars</strong>.
									</p>
								</div>

								<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch pt-2">
									{/* MJML Code Editor Mockup */}
									<div className="xl:col-span-7 flex flex-col rounded-xl border border-border overflow-hidden bg-background font-mono text-xs shadow-sm min-h-[300px]">
										<div className="bg-muted px-4 py-2 border-b border-border flex justify-between items-center">
											<span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">MJML Template</span>
											<Badge className="bg-primary/10 text-primary border border-primary/20 font-sans">AOT Compilado</Badge>
										</div>
										<pre className="p-4 text-primary/90 overflow-x-auto select-none leading-relaxed flex-1">
											{`1: <mjml>
2:   <mj-body>
3:     <mj-section>
4:       <mj-column>
5:         <mj-text font-size="20px">
6:           Olá, {{nome_usuario}}!
7:         </mj-text>
8:         <mj-text>
9:           Seu pedido #{{pedido}} foi enviado.
10:        </mj-text>
11:      </mj-column>
12:    </mj-section>
13:   </mj-body>
14: </mjml>`}
										</pre>
									</div>

									{/* Explanation */}
									<div className="xl:col-span-5 space-y-4 flex flex-col justify-center text-sm text-muted-foreground">
										<div className="flex gap-3 items-start">
											<div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0"></div>
											<p>
												<strong className="text-foreground">Compilação AOT (Ahead-Of-Time)</strong>: O Hermes compila o código MJML para HTML puro no momento em que você o salva, garantindo que o envio de e-mails pelo worker BullMQ seja até 50 vezes mais rápido por não sobrecarregar a CPU.
											</p>
										</div>
										<div className="flex gap-3 items-start">
											<div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0"></div>
											<p>
												<strong className="text-foreground">Fácil injeção</strong>: Chaves Handlebars como <code className="text-primary text-xs">{"{{nome_usuario}}"}</code> são mantidas no HTML compilado para substituição dinâmica rápida em tempo de envio.
											</p>
										</div>
										<div className="flex gap-3 items-start">
											<div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0"></div>
											<p>
												<strong className="text-foreground">Sanitização automática</strong>: O Hermes higieniza HTML perigoso nas variáveis enviadas para evitar injeções de scripts maliciosos (XSS) no leitor do e-mail.
											</p>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* STEP 5: API KEYS */}
						{currentStep === 4 && (
							<div className="space-y-6 animate-in fade-in duration-500">
								<div className="space-y-2">
									<Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">Passo 5</Badge>
									<h2 className="text-3xl font-extrabold text-foreground tracking-tight">Geração de Chaves de API Seguras</h2>
									<p className="text-muted-foreground text-base">
										Para integrar seus sistemas, você deve gerar uma <strong>API Key</strong> associada a um Serviço e a uma Credencial de e-mail.
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
									<div className="space-y-4 text-sm text-muted-foreground">
										<h3 className="text-foreground font-bold text-base">Como funciona a API Key?</h3>
										<p>
											Cada API Key gerada é atrelada a uma credencial específica de SMTP. Quando seu sistema faz um envio usando essa chave, o Hermes já sabe por qual servidor deve rotear o e-mail.
										</p>
										<p>
											O Hermes exibe a chave apenas <strong>uma única vez</strong> no momento da criação. O banco de dados armazena apenas um hash irreversível da chave, garantindo segurança total.
										</p>
									</div>

									{/* Simulated API Key Generator */}
									<Card className="bg-background border-border p-6 shadow-sm space-y-4">
										<div className="space-y-1">
											<label className="text-[10px] font-bold uppercase text-muted-foreground">Serviço Destino</label>
											<div className="bg-muted border border-border rounded-lg p-2.5 text-xs text-foreground">E-commerce API</div>
										</div>
										<div className="space-y-1">
											<label className="text-[10px] font-bold uppercase text-muted-foreground">Credencial de Envio</label>
											<div className="bg-muted border border-border rounded-lg p-2.5 text-xs text-foreground">Gmail OAuth2 corporativo</div>
										</div>

										<div className="pt-2">
											{generatedKey ? (
												<div className="space-y-2">
													<label className="text-[10px] font-bold uppercase text-success">Sua API Key (Copie agora!)</label>
													<div className="flex gap-2">
														<div className="bg-muted border border-success/30 rounded-lg p-2.5 text-xs font-mono text-foreground flex-1 select-all break-all">
															{generatedKey}
														</div>
														<Button
															size="icon"
															onClick={() => handleCopy(generatedKey)}
															className="bg-success hover:bg-success/90 text-success-foreground cursor-pointer h-10 w-10 shrink-0"
														>
															{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
														</Button>
													</div>
													<p className="text-[10px] text-warning flex items-center gap-1">
														<AlertCircle className="h-3.5 w-3.5" />
														Esta chave não será exibida novamente no painel.
													</p>
												</div>
											) : (
												<Button
													onClick={generateSimulatedKey}
													className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-10 cursor-pointer flex items-center justify-center gap-2"
												>
													<Key className="h-4 w-4" />
													Gerar Chave de Teste
												</Button>
											)}
										</div>
									</Card>
								</div>
							</div>
						)}

						{/* STEP 6: SENDING EMAIL (REQUESTS & RESPONSES) */}
						{currentStep === 5 && (
							<div className="space-y-6 animate-in fade-in duration-500">
								<div className="space-y-2">
									<Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">Passo 6</Badge>
									<h2 className="text-3xl font-extrabold text-foreground tracking-tight">Utilização Prática: Requests &amp; Responses</h2>
									<p className="text-muted-foreground text-base">
										Faça chamadas HTTP REST para enviar e-mails de forma simples ou em lote (bulk). Insira sua chave no header <code className="text-primary text-sm">x-api-key</code>.
									</p>
								</div>

								{/* Language Selector */}
								<div className="flex gap-2 border-b border-border pb-2">
									{(['curl', 'javascript', 'python'] as const).map((lang) => (
										<button
											key={lang}
											onClick={() => setCodeLanguage(lang)}
											className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${codeLanguage === lang
													? 'bg-primary text-primary-foreground shadow'
													: 'text-muted-foreground hover:text-foreground'
												}`}
										>
											{lang}
										</button>
									))}
								</div>

								<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
									{/* Code display */}
									<div className="xl:col-span-7 flex flex-col rounded-xl border border-border overflow-hidden bg-background font-mono text-xs shadow-sm min-h-[300px]">
										<div className="bg-muted px-4 py-2 border-b border-border flex justify-between items-center">
											<span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Requisição HTTP</span>
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
												onClick={() => {
													const codes = {
														curl: `curl -X POST http://localhost:1350/api/emails \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: hermes_live_8f3b2591a27e4d9c" \\\n  -d '{\n    "subject": "Confirmação de Compra",\n    "recipient_to": "cliente@email.com",\n    "template_id": "4db97abf-3265-410a-8007",\n    "variables": {\n      "nome_usuario": "Ruan Lopes",\n      "pedido": "9810ee"\n    }\n  }'`,
														javascript: `import axios from 'axios';\n\nconst response = await axios.post(\n  'http://localhost:1350/api/emails',\n  {\n    subject: 'Confirmação de Compra',\n    recipient_to: 'cliente@email.com',\n    template_id: '4db97abf-3265-410a-8007',\n    variables: {\n      nome_usuario: 'Ruan Lopes',\n      pedido: '9810ee'\n    }\n  },\n  {\n    headers: {\n      'x-api-key': 'hermes_live_8f3b2591a27e4d9c'\n    }\n  }\n);`,
														python: `import requests\n\nurl = 'http://localhost:1350/api/emails'\nheaders = {\n    'x-api-key': 'hermes_live_8f3b2591a27e4d9c',\n    'Content-Type': 'application/json'\n}\ndata = {\n    "subject": "Confirmação de Compra",\n    "recipient_to": "cliente@email.com",\n    "template_id": "4db97abf-3265-410a-8007",\n    "variables": {\n        "nome_usuario": "Ruan Lopes",\n        "pedido": "9810ee"\n    }\n}\n\nresponse = requests.post(url, headers=headers, json=data)`
													};
													handleCopy(codes[codeLanguage]);
												}}
											>
												{copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
											</Button>
										</div>
										<pre className="p-4 text-primary/90 overflow-x-auto select-all leading-relaxed flex-1">
											{codeLanguage === 'curl' && (
												`curl -X POST http://localhost:1350/api/emails \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: hermes_live_8f3b2591a27e4d9c" \\
  -d '{
    "subject": "Confirmação de Compra",
    "recipient_to": "cliente@email.com",
    "template_id": "4db97abf-3265-410a-8007",
    "variables": {
      "nome_usuario": "Ruan Lopes",
      "pedido": "9810ee"
    }
  }'`
											)}
											{codeLanguage === 'javascript' && (
												`import axios from 'axios';

const response = await axios.post(
  'http://localhost:1350/api/emails',
  {
    subject: 'Confirmação de Compra',
    recipient_to: 'cliente@email.com',
    template_id: '4db97abf-3265-410a-8007',
    variables: {
      nome_usuario: 'Ruan Lopes',
      pedido: '9810ee'
    }
  },
  {
    headers: {
      'x-api-key': 'hermes_live_8f3b2591a27e4d9c'
    }
  }
);`
											)}
											{codeLanguage === 'python' && (
												`import requests

url = 'http://localhost:1350/api/emails'
headers = {
    'x-api-key': 'hermes_live_8f3b2591a27e4d9c',
    'Content-Type': 'application/json'
}
data = {
    "subject": "Confirmação de Compra",
    "recipient_to": "cliente@email.com",
    "template_id": "4db97abf-3265-410a-8007",
    "variables": {
        "nome_usuario": "Ruan Lopes",
        "pedido": "9810ee"
    }
}

response = requests.post(url, headers=headers, json=data)`
											)}
										</pre>
									</div>

									{/* Simulated Response */}
									<div className="xl:col-span-5 flex flex-col rounded-xl border border-border overflow-hidden bg-background font-mono text-xs shadow-sm min-h-[300px]">
										<div className="bg-muted px-4 py-2 border-b border-border flex justify-between items-center">
											<span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Resposta do Servidor</span>
											<Badge className="bg-success/10 text-success border border-success/20 font-sans">202 Accepted</Badge>
										</div>
										<pre className="p-4 text-success/90 overflow-x-auto select-none leading-relaxed flex-1">
											{`{
  "success": true,
  "statusCode": 202,
  "message": "E-mail enfileirado com sucesso!",
  "data": {
    "id": "e3020616-2139-4442-8c93-dd4035",
    "status": "pending",
    "recipient_to": "cliente@email.com",
    "priority": "medium",
    "scheduled_at": null
  }
}`}
										</pre>
									</div>
								</div>
							</div>
						)}

						{/* STEP 7: SWAGGER DOCUMENTATION */}
						{currentStep === 6 && (
							<div className="space-y-6 animate-in fade-in duration-500">
								<div className="space-y-2">
									<Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">Passo 7</Badge>
									<h2 className="text-3xl font-extrabold text-foreground tracking-tight">Documentação OpenAPI / Swagger</h2>
									<p className="text-muted-foreground text-base">
										O Hermes possui documentação automática Swagger integrada que permite testar requisições em tempo real no ambiente do desenvolvedor.
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
									<div className="space-y-4">
										<div className="flex gap-4">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
												<BookOpen className="h-5 w-5" />
											</div>
											<div>
												<h4 className="text-foreground font-bold">Documentação Interativa</h4>
												<p className="text-sm text-muted-foreground">
													Acesse <code className="text-primary text-xs">/api/docs</code> no servidor backend para abrir o console Swagger UI. Todos os schemas e tipos de campos estão documentados.
												</p>
											</div>
										</div>

										<div className="flex gap-4">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/50 text-accent-foreground">
												<PlayCircle className="h-5 w-5" />
											</div>
											<div>
												<h4 className="text-foreground font-bold">Teste &quot;Try It Out&quot;</h4>
												<p className="text-sm text-muted-foreground">
													Cole sua API Key gerada na autenticação global do Swagger e teste os envios diretamente da página da documentação, sem escrever nenhuma linha de código.
												</p>
											</div>
										</div>
									</div>

									{/* Simulated Swagger screen */}
									<Card className="bg-background border-border overflow-hidden shadow-sm max-w-md mx-auto w-full">
										<div className="bg-muted border-b border-border p-3 flex items-center justify-between text-xs">
											<div className="flex items-center gap-1.5">
												<span className="h-2.5 w-2.5 rounded-full bg-destructive inline-block"></span>
												<span className="h-2.5 w-2.5 rounded-full bg-warning inline-block"></span>
												<span className="h-2.5 w-2.5 rounded-full bg-success inline-block"></span>
											</div>
											<span className="text-[10px] text-muted-foreground font-mono">http://localhost:1350/api/docs</span>
											<span className="h-4 w-4"></span>
										</div>
										<div className="p-4 space-y-3 font-sans text-xs">
											<div className="flex items-center justify-between pb-2 border-b border-border">
												<div>
													<span className="font-bold text-sm text-foreground">Hermes API Docs</span>
													<span className="text-[10px] text-muted-foreground block">v1.0.0 — OAS 3.0</span>
												</div>
												<Badge className="bg-success/20 text-success border border-success/30">Authorize</Badge>
											</div>

											{/* Simulated Swagger Endpoints */}
											<div className="space-y-2">
												<div className="bg-success/10 border border-success/20 rounded-md p-2 flex items-center gap-3">
													<Badge className="bg-success text-success-foreground hover:bg-success text-[9px] px-1 h-5 cursor-default">POST</Badge>
													<span className="font-mono text-foreground font-semibold text-[10px]">/api/emails</span>
													<span className="text-muted-foreground ml-auto">Disparar e-mail individual</span>
												</div>
												<div className="bg-success/10 border border-success/20 rounded-md p-2 flex items-center gap-3">
													<Badge className="bg-success text-success-foreground hover:bg-success text-[9px] px-1 h-5 cursor-default">POST</Badge>
													<span className="font-mono text-foreground font-semibold text-[10px]">/api/emails/bulk</span>
													<span className="text-muted-foreground ml-auto">Disparar e-mails em lote</span>
												</div>
												<div className="bg-primary/10 border border-primary/20 rounded-md p-2 flex items-center gap-3 opacity-60">
													<Badge className="bg-primary text-primary-foreground hover:bg-primary text-[9px] px-1 h-5 cursor-default">GET</Badge>
													<span className="font-mono text-foreground font-semibold text-[10px]">/api/services</span>
													<span className="text-muted-foreground ml-auto">Listar serviços</span>
												</div>
											</div>
										</div>
									</Card>
								</div>
							</div>
						)}
					</div>

					{/* Navigation actions */}
					<div className="flex items-center justify-between mt-6 bg-card border border-border rounded-2xl p-4">
						<Button
							variant="outline"
							onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
							disabled={currentStep === 0}
							className="disabled:opacity-40 cursor-pointer"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Anterior
						</Button>

						<div className="text-xs text-muted-foreground font-medium">
							Passo {currentStep + 1} de {steps.length}
						</div>

						{currentStep < steps.length - 1 ? (
							<Button
								onClick={() => setCurrentStep(currentStep + 1)}
								className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
							>
								Próximo
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						) : (
							<Link href="/auth/sign-up">
								<Button className="bg-gradient-to-r from-primary to-blue-400 hover:from-primary/90 hover:to-blue-400/90 text-primary-foreground cursor-pointer">
									Começar Agora
									<ChevronRight className="ml-1 h-4 w-4" />
								</Button>
							</Link>
						)}
					</div>
				</main>
			</div>
		</div>
	);
}
