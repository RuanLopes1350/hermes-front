'use client';

import {
	ArrowLeft,
	Settings,
	Code,
	Copy,
	Save,
	Trash2,
	RefreshCw,
	Loader2,
	CheckCircle2,
	Globe,
	Mail,
	Bell,
	KeyRound,
	Plus,
	Settings2,
	Shield,
	Check,
	AlertCircle,
	Key,
} from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/src/lib/api';
import { useToast } from '@/src/hooks/use-toast';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
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
import { CustomSelect } from '@/src/components/ui/custom-select';

interface ServiceSettings {
	timezone: string;
	defaultSenderName: string;
	replyTo: string;
	notifyOnFailure: boolean;
	defaultPriority: 'high' | 'medium' | 'low';
}

interface Service {
	id: string;
	name: string;
	settings: ServiceSettings | any;
	createdAt: string;
	updatedAt: string;
}

interface ApiKey {
	id: string;
	name: string;
	prefix: string;
	is_active: boolean;
	credential_id: string;
	createdAt: string;
}

interface Credential {
	id: string;
	name: string;
	auth_type: 'plain' | 'oauth2';
	login: string;
	smtp_host: string;
	refresh_token?: string | null;
}

const DEFAULT_SETTINGS: ServiceSettings = {
	timezone: 'America/Sao_Paulo',
	defaultSenderName: '',
	replyTo: '',
	notifyOnFailure: true,
	defaultPriority: 'medium',
};

export default function ServiceDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();

	const [service, setService] = useState<Service | null>(null);
	const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
	const [credentials, setCredentials] = useState<Credential[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	// Estados editáveis do serviço
	const [editName, setEditName] = useState('');
	const [editSettings, setEditSettings] = useState<ServiceSettings>(DEFAULT_SETTINGS);

	// Estados de Conexão Unificada
	const [showConnModal, setShowConnModal] = useState(false);
	const [selectedType, setSelectedType] = useState<'plain' | 'oauth2' | null>(null);
	const [formData, setFormData] = useState({
		name: '',
		login: '',
		smtpHost: '',
		smtpPort: '465',
		smtpSecure: true,
		passkey: '',
		clientId: '',
		clientSecret: '',
	});
	const [generatedKey, setGeneratedKey] = useState<any>(null);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [copied, setCopied] = useState(false);

	// Estado para exclusão unificada
	const [showDeleteCredModal, setShowDeleteCredModal] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

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

			if (!svcRes.ok) throw new Error(svcData.message || 'Erro ao carregar serviço.');

			setService(svcData.data);
			setEditName(svcData.data.name);
			setEditSettings({ ...DEFAULT_SETTINGS, ...(svcData.data.settings || {}) });
			setApiKeys(keysData.data || []);
			setCredentials(credsData.data || []);
		} catch (error: any) {
			toast({ variant: 'destructive', title: 'Erro', description: error.message });
		} finally {
			setLoading(false);
		}
	}, [params.id, toast]);

	useEffect(() => {
		if (params.id) fetchData();
	}, [params.id, fetchData]);

	// UNIFICAÇÃO REAL: Agrupa por Credencial
	const unifiedConnections = useMemo(() => {
		return credentials.map((cred) => {
			const key = apiKeys.find((k) => k.credential_id === cred.id);
			return { ...cred, key };
		});
	}, [credentials, apiKeys]);

	const handleSaveService = async () => {
		setSaving(true);
		try {
			const response = await apiFetch(`/api/services/${params.id}`, {
				method: 'PATCH',
				body: JSON.stringify({ name: editName, settings: editSettings }),
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.message);
			toast({ title: 'Sucesso', description: 'Configurações salvas.' });
			setService(result.data);
		} catch (error: any) {
			toast({ variant: 'destructive', title: 'Erro', description: error.message });
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteService = async () => {
		try {
			const response = await apiFetch(`/api/services/${params.id}`, { method: 'DELETE' });
			if (response.ok) router.push('/system/services');
		} catch (err) { }
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
			if (!response.ok) throw new Error(result.message || 'Erro ao criar conexão.');

			setGeneratedKey(result.data.initial_api_key);
			fetchData();
		} catch (error: any) {
			setError(error.message);
		} finally {
			setSubmitting(false);
		}
	};

	const confirmDeleteConnection = (id: string, name: string) => {
		setItemToDelete({ id, name });
		setShowDeleteCredModal(true);
	};

	const handleDeleteConnection = async () => {
		if (!itemToDelete) return;
		try {
			const response = await apiFetch(`/api/services/${params.id}/credentials/${itemToDelete.id}`, {
				method: 'DELETE',
			});
			if (!response.ok) throw new Error('Falha ao remover.');
			toast({ title: 'Removido com Sucesso' });
			fetchData();
		} catch (error: any) {
			toast({ variant: 'destructive', title: 'Erro', description: error.message });
		} finally {
			setItemToDelete(null);
			setShowDeleteCredModal(false);
		}
	};

	const copyToClipboard = (text: string, msg = 'Copiado!') => {
		navigator.clipboard.writeText(text);
		toast({ title: msg });
	};

	const closeModal = () => {
		setShowConnModal(false);
		setSelectedType(null);
		setGeneratedKey(null);
		setError('');
		setFormData({
			name: '',
			login: '',
			smtpHost: '',
			smtpPort: '465',
			smtpSecure: true,
			passkey: '',
			clientId: '',
			clientSecret: '',
		});
	};

	if (loading)
		return (
			<div className="h-screen flex items-center justify-center">
				<Loader2 className="animate-spin text-primary" size={48} />
			</div>
		);

	return (
		<div className="space-y-12 text-left pb-20">
			{/* Header */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-left">
				<div className="flex items-center gap-4 text-left">
					<Link href="/system/services">
						<Button
							variant="outline"
							size="icon"
							className="h-12 w-12 rounded-2xl bg-surface border-border-subtle hover:text-primary group cursor-pointer"
						>
							<ArrowLeft size={20} />
						</Button>
					</Link>
					<div className="text-left">
						<div className="flex items-center gap-3 mb-1 text-left">
							<h2 className="text-3xl font-bold uppercase text-foreground text-left">
								{service?.name}
							</h2>
							<Badge className="bg-success/10 text-success border-none uppercase text-[10px]">
								Ativo
							</Badge>
						</div>
					</div>
				</div>
				<Button
					variant="outline"
					onClick={() => setShowDeleteModal(true)}
					className="bg-danger/10 text-danger border-none h-12 px-6 rounded-xl uppercase font-black text-[10px] gap-2 cursor-pointer"
				>
					<Trash2 size={16} /> Excluir Serviço
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
				<div className="lg:col-span-2 space-y-12 text-left">
					{/* CONFIGURAÇÕES */}
					<Card className="bg-surface border-border-subtle rounded-[40px] p-10 border shadow-sm text-left">
						<CardHeader className="p-0 mb-10 flex flex-row items-center gap-3 text-left">
							<div className="p-2.5 bg-primary/10 rounded-xl text-primary">
								<Settings size={22} />
							</div>
							<div className="text-left">
								<CardTitle className="text-xl font-bold italic uppercase tracking-tighter text-left">
									Ajustes do Projeto
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="p-0 space-y-10 text-left">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
								<div className="space-y-3 text-left">
									<label className="text-[10px] font-bold text-muted-foreground uppercase px-1 text-left">
										Nome do Serviço
									</label>
									<Input
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm focus:border-primary font-medium h-12"
									/>
								</div>
							</div>
							<Button
								onClick={handleSaveService}
								disabled={saving}
								className="h-14 px-12 rounded-2xl bg-primary text-white font-black uppercase text-xs cursor-pointer"
							>
								Salvar Alterações
							</Button>
						</CardContent>
					</Card>

					{/* SEGURANÇA UNIFICADA */}
					<Card className="bg-surface border-border-subtle rounded-[40px] p-10 border shadow-sm text-left">
						<CardHeader className="p-0 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
							<div className="flex items-center gap-3 text-left">
								<div className="p-2.5 bg-primary/10 rounded-xl text-primary">
									<Shield size={22} />
								</div>
								<div className="text-left">
									<CardTitle className="text-xl font-bold italic uppercase tracking-tighter text-left">
										Credenciais
									</CardTitle>
									<p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 text-left">
										Conexões SMTP com Chaves de API vinculadas
									</p>
								</div>
							</div>
							<Button
								onClick={() => {
									setGeneratedKey(null);
									setSelectedType(null);
									setShowConnModal(true);
								}}
								className="gap-2 uppercase font-black tracking-widest text-[10px] px-6 h-12 rounded-xl cursor-pointer"
							>
								<Plus size={16} /> Nova Conexão
							</Button>
						</CardHeader>
						<CardContent className="p-0 space-y-6 text-left">
							{unifiedConnections.length === 0 ? (
								<div className="py-20 border border-dashed border-border-subtle rounded-4xl text-center italic text-muted-foreground text-sm">
									Nenhuma conexão de segurança configurada.
								</div>
							) : (
								<div className="grid grid-cols-1 gap-6 text-left">
									{unifiedConnections.map((conn) => (
										<div
											key={conn.id}
											className="p-8 bg-background/50 rounded-4xl border border-border-subtle hover:border-primary/30 transition-all group relative overflow-hidden text-left"
										>
											<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10 text-left">
												<div className="flex items-start gap-6 text-left">
													<div className="p-4 bg-surface rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
														{conn.auth_type === 'oauth2' ? (
															<FaGoogle size={24} />
														) : (
															<Settings2 size={24} />
														)}
													</div>
													<div className="space-y-1 text-left">
														<div className="flex items-center gap-3 text-left">
															<h4 className="text-lg font-bold text-foreground text-left">
																{conn.name}
															</h4>
															<Badge className="bg-success/10 text-success border-none text-[8px] uppercase tracking-widest">
																{conn.auth_type === 'oauth2' && !conn.refresh_token
																	? 'Aguardando Google'
																	: 'Pronto'}
															</Badge>
														</div>
														<p className="text-[11px] text-muted-foreground italic font-medium text-left">
															{conn.login}
														</p>
													</div>
												</div>

												<div className="flex flex-col lg:items-end gap-3 text-left">
													<div className="flex items-center gap-3 bg-background p-2.5 pl-5 rounded-2xl border border-border-subtle w-full max-w-sm group/key hover:border-primary/40 transition-colors text-left">
														<div className="flex items-center gap-2 flex-1 text-left">
															<KeyRound size={14} className="text-primary" />
															<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left">
																API KEY:
															</span>
															<code className="text-xs font-mono text-foreground font-bold text-left">
																{conn.key ? `${conn.key.prefix}••••••••` : 'NÃO GERADA'}
															</code>
														</div>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => confirmDeleteConnection(conn.id, conn.name)}
															className="h-9 w-9 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-xl cursor-pointer"
														>
															<Trash2 size={18} />
														</Button>
													</div>
													<p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter px-2 text-left">
														A chave é revogada automaticamente ao excluir o remetente.
													</p>
												</div>
											</div>
											<div className="absolute -right-10 -bottom-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
												{conn.auth_type === 'oauth2' ? (
													<FaGoogle size={120} />
												) : (
													<Shield size={120} />
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="space-y-8 text-left">
					<Card className="bg-surface border-border-subtle rounded-3xl p-8 border shadow-sm text-left">
						<CardHeader className="p-0 text-left">
							<CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 text-left">
								<Code size={14} className="text-primary" /> Endpoints
							</CardTitle>
						</CardHeader>
						<CardContent className="p-0 mt-6 text-left">
							<p className="text-[10px] font-bold text-muted-foreground/60 uppercase mb-2 px-1 text-left">
								X-Service-ID
							</p>
							<div className="flex items-center gap-2 p-4 bg-background rounded-xl border border-border-subtle text-left">
								<code className="text-xs font-mono text-primary flex-1 truncate text-left">
									{service?.id}
								</code>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => copyToClipboard(service?.id || '')}
								>
									<Copy size={14} />
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<Dialog open={showConnModal} onOpenChange={(open) => !open && closeModal()}>
				<DialogContent className="bg-surface border-border-subtle w-full max-w-2xl rounded-[40px] shadow-2xl p-0 overflow-hidden text-left">
					{!generatedKey ? (
						<>
							<DialogHeader className="p-10 border-b border-border-subtle bg-background/30 text-center">
								<div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
									<Shield size={32} />
								</div>
								<DialogTitle className="text-2xl font-bold italic uppercase tracking-tighter text-foreground text-center">
									Nova Conexão
								</DialogTitle>
								<DialogDescription className="text-muted-foreground text-sm mt-2 italic text-center">
									Vincule um provedor de e-mail ao seu projeto.
								</DialogDescription>
							</DialogHeader>

							<div className="p-10 space-y-6 max-h-125 overflow-y-auto scrollbar-hide text-left">
								{error && (
									<div className="bg-danger/10 border border-danger/20 p-4 rounded-xl text-danger text-[10px] font-bold uppercase">
										{error}
									</div>
								)}

								{!selectedType ? (
									<div className="grid grid-cols-2 gap-4 pt-4 text-left">
										<div
											onClick={() => setSelectedType('plain')}
											className="p-6 border-2 border-border-subtle rounded-3xl hover:border-primary/50 cursor-pointer transition-all text-left group"
										>
											<Settings2 className="text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
											<h4 className="font-bold text-sm text-foreground">SMTP Padrão</h4>
											<p className="text-[10px] text-muted-foreground mt-1 italic">
												Outlook, SendGrid, SES...
											</p>
										</div>
										<div
											onClick={() => setSelectedType('oauth2')}
											className="p-6 border-2 border-border-subtle rounded-3xl hover:border-primary/50 cursor-pointer transition-all text-left group"
										>
											<FaGoogle className="text-primary mb-3" />
											<h4 className="font-bold text-sm text-foreground">Google OAuth2</h4>
											<p className="text-[10px] text-muted-foreground mt-1 italic">
												Workspace, Gmail seguro...
											</p>
										</div>
									</div>
								) : (
									<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
										<button
											onClick={() => setSelectedType(null)}
											className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
										>
											← Mudar Provedor
										</button>

										<div className="grid grid-cols-1 gap-6 text-left">
											<div className="space-y-2 text-left">
												<label className="text-[10px] font-bold text-muted-foreground uppercase px-1 text-left">
													Nome da Conexão
												</label>
												<Input
													value={formData.name}
													onChange={(e) => setFormData({ ...formData, name: e.target.value })}
													className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm focus:border-primary font-medium h-12"
													placeholder="Ex: Suporte Global"
												/>
											</div>
											<div className="space-y-2 text-left">
												<label className="text-[10px] font-bold text-muted-foreground uppercase px-1 text-left">
													E-mail do Remetente
												</label>
												<Input
													value={formData.login}
													onChange={(e) => setFormData({ ...formData, login: e.target.value })}
													className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm focus:border-primary font-medium h-12"
													placeholder="contato@empresa.com"
												/>
											</div>

											{selectedType === 'plain' ? (
												<div className="space-y-6 text-left">
													<div className="grid grid-cols-3 gap-4 text-left">
														<div className="col-span-2 space-y-2 text-left">
															<label className="text-[10px] font-bold text-muted-foreground uppercase px-1 text-left">
																Host SMTP
															</label>
															<Input
																value={formData.smtpHost}
																onChange={(e) =>
																	setFormData({ ...formData, smtpHost: e.target.value })
																}
																className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm focus:border-primary font-medium h-12"
															/>
														</div>
														<div className="space-y-2 text-left">
															<label className="text-[10px] font-bold text-muted-foreground uppercase px-1 text-left">
																Porta
															</label>
															<Input
																value={formData.smtpPort}
																onChange={(e) =>
																	setFormData({ ...formData, smtpPort: e.target.value })
																}
																className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm focus:border-primary font-medium h-12"
															/>
														</div>
													</div>
													<div className="space-y-2 text-left">
														<label className="text-[10px] font-bold text-muted-foreground uppercase px-1 text-left">
															Senha/App Password
														</label>
														<Input
															type="password"
															value={formData.passkey}
															onChange={(e) =>
																setFormData({ ...formData, passkey: e.target.value })
															}
															className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm focus:border-primary font-medium h-12"
														/>
													</div>
												</div>
											) : (
												<div className="space-y-6 text-left">
													<div className="space-y-2 text-left">
														<label className="text-[10px] font-bold text-muted-foreground uppercase px-1 font-mono tracking-tighter text-left">
															Google Client ID
														</label>
														<Input
															value={formData.clientId}
															onChange={(e) =>
																setFormData({ ...formData, clientId: e.target.value })
															}
															className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm font-mono focus:border-primary h-12"
														/>
													</div>
													<div className="space-y-2 text-left">
														<label className="text-[10px] font-bold text-muted-foreground uppercase px-1 font-mono tracking-tighter text-left">
															Google Client Secret
														</label>
														<Input
															type="password"
															value={formData.clientSecret}
															onChange={(e) =>
																setFormData({ ...formData, clientSecret: e.target.value })
															}
															className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm font-mono focus:border-primary h-12"
														/>
													</div>
												</div>
											)}
										</div>
									</div>
								)}
							</div>

							<DialogFooter className="p-10 bg-background/30 border-t border-border-subtle text-left">
								<Button
									onClick={handleCreateConnection}
									disabled={submitting || !selectedType || !formData.name}
									className="w-full py-7 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-hover h-14 cursor-pointer"
								>
									{submitting ? <Loader2 className="animate-spin" /> : 'Salvar e Gerar Acesso'}
								</Button>
							</DialogFooter>
						</>
					) : (
						<div className="p-12 text-center animate-in zoom-in duration-500">
							<DialogTitle className="sr-only">Conexão Criada com Sucesso</DialogTitle>
							<div className="bg-success/10 w-20 h-20 rounded-[30px] flex items-center justify-center text-success mx-auto mb-8">
								<CheckCircle2 size={40} />
							</div>
							<h3 className="text-3xl font-black italic uppercase tracking-tighter text-success mb-2 text-center">
								Conexão Criada!
							</h3>
							<p className="text-muted-foreground text-sm italic mb-10 text-center">
								O Hermes gerou uma{' '}
								<span className="text-foreground font-bold">API Key exclusiva</span> para este
								remetente.
							</p>

							<div className="bg-background border-2 border-dashed border-success/30 rounded-3xl p-8 mb-8 relative group text-left">
								<div className="flex items-center gap-2 mb-4 text-success font-bold text-[9px] uppercase tracking-widest text-left">
									<KeyRound size={12} /> Seu Token de Acesso
								</div>
								<p className="text-xs font-mono text-foreground break-all leading-relaxed select-all text-left">
									{generatedKey.token}
								</p>
								<Button
									onClick={() => {
										navigator.clipboard.writeText(generatedKey.token);
										setCopied(true);
										setTimeout(() => setCopied(false), 2000);
									}}
									className={
										'cursor-pointer absolute -top-4 right-6 px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ' +
										(copied ? 'bg-success text-white' : 'bg-primary text-white shadow-lg')
									}
								>
									{copied ? <Check size={14} /> : <Copy size={14} />}
									{copied ? 'Copiado!' : 'Copiar'}
								</Button>
							</div>

							<Button
								onClick={closeModal}
								className="w-full py-7 rounded-2xl bg-surface border-2 border-border-subtle text-foreground text-xs font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all h-14 cursor-pointer"
							>
								Concluído
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>

			<ConfirmModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleDeleteService}
				variant="danger"
				title="Excluir Serviço?"
				description={`O projeto "${service?.name}" e todos os seus dados serão apagados permanentemente.`}
				confirmText="Sim, Excluir Tudo"
			/>

			<ConfirmModal
				isOpen={showDeleteCredModal}
				onClose={() => setShowDeleteCredModal(false)}
				onConfirm={handleDeleteConnection}
				variant="danger"
				title="Remover Conexão e Chave?"
				description={`A conexão "${itemToDelete?.name}" e sua chave de acesso vinculada serão removidas permanentemente.`}
				confirmText="Sim, Remover Tudo"
			/>
		</div>
	);
}
