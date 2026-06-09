'use client';

import {
	ArrowLeft,
	Settings,
	Copy,
	Trash2,
	Loader2,
	CheckCircle2,
	Shield,
	Check,
	AlertCircle,
	KeyRound,
	Plus,
	Settings2,
} from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/src/lib/api';
import { useToast } from '@/src/hooks/use-toast';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/src/components/ui/dialog';
import { Badge } from '@/src/components/ui/badge';
import { ConfirmModal } from '@/src/components/ui/confirm-modal';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/src/components/ui/select';

export default function ServiceDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();

	const [service, setService] = useState<any>(null);
	const [apiKeys, setApiKeys] = useState<any[]>([]);
	const [credentials, setCredentials] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const [editName, setEditName] = useState('');
	const [editSettings, setEditSettings] = useState<any>({});

	// Modals
	const [showConnModal, setShowConnModal] = useState(false);
	const [selectedType, setSelectedType] = useState<'plain' | 'oauth2' | null>(null);
	const [formData, setFormData] = useState({
		name: '', login: '', smtpHost: '', smtpPort: '', smtpSecure: true, passkey: '', clientId: '', clientSecret: '',
	});
	const [generatedKey, setGeneratedKey] = useState<any>(null);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [copied, setCopied] = useState(false);

	const [showDeleteCredModal, setShowDeleteCredModal] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<any>(null);

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			const [svcRes, keysRes, credsRes] = await Promise.all([
				apiFetch(`/api/services/${params.id}`),
				apiFetch(`/api/services/${params.id}/api-keys`),
				apiFetch(`/api/services/${params.id}/credentials`),
			]);

			const svcData = await svcRes.json();
			const keysData = await keysRes.json();
			const credsData = await credsRes.json();

			if (!svcRes.ok) throw new Error(svcData.message);

			setService(svcData.data);
			setEditName(svcData.data.name);
			setEditSettings(svcData.data.settings || {});
			setApiKeys(keysData.data || []);
			setCredentials(credsData.data || []);
		} catch (error: any) {
			toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar detalhes do serviço.' });
		} finally {
			setLoading(false);
		}
	}, [params.id, toast]);

	useEffect(() => {
		if (params.id) fetchData();
	}, [params.id, fetchData]);

	const unifiedConnections = useMemo(() => {
		return credentials.map((cred) => {
			const key = apiKeys.find((k) => k.credential_id === cred.id);
			return { ...cred, key };
		});
	}, [credentials, apiKeys]);

	const handleAuthorizeGoogle = (credId: string) => {
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
		window.location.href = `${apiUrl}/api/services/${params.id}/credentials/${credId}/authorize`;
	};

	const handleSaveService = async () => {
		setSaving(true);
		try {
			const response = await apiFetch(`/api/services/${params.id}`, {
				method: 'PATCH',
				body: JSON.stringify({ name: editName, settings: editSettings }),
			});
			if (!response.ok) throw new Error();
			toast({ title: 'Sucesso', description: 'Serviço atualizado.' });
		} catch {
			toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao salvar.' });
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteService = async () => {
		try {
			const res = await apiFetch(`/api/services/${params.id}`, { method: 'DELETE' });
			if (res.ok) router.push('/system/services');
		} catch {}
	};

	const handleCreateConnection = async () => {
		if (!selectedType || !formData.name) return;
		setSubmitting(true);
		setError('');
		try {
			const response = await apiFetch(`/api/services/${params.id}/credentials`, {
				method: 'POST',
				body: JSON.stringify({ ...formData, authType: selectedType }),
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.message);
			setGeneratedKey(result.data.initial_api_key);
			fetchData();
		} catch (error: any) {
			setError(error.message || 'Erro ao criar conexão');
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteConnection = async () => {
		if (!itemToDelete) return;
		try {
			const response = await apiFetch(`/api/services/${params.id}/credentials/${itemToDelete.id}`, { method: 'DELETE' });
			if (!response.ok) throw new Error();
			toast({ title: 'Sucesso', description: 'Conexão removida.' });
			fetchData();
		} catch {
			toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao remover.' });
		} finally {
			setItemToDelete(null);
			setShowDeleteCredModal(false);
		}
	};

	const closeModal = () => {
		setShowConnModal(false);
		setSelectedType(null);
		setGeneratedKey(null);
		setError('');
		setFormData({ name: '', login: '', smtpHost: '', smtpPort: '', smtpSecure: true, passkey: '', clientId: '', clientSecret: '' });
	};

	if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

	return (
		<div className="space-y-6 animate-in fade-in duration-500 pb-20">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild className="cursor-pointer">
						<Link href="/system/services"><ArrowLeft className="h-4 w-4" /></Link>
					</Button>
					<div>
						<div className="flex items-center gap-2">
							<h2 className="text-2xl font-bold tracking-tight">{service?.name}</h2>
							<Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Ativo</Badge>
						</div>
						<p className="text-sm text-muted-foreground font-mono">ID: {service?.id}</p>
					</div>
				</div>
				<Button variant="destructive" onClick={() => setShowDeleteModal(true)} className="cursor-pointer">
					<Trash2 className="mr-2 h-4 w-4" /> Excluir Projeto
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Configurações do Projeto</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid gap-2">
								<label className="text-sm font-medium">Nome do Projeto</label>
								<Input value={editName} onChange={e => setEditName(e.target.value)} />
							</div>

							<div className="grid gap-2">
								<label className="text-sm font-medium">Cópia Oculta (BCC) de Auditoria</label>
								<p className="text-xs text-muted-foreground">Se preenchido, todos os e-mails enviados por este serviço enviarão uma cópia oculta para este endereço.</p>
								<Input 
									placeholder="ex: auditoria@empresa.com" 
									value={editSettings?.auditBccEmail || ''} 
									onChange={e => setEditSettings({ ...editSettings, auditBccEmail: e.target.value })} 
								/>
							</div>

							{/* <div className="border-t pt-4">
								<h3 className="font-semibold mb-2 flex items-center gap-2"><KeyRound className="h-4 w-4" /> Rotação de Chaves e Webhooks</h3>
								
								<div className="space-y-4">
									<div className="flex items-center gap-2">
										<input 
											type="checkbox" 
											id="autoRotate"
											className="h-4 w-4 rounded border-gray-300"
											checked={editSettings?.security?.auto_rotate || false}
											onChange={e => setEditSettings({
												...editSettings, 
												security: { ...editSettings?.security, auto_rotate: e.target.checked }
											})}
										/>
										<label htmlFor="autoRotate" className="text-sm font-medium cursor-pointer">
											Ativar Rotação Automática de API Keys
										</label>
									</div>

									<div className="grid gap-2">
										<label className="text-sm font-medium">Dias de antecedência para rotacionar (Threshold)</label>
										<p className="text-xs text-muted-foreground">Quantos dias antes do vencimento a rotação deve ocorrer.</p>
										<Input 
											type="number"
											placeholder="ex: 3"
											value={editSettings?.security?.rotate_threshold_days || ''}
											onChange={e => setEditSettings({
												...editSettings, 
												security: { ...editSettings?.security, rotate_threshold_days: Number(e.target.value) }
											})}
										/>
									</div>

									<div className="grid gap-2">
										<label className="text-sm font-medium">Intervalo de Validade da Chave (Dias)</label>
										<p className="text-xs text-muted-foreground">Nova chave expira após esse período. Padrões: 30, 60, ou 90 dias.</p>
										<Select 
											value={String(editSettings?.security?.rotation_interval_days || 'none')} 
											onValueChange={(val) => setEditSettings({
												...editSettings, 
												security: { ...editSettings?.security, rotation_interval_days: val === 'none' ? null : Number(val) }
											})}
										>
											<SelectTrigger>
												<SelectValue placeholder="Selecione o intervalo de expiração" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="none">Sem Expiração (Infinita)</SelectItem>
												<SelectItem value="30">30 dias (Alta Segurança)</SelectItem>
												<SelectItem value="60">60 dias (Padrão/Recomendado)</SelectItem>
												<SelectItem value="90">90 dias (PCI/Compliance)</SelectItem>
												<SelectItem value="180">180 dias (Sistemas Internos)</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="grid gap-2">
										<label className="text-sm font-medium">URL do Webhook</label>
										<p className="text-xs text-muted-foreground">Endpoint que receberá o POST quando uma chave for rotacionada ou expirar.</p>
										<Input 
											placeholder="https://api.empresa.com/hermes-webhook" 
											value={editSettings?.notifications?.webhook_url || ''} 
											onChange={e => setEditSettings({
												...editSettings, 
												notifications: { ...editSettings?.notifications, webhook_url: e.target.value }
											})} 
										/>
									</div>

									<div className="grid gap-2">
										<label className="text-sm font-medium">Segredo do Webhook (HMAC SHA-256)</label>
										<p className="text-xs text-muted-foreground">Usado para assinar o header X-Hermes-Signature.</p>
										<Input 
											placeholder="ex: super_secret_123" 
											value={editSettings?.notifications?.webhook_secret || ''} 
											onChange={e => setEditSettings({
												...editSettings, 
												notifications: { ...editSettings?.notifications, webhook_secret: e.target.value }
											})} 
										/>
									</div>
								</div>
							</div> */}

							<Button onClick={handleSaveService} disabled={saving || !editName.trim()} className="cursor-pointer">
								{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar Configurações
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-4">
							<div>
								<CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Credenciais de Disparo</CardTitle>
								<CardDescription>Conexões e chaves de API vinculadas a este projeto.</CardDescription>
							</div>
							<Button onClick={() => setShowConnModal(true)} className="cursor-pointer">
								<Plus className="mr-2 h-4 w-4" /> Nova Conexão
							</Button>
						</CardHeader>
						<CardContent className="space-y-4">
							{unifiedConnections.length === 0 ? (
								<div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
									Nenhuma credencial configurada.
								</div>
							) : (
								unifiedConnections.map(conn => (
									<div key={conn.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors gap-4">
										<div className="flex items-center gap-4">
											<div className="p-3 bg-secondary rounded-md">
												{conn.auth_type === 'oauth2' ? <FaGoogle className="h-5 w-5" /> : <Settings2 className="h-5 w-5" />}
											</div>
											<div>
												<div className="flex items-center gap-2">
													<p className="font-semibold">{conn.name}</p>
													{conn.auth_type === 'oauth2' && !conn.refresh_token ? (
														<Badge variant="destructive" className="cursor-pointer" onClick={() => handleAuthorizeGoogle(conn.id)}>
															<AlertCircle className="mr-1 h-3 w-3" /> Requer Autorização
														</Badge>
													) : (
														<Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
															<Check className="mr-1 h-3 w-3" /> Pronto
														</Badge>
													)}
												</div>
												<p className="text-sm text-muted-foreground">{conn.login}</p>
											</div>
										</div>
										<div className="flex flex-col items-end gap-2 w-full sm:w-auto">
											<div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md w-full sm:w-auto">
												<KeyRound className="h-4 w-4 text-primary" />
												<code className="text-sm font-mono flex-1">
													{conn.key ? `${conn.key.prefix}••••••••` : 'NÃO GERADA'}
												</code>
												<Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10 cursor-pointer" onClick={() => { setItemToDelete(conn); setShowDeleteCredModal(true); }}>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>
								))
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			<Dialog open={showConnModal} onOpenChange={(o) => !o && closeModal()}>
				<DialogContent className="sm:max-w-[600px]">
					{!generatedKey ? (
						<>
							<DialogHeader>
								<DialogTitle>Vincular Provedor de E-mail</DialogTitle>
								<DialogDescription>Escolha o tipo de autenticação que deseja configurar.</DialogDescription>
							</DialogHeader>

							<div className="py-4">
								{error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">{error}</div>}

								{!selectedType ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div onClick={() => setSelectedType('plain')} className="border rounded-lg p-4 cursor-pointer hover:border-primary text-center">
											<Settings2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
											<h4 className="font-semibold">SMTP Padrão</h4>
											<p className="text-xs text-muted-foreground mt-1">Usuário e senha convencionais (App Password)</p>
										</div>
										<div onClick={() => setSelectedType('oauth2')} className="border rounded-lg p-4 cursor-pointer hover:border-primary text-center">
											<FaGoogle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
											<h4 className="font-semibold">Google OAuth2</h4>
											<p className="text-xs text-muted-foreground mt-1">Autorização segura para Gmail/Workspace</p>
										</div>
									</div>
								) : (
									<div className="space-y-4">
										<Button variant="link" onClick={() => setSelectedType(null)} className="px-0 h-auto cursor-pointer">← Voltar</Button>
										
										<div className="grid gap-2">
											<label className="text-sm font-medium">Nome da Identificação</label>
											<Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Suporte" />
										</div>
										<div className="grid gap-2">
											<label className="text-sm font-medium">E-mail Remetente</label>
											<Input value={formData.login} onChange={e => setFormData({ ...formData, login: e.target.value })} placeholder="contato@empresa.com" />
										</div>

										{selectedType === 'plain' ? (
											<div className="space-y-4">
												<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
													<div className="col-span-2 grid gap-2">
														<label className="text-sm font-medium">Host SMTP</label>
														<Input value={formData.smtpHost} onChange={e => setFormData({ ...formData, smtpHost: e.target.value })} placeholder="smtp.gmail.com" />
													</div>
													<div className="grid gap-2">
														<label className="text-sm font-medium">Porta</label>
														<Input value={formData.smtpPort} onChange={e => setFormData({ ...formData, smtpPort: e.target.value })} placeholder="465" />
													</div>
												</div>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
													<div className="grid gap-2">
														<label className="text-sm font-medium">Criptografia</label>
														<Select value={formData.smtpSecure ? 'ssl' : 'tls'} onValueChange={v => setFormData({ ...formData, smtpSecure: v === 'ssl' })}>
															<SelectTrigger><SelectValue/></SelectTrigger>
															<SelectContent>
																<SelectItem value="ssl">SSL (465)</SelectItem>
																<SelectItem value="tls">STARTTLS (587)</SelectItem>
															</SelectContent>
														</Select>
													</div>
													<div className="grid gap-2">
														<label className="text-sm font-medium">Senha / App Password</label>
														<Input type="password" value={formData.passkey} onChange={e => setFormData({ ...formData, passkey: e.target.value })} placeholder="••••••••" />
													</div>
												</div>
											</div>
										) : (
											<div className="bg-muted p-4 rounded-md text-sm">
												<p className="font-semibold mb-1">Integração simplificada Google</p>
												<p className="text-muted-foreground">Após salvar, você precisará autorizar o acesso à sua conta Google clicando no selo "Requer Autorização".</p>
											</div>
										)}
									</div>
								)}
							</div>
							{selectedType && (
								<DialogFooter>
									<Button variant="outline" onClick={closeModal} className="cursor-pointer">Cancelar</Button>
									<Button onClick={handleCreateConnection} disabled={submitting || !formData.name} className="cursor-pointer">
										{submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Conexão'}
									</Button>
								</DialogFooter>
							)}
						</>
					) : (
						<>
							<DialogHeader className="text-center pt-6">
								<div className="mx-auto bg-green-100 text-green-600 h-16 w-16 rounded-full flex items-center justify-center mb-4">
									<CheckCircle2 className="h-8 w-8" />
								</div>
								<DialogTitle className="text-2xl">Conexão Estabelecida</DialogTitle>
								<DialogDescription>A API Key abaixo é exclusiva deste remetente.</DialogDescription>
							</DialogHeader>
							<div className="py-6 px-4">
								<div className="bg-slate-100 p-4 rounded-lg">
									<p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Token de Acesso (API Key)</p>
									<code className="text-sm break-all text-slate-900">{generatedKey.token}</code>
								</div>
								<div className="flex justify-end mt-3">
									<Button
										size="sm"
										className="cursor-pointer"
										onClick={() => {
											navigator.clipboard.writeText(generatedKey.token);
											setCopied(true);
											setTimeout(() => setCopied(false), 2000);
										}}
									>
										{copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
										{copied ? 'Copiado' : 'Copiar'}
									</Button>
								</div>
								<p className="text-sm text-red-500 mt-4 text-center font-medium">Salve este token agora! Ele não será exibido novamente.</p>
							</div>
							<DialogFooter className="pb-6">
								<Button className="w-full cursor-pointer" onClick={closeModal}>Entendi, concluir</Button>
							</DialogFooter>
						</>
					)}
				</DialogContent>
			</Dialog>

			<ConfirmModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleDeleteService}
				variant="danger"
				title="Excluir Projeto"
				description={`Isto removerá permanentemente o projeto "${service?.name}" e todas as suas configurações.`}
			/>

			<ConfirmModal
				isOpen={showDeleteCredModal}
				onClose={() => setShowDeleteCredModal(false)}
				onConfirm={handleDeleteConnection}
				variant="danger"
				title="Remover Conexão"
				description={`Tem certeza que deseja apagar a conexão "${itemToDelete?.name}"? A API Key vinculada perderá o acesso imediatamente.`}
			/>
		</div>
	);
}
