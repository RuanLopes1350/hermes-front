'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/src/lib/auth-client';
import { apiFetch } from '@/src/lib/api';
import { useToast } from '@/src/hooks/use-toast';
import {
	Mail,
	Shield,
	Save,
	Send,
	CheckCircle2,
	AlertCircle,
	Loader2,
	Server,
	Lock,
	ExternalLink,
	RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { Checkbox } from '@/src/components/ui/checkbox';

export default function SettingsPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { toast } = useToast();
	const { data: session, isPending: isSessionLoading } = authClient.useSession();
	const userRole = (session?.user as any)?.role;

	const [activeTab, setActiveTab] = useState<'mail' | 'security'>('mail');
	const [loading, setLoading] = useState(true);
	const [savingMail, setSavingMail] = useState(false);
	const [savingSecurity, setSavingSecurity] = useState(false);
	const [testingMail, setTestingMail] = useState(false);
	const [testEmailAddress, setTestEmailAddress] = useState('');

	// Formulário de E-mail
	const [mailConfig, setMailConfig] = useState({
		provider: 'smtp' as 'smtp' | 'google_oauth2',
		fromName: 'Hermes Gateway',
		fromEmail: '',
		smtpHost: '',
		smtpPort: 587,
		smtpSecure: false,
		login: '',
		passkey: '',
		hasPasskey: false,
		clientId: '',
		clientSecret: '',
		hasClientSecret: false,
		hasRefreshToken: false,
		isConfigured: false,
		lastTestedAt: null as string | null,
	});

	// Formulário de Segurança
	const [securityConfig, setSecurityConfig] = useState({
		resetTokenExpiresInMinutes: 60,
		allowPublicSignUp: true,
	});

	// Redireciona se não for super_admin
	useEffect(() => {
		if (!isSessionLoading && userRole && userRole !== 'super_admin') {
			router.push('/system/dashboard');
		}
	}, [isSessionLoading, userRole, router]);

	// Feedback de retorno do Google OAuth2
	useEffect(() => {
		if (searchParams.get('auth') === 'success') {
			toast({
				title: 'Conta Google Conectada!',
				description: 'O token OAuth2 do e-mail do sistema foi vinculado com sucesso.',
			});
			router.replace('/system/settings');
		}
	}, [searchParams, router, toast]);

	// Carrega as configurações da API
	const loadSettings = async () => {
		try {
			setLoading(true);
			const res = await apiFetch('/api/settings');
			if (!res.ok) throw new Error('Não foi possível carregar as configurações.');

			const json = await res.json();
			const data = json.data;

			if (data.mail) {
				setMailConfig((prev) => ({
					...prev,
					...data.mail,
					passkey: '', // Senhas nunca voltam abertas
					clientSecret: '',
				}));
				setTestEmailAddress(data.mail.fromEmail || '');
			}
			if (data.security) {
				setSecurityConfig(data.security);
			}
		} catch (error: any) {
			toast({
				variant: 'destructive',
				title: 'Erro ao carregar',
				description: error.message,
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (userRole === 'super_admin') {
			loadSettings();
		}
	}, [userRole]);

	// Salva Configuração de E-mail
	const handleSaveMail = async (e: React.FormEvent) => {
		e.preventDefault();
		setSavingMail(true);
		try {
			const payload: any = {
				provider: mailConfig.provider,
				fromName: mailConfig.fromName,
				fromEmail: mailConfig.fromEmail,
			};

			if (mailConfig.provider === 'smtp') {
				payload.smtpHost = mailConfig.smtpHost;
				payload.smtpPort = Number(mailConfig.smtpPort);
				payload.smtpSecure = mailConfig.smtpSecure;
				payload.login = mailConfig.login;
				if (mailConfig.passkey) payload.passkey = mailConfig.passkey;
			} else {
				if (mailConfig.clientId) payload.clientId = mailConfig.clientId;
				if (mailConfig.clientSecret) payload.clientSecret = mailConfig.clientSecret;
			}

			const res = await apiFetch('/api/settings/mail', {
				method: 'PUT',
				body: JSON.stringify(payload),
			});

			const json = await res.json();
			if (!res.ok) throw new Error(json.message || 'Falha ao salvar.');

			toast({ title: 'Sucesso', description: 'Configurações de e-mail atualizadas!' });
			await loadSettings();
		} catch (error: any) {
			toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
		} finally {
			setSavingMail(false);
		}
	};

	// Dispara o fluxo OAuth2 do Google
	const handleConnectGoogle = async () => {
		try {
			const res = await apiFetch('/api/settings/mail/google-auth-url');
			const json = await res.json();
			if (!res.ok) throw new Error(json.message || 'Falha ao gerar URL de autorização.');
			window.location.href = json.data.url;
		} catch (error: any) {
			toast({ variant: 'destructive', title: 'Erro OAuth2', description: error.message });
		}
	};

	// Envia E-mail de Teste
	const handleSendTestEmail = async () => {
		if (!testEmailAddress) {
			toast({ variant: 'destructive', title: 'Erro', description: 'Informe um e-mail para o teste.' });
			return;
		}
		setTestingMail(true);
		try {
			const res = await apiFetch('/api/settings/mail/test', {
				method: 'POST',
				body: JSON.stringify({ toEmail: testEmailAddress }),
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.message || 'Falha ao enviar e-mail de teste.');

			toast({ title: 'Sucesso!', description: json.message });
			await loadSettings();
		} catch (error: any) {
			toast({ variant: 'destructive', title: 'Falha no Envio de Teste', description: error.message });
		} finally {
			setTestingMail(false);
		}
	};

	// Salva Configuração de Segurança
	const handleSaveSecurity = async (e: React.FormEvent) => {
		e.preventDefault();
		setSavingSecurity(true);
		try {
			const res = await apiFetch('/api/settings/security', {
				method: 'PUT',
				body: JSON.stringify(securityConfig),
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.message || 'Falha ao salvar.');

			toast({ title: 'Sucesso', description: 'Configurações de segurança atualizadas!' });
			await loadSettings();
		} catch (error: any) {
			toast({ variant: 'destructive', title: 'Erro', description: error.message });
		} finally {
			setSavingSecurity(false);
		}
	};

	if (isSessionLoading || loading) {
		return (
			<div className="flex h-96 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
			{/* Cabeçalho da Página */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Gerencie o provedor de e-mail institucional e as regras de segurança da plataforma.
					</p>
				</div>
				<Badge variant="outline" className="w-fit px-3 py-1 bg-primary/5 text-primary border-primary/20">
					Exclusivo Super Admin
				</Badge>
			</div>

			{/* Navegação por Abas */}
			<div className="flex space-x-2 border-b border-border/60 pb-2">
				<Button
					type="button"
					variant={activeTab === 'mail' ? 'default' : 'ghost'}
					onClick={() => setActiveTab('mail')}
					className="flex items-center gap-2 cursor-pointer"
				>
					<Mail className="h-4 w-4" />
					E-mail do Sistema
				</Button>
				<Button
					type="button"
					variant={activeTab === 'security' ? 'default' : 'ghost'}
					onClick={() => setActiveTab('security')}
					className="flex items-center gap-2 cursor-pointer"
				>
					<Shield className="h-4 w-4" />
					Segurança e Sessões
				</Button>
			</div>

			{/* ABA 1: E-MAIL DO SISTEMA */}
			{activeTab === 'mail' && (
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="text-xl flex items-center gap-2">
										<Server className="h-5 w-5 text-primary" />
										Provedor de E-mails do Sistema
									</CardTitle>
									<CardDescription>
										Esta credencial é usada exclusivamente pelo Hermes para enviar links de reset de senha e alertas internos.
									</CardDescription>
								</div>
								{mailConfig.isConfigured ? (
									<Badge className="bg-success/15 text-success border-success/30 flex items-center gap-1.5 py-1 px-3">
										<CheckCircle2 className="h-3.5 w-3.5" /> Ativo e Configurado
									</Badge>
								) : (
									<Badge variant="destructive" className="flex items-center gap-1.5 py-1 px-3">
										<AlertCircle className="h-3.5 w-3.5" /> Não Configurado
									</Badge>
								)}
							</div>
						</CardHeader>

						<CardContent>
							<form onSubmit={handleSaveMail} className="space-y-6">
								{/* Seletor de Modo: SMTP vs OAuth2 */}
								<div className="grid grid-cols-2 gap-3 p-1.5 bg-muted/60 rounded-lg max-w-md">
									<button
										type="button"
										onClick={() => setMailConfig({ ...mailConfig, provider: 'smtp' })}
										className={`py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
											mailConfig.provider === 'smtp'
												? 'bg-background shadow-sm text-foreground'
												: 'text-muted-foreground hover:text-foreground'
										}`}
									>
										SMTP Padrão
									</button>
									<button
										type="button"
										onClick={() => setMailConfig({ ...mailConfig, provider: 'google_oauth2' })}
										className={`py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
											mailConfig.provider === 'google_oauth2'
												? 'bg-background shadow-sm text-foreground'
												: 'text-muted-foreground hover:text-foreground'
										}`}
									>
										Google OAuth2 (Gmail)
									</button>
								</div>

								{/* Informações Gerais do Remetente */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
									<div className="space-y-1.5">
										<label className="text-sm font-medium">Nome do Remetente (From Name)</label>
										<Input
											value={mailConfig.fromName}
											onChange={(e) => setMailConfig({ ...mailConfig, fromName: e.target.value })}
											placeholder="Hermes Gateway"
											required
										/>
									</div>
									<div className="space-y-1.5">
										<label className="text-sm font-medium">E-mail do Remetente (From Email)</label>
										<Input
											type="email"
											value={mailConfig.fromEmail}
											onChange={(e) => setMailConfig({ ...mailConfig, fromEmail: e.target.value })}
											placeholder="suporte@hermes.com"
											required
										/>
									</div>
								</div>

								{/* MODO 1: SMTP TRADICIONAL */}
								{mailConfig.provider === 'smtp' && (
									<div className="space-y-4 border-t pt-4">
										<h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
											<Lock className="h-4 w-4 text-muted-foreground" /> Parâmetros do Servidor SMTP
										</h4>

										<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
											<div className="sm:col-span-2 space-y-1.5">
												<label className="text-sm font-medium">Host SMTP</label>
												<Input
													value={mailConfig.smtpHost}
													onChange={(e) => setMailConfig({ ...mailConfig, smtpHost: e.target.value })}
													placeholder="smtp.empresa.com"
													required
												/>
											</div>
											<div className="space-y-1.5">
												<label className="text-sm font-medium">Porta</label>
												<Input
													type="number"
													value={mailConfig.smtpPort}
													onChange={(e) => setMailConfig({ ...mailConfig, smtpPort: Number(e.target.value) })}
													placeholder="587"
													required
												/>
											</div>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div className="space-y-1.5">
												<label className="text-sm font-medium">Usuário / Login SMTP</label>
												<Input
													value={mailConfig.login}
													onChange={(e) => setMailConfig({ ...mailConfig, login: e.target.value })}
													placeholder="usuario_smtp"
													required
												/>
											</div>
											<div className="space-y-1.5">
												<label className="text-sm font-medium">
													Senha SMTP {mailConfig.hasPasskey && <span className="text-xs text-muted-foreground font-normal">(deixe em branco para manter a atual)</span>}
												</label>
												<Input
													type="password"
													value={mailConfig.passkey}
													onChange={(e) => setMailConfig({ ...mailConfig, passkey: e.target.value })}
													placeholder={mailConfig.hasPasskey ? '•••••••• (salva)' : 'Digite a senha SMTP'}
													required={!mailConfig.hasPasskey}
												/>
											</div>
										</div>

										<div className="flex items-center space-x-2 pt-1">
											<Checkbox
												id="smtpSecure"
												checked={mailConfig.smtpSecure}
												onCheckedChange={(checked) => setMailConfig({ ...mailConfig, smtpSecure: !!checked })}
											/>
											<label htmlFor="smtpSecure" className="text-sm text-muted-foreground cursor-pointer">
												Usar Conexão Segura SSL/TLS (marque para portas 465, desmarque para STARTTLS 587)
											</label>
										</div>
									</div>
								)}

								{/* MODO 2: GOOGLE OAUTH2 */}
								{mailConfig.provider === 'google_oauth2' && (
									<div className="space-y-4 border-t pt-4">
										<h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
											<Lock className="h-4 w-4 text-muted-foreground" /> Credenciais Google Cloud Console
										</h4>
										<p className="text-xs text-muted-foreground">
											Se os campos abaixo forem deixados em branco, o sistema usará as variáveis de ambiente globais (<code className="bg-muted px-1 py-0.5 rounded">GOOGLE_CLIENT_ID</code>).
										</p>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div className="space-y-1.5">
												<label className="text-sm font-medium">Client ID</label>
												<Input
													value={mailConfig.clientId}
													onChange={(e) => setMailConfig({ ...mailConfig, clientId: e.target.value })}
													placeholder="exemplo.apps.googleusercontent.com"
												/>
											</div>
											<div className="space-y-1.5">
												<label className="text-sm font-medium">
													Client Secret {mailConfig.hasClientSecret && <span className="text-xs text-muted-foreground font-normal">(salvo)</span>}
												</label>
												<Input
													type="password"
													value={mailConfig.clientSecret}
													onChange={(e) => setMailConfig({ ...mailConfig, clientSecret: e.target.value })}
													placeholder={mailConfig.hasClientSecret ? '•••••••• (salvo)' : 'Client Secret do Google'}
												/>
											</div>
										</div>

										<div className="p-4 bg-muted/40 rounded-lg border space-y-3">
											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<p className="text-sm font-semibold">Vínculo com a Conta Google</p>
													<p className="text-xs text-muted-foreground">
														{mailConfig.hasRefreshToken
															? 'Conta vinculada com sucesso! O token de atualização está salvo.'
															: 'Você precisa autorizar o Hermes a enviar e-mails via Google OAuth2.'}
													</p>
												</div>
												<Button
													type="button"
													variant={mailConfig.hasRefreshToken ? 'outline' : 'default'}
													onClick={handleConnectGoogle}
													className="gap-2 cursor-pointer shrink-0"
												>
													<ExternalLink className="h-4 w-4" />
													{mailConfig.hasRefreshToken ? 'Reconectar Google' : 'Conectar Conta Google'}
												</Button>
											</div>
										</div>
									</div>
								)}

								<Button type="submit" disabled={savingMail} className="w-full sm:w-auto cursor-pointer gap-2">
									{savingMail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
									Salvar Configurações de E-mail
								</Button>
							</form>
						</CardContent>
					</Card>

					{/* CARD DE TESTE DE ENVIO */}
					<Card className="border-dashed">
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<Send className="h-4 w-4 text-primary" /> Testar Envio em Tempo Real
							</CardTitle>
							<CardDescription>
								Dispare um e-mail de teste para garantir que o remetente está autenticado e as portas liberadas.
								{mailConfig.lastTestedAt && (
									<span className="block mt-1 text-xs text-success font-medium">
										Último teste bem-sucedido: {new Date(mailConfig.lastTestedAt).toLocaleString('pt-BR')}
									</span>
								)}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col sm:flex-row gap-3 max-w-lg">
								<Input
									type="email"
									placeholder="seu-email@teste.com"
									value={testEmailAddress}
									onChange={(e) => setTestEmailAddress(e.target.value)}
									disabled={testingMail || !mailConfig.isConfigured}
								/>
								<Button
									type="button"
									onClick={handleSendTestEmail}
									disabled={testingMail || !mailConfig.isConfigured}
									variant="secondary"
									className="cursor-pointer gap-2 shrink-0"
								>
									{testingMail ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" /> Testando...
										</>
									) : (
										<>
											<Send className="h-4 w-4" /> Enviar Teste
										</>
									)}
								</Button>
							</div>
							{!mailConfig.isConfigured && (
								<p className="text-xs text-destructive mt-2">
									Configure e salve a credencial acima antes de realizar o teste.
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			)}

			{/* ABA 2: SEGURANÇA E SESSÕES */}
			{activeTab === 'security' && (
				<Card>
					<CardHeader>
						<CardTitle className="text-xl flex items-center gap-2">
							<Shield className="h-5 w-5 text-primary" /> Parâmetros de Segurança da Plataforma
						</CardTitle>
						<CardDescription>
							Controle as regras de expiração de tokens e políticas de entrada na aplicação.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSaveSecurity} className="space-y-6">
							<div className="space-y-1.5 max-w-md">
								<label className="text-sm font-medium">Validade do Link de Reset de Senha (minutos)</label>
								<Input
									type="number"
									min={5}
									max={10080}
									value={securityConfig.resetTokenExpiresInMinutes}
									onChange={(e) =>
										setSecurityConfig({
											...securityConfig,
											resetTokenExpiresInMinutes: Number(e.target.value),
										})
									}
									required
								/>
								<p className="text-xs text-muted-foreground">
									Tempo limite em minutos para o usuário utilizar o link recebido no e-mail (Padrão: 60 minutos).
								</p>
							</div>

							<div className="pt-4 border-t space-y-3">
								<div className="flex items-start space-x-3">
									<Checkbox
										id="allowSignUp"
										checked={securityConfig.allowPublicSignUp}
										onCheckedChange={(checked) =>
											setSecurityConfig({ ...securityConfig, allowPublicSignUp: !!checked })
										}
										className="mt-1"
									/>
									<div className="space-y-0.5 cursor-pointer">
										<label htmlFor="allowSignUp" className="text-sm font-medium cursor-pointer">
											Permitir Cadastro Público de Usuários
										</label>
										<p className="text-xs text-muted-foreground">
											Se desativado, o formulário de cadastro na tela de login será bloqueado, permitindo que apenas administradores criem novas contas.
										</p>
									</div>
								</div>
							</div>

							<Button type="submit" disabled={savingSecurity} className="cursor-pointer gap-2">
								{savingSecurity ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
								Salvar Configurações de Segurança
							</Button>
						</form>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
