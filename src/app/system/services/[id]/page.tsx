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
	Pencil,
	ToggleLeft,
	ToggleRight,
	Users,
	UserMinus,
	History,
	ArrowRightLeft,
} from 'lucide-react';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/src/components/ui/sheet';
import { FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/src/lib/api';
import { authClient } from '@/src/lib/auth-client';
import { useToast } from '@/src/hooks/use-toast';
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

	const { data: session } = authClient.useSession();

	const [service, setService] = useState<any>(null);
	const [credentials, setCredentials] = useState<any[]>([]);
	const [members, setMembers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const [editName, setEditName] = useState('');
	const [editSettings, setEditSettings] = useState<any>({});

	// Modals
	const [showConnModal, setShowConnModal] = useState(false);
	const [selectedType, setSelectedType] = useState<'plain' | 'oauth2' | null>(null);
	const [formData, setFormData] = useState({
		name: '',
		login: '',
		smtpHost: '',
		smtpPort: '',
		smtpSecure: true,
		passkey: '',
		clientId: '',
		clientSecret: '',
	});
	const [generatedKey, setGeneratedKey] = useState<any>(null);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [copied, setCopied] = useState(false);

	const [showDeleteCredModal, setShowDeleteCredModal] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<any>(null);

	// Edit credential state
	const [showEditCredModal, setShowEditCredModal] = useState(false);
	const [editingCred, setEditingCred] = useState<any>(null);
	const [editCredForm, setEditCredForm] = useState({
		name: '',
		login: '',
		smtpHost: '',
		smtpPort: '',
		smtpSecure: true,
		passkey: '',
	});
	const [savingCred, setSavingCred] = useState(false);
	const [togglingKeyId, setTogglingKeyId] = useState<string | null>(null);

	// Member Modals
	const [showAddMember, setShowAddMember] = useState(false);
	const [newMemberEmail, setNewMemberEmail] = useState('');
	const [addingMember, setAddingMember] = useState(false);

	const [showTransferModal, setShowTransferModal] = useState(false);
	const [transferToId, setTransferToId] = useState('');
	const [transferring, setTransferring] = useState(false);

	// History Modal
	const [showHistoryModal, setShowHistoryModal] = useState(false);
	const [logs, setLogs] = useState<any[]>([]);
	const [loadingLogs, setLoadingLogs] = useState(false);
	const [logsOffset, setLogsOffset] = useState(0);
	const [hasMoreLogs, setHasMoreLogs] = useState(true);
	const LOGS_LIMIT = 20;

	const fetchLogs = useCallback(
		async (offset = 0) => {
			setLoadingLogs(true);
			try {
				const res = await apiFetch(
					`/api/services/${params.id}/logs?limit=${LOGS_LIMIT}&offset=${offset}`,
				);
				if (!res.ok) throw new Error();
				const result = await res.json();

				if (offset === 0) setLogs(result.data);
				else setLogs((prev) => [...prev, ...result.data]);

				if (result.data.length < LOGS_LIMIT) setHasMoreLogs(false);
				else setHasMoreLogs(true);
			} catch (e) {
				toast({
					variant: 'destructive',
					title: 'Erro',
					description: 'Não foi possível carregar o histórico.',
				});
			} finally {
				setLoadingLogs(false);
			}
		},
		[params.id, toast],
	);

	useEffect(() => {
		if (showHistoryModal && logs.length === 0) {
			setLogsOffset(0);
			fetchLogs(0);
		}
	}, [showHistoryModal, logs.length, fetchLogs]);

	const loadMoreLogs = () => {
		const newOffset = logsOffset + LOGS_LIMIT;
		setLogsOffset(newOffset);
		fetchLogs(newOffset);
	};

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			const [svcRes, credsRes, membersRes] = await Promise.all([
				apiFetch(`/api/services/${params.id}`),
				apiFetch(`/api/services/${params.id}/credentials`),
				apiFetch(`/api/services/${params.id}/members`),
			]);

			const svcData = await svcRes.json();
			const credsData = await credsRes.json();
			const membersData = await membersRes.json();

			if (!svcRes.ok) throw new Error(svcData.message);

			setService(svcData.data);
			setEditName(svcData.data.name);
			setEditSettings(svcData.data.settings || {});
			setCredentials(credsData.data || []);
			setMembers(membersData.data || []);
		} catch (error: any) {
			toast({
				variant: 'destructive',
				title: 'Erro',
				description: 'Falha ao carregar detalhes do serviço.',
			});
		} finally {
			setLoading(false);
		}
	}, [params.id, toast]);

	useEffect(() => {
		if (params.id) fetchData();
	}, [params.id, fetchData]);

	const unifiedConnections = credentials;
	const isOwner = service?._role === 'owner';

	const handleAuthorizeGoogle = (credId: string) => {
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1350';
		window.location.href = `${apiUrl}/api/services/${params.id}/credentials/${credId}/authorize`;
	};

	const handleOpenEditCred = (conn: any) => {
		setEditingCred(conn);
		setEditCredForm({
			name: conn.name || '',
			login: conn.login || '',
			smtpHost: conn.smtp_host || '',
			smtpPort: conn.smtp_port ? String(conn.smtp_port) : '',
			smtpSecure: conn.smtp_secure ?? true,
			passkey: '', // nunca preenchemos a senha atual por segurança
		});
		setShowEditCredModal(true);
	};

	const handleEditCredential = async () => {
		if (!editingCred) return;
		setSavingCred(true);
		try {
			// Só envia passkey se o usuário preencheu (campo opcional na edição)
			const payload: any = {
				name: editCredForm.name,
				login: editCredForm.login,
				smtpHost: editCredForm.smtpHost,
				smtpPort: Number(editCredForm.smtpPort),
				smtpSecure: editCredForm.smtpSecure,
			};
			if (editCredForm.passkey.trim()) {
				payload.passkey = editCredForm.passkey;
			}
			const res = await apiFetch(`/api/services/${params.id}/credentials/${editingCred.id}`, {
				method: 'PATCH',
				body: JSON.stringify(payload),
			});
			const result = await res.json();
			if (!res.ok) throw new Error(result.message || 'Falha ao salvar.');
			toast({ title: 'Sucesso', description: 'Credencial atualizada com sucesso.' });
			setShowEditCredModal(false);
			setEditingCred(null);
			fetchData();
		} catch (err: any) {
			toast({ variant: 'destructive', title: 'Erro', description: err.message });
		} finally {
			setSavingCred(false);
		}
	};

	const handleToggleKeyStatus = async (credId: string, currentlyActive: boolean) => {
		setTogglingKeyId(credId);
		try {
			const res = await apiFetch(`/api/services/${params.id}/credentials/${credId}`, {
				method: 'PATCH',
				body: JSON.stringify({ is_active: !currentlyActive }),
			});
			const result = await res.json();
			if (!res.ok) throw new Error(result.message || 'Falha ao atualizar.');
			toast({
				title: !currentlyActive ? 'Credencial ativada' : 'Credencial desativada',
				description: `A credencial e a chave foram ${!currentlyActive ? 'reativadas' : 'desativadas'} com sucesso.`,
			});
			fetchData();
		} catch (err: any) {
			toast({ variant: 'destructive', title: 'Erro', description: err.message });
		} finally {
			setTogglingKeyId(null);
		}
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
			setGeneratedKey(result.data.key);
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
			const response = await apiFetch(`/api/services/${params.id}/credentials/${itemToDelete.id}`, {
				method: 'DELETE',
			});
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

	const handleAddMember = async () => {
		setAddingMember(true);
		try {
			const res = await apiFetch(`/api/services/${params.id}/members`, {
				method: 'POST',
				body: JSON.stringify({ email: newMemberEmail }),
			});
			if (!res.ok) throw new Error((await res.json()).message);
			toast({ title: 'Sucesso', description: 'Membro adicionado.' });
			setNewMemberEmail('');
			setShowAddMember(false);
			fetchData();
		} catch (err: any) {
			toast({ variant: 'destructive', title: 'Erro', description: err.message });
		} finally {
			setAddingMember(false);
		}
	};

	const handleRemoveMember = async (userId: string) => {
		try {
			const res = await apiFetch(`/api/services/${params.id}/members/${userId}`, {
				method: 'DELETE',
			});
			if (!res.ok) throw new Error((await res.json()).message);
			toast({ title: 'Sucesso', description: 'Membro removido.' });
			fetchData();
		} catch (err: any) {
			toast({ variant: 'destructive', title: 'Erro', description: err.message });
		}
	};

	const handleTransferOwnership = async () => {
		if (!transferToId) return;
		setTransferring(true);
		try {
			const res = await apiFetch(`/api/services/${params.id}/transfer-ownership`, {
				method: 'POST',
				body: JSON.stringify({ newOwnerId: transferToId }),
			});
			if (!res.ok) throw new Error((await res.json()).message);
			toast({ title: 'Sucesso', description: 'Propriedade transferida!' });
			setShowTransferModal(false);
			fetchData();
		} catch (err: any) {
			toast({ variant: 'destructive', title: 'Erro', description: err.message });
		} finally {
			setTransferring(false);
		}
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
			smtpPort: '',
			smtpSecure: true,
			passkey: '',
			clientId: '',
			clientSecret: '',
		});
	};

	if (loading)
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);

	return (
		<div className="space-y-6 animate-in fade-in duration-500 pb-20">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild className="cursor-pointer">
						<Link href="/system/services">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div>
						<div className="flex items-center gap-2">
							<h2 className="text-2xl font-bold tracking-tight">{service?.name}</h2>
							<Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Ativo</Badge>
						</div>
						<p className="text-sm text-muted-foreground font-mono">ID: {service?.id}</p>
					</div>
				</div>
				{(isOwner || session?.user?.isAdmin) && (
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							onClick={() => setShowHistoryModal(true)}
							className="cursor-pointer bg-white"
						>
							<History className="mr-2 h-4 w-4" /> Histórico
						</Button>
						{isOwner && (
							<Button
								variant="destructive"
								onClick={() => setShowDeleteModal(true)}
								className="cursor-pointer"
							>
								<Trash2 className="mr-2 h-4 w-4" /> Excluir Projeto
							</Button>
						)}
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Settings className="h-5 w-5" /> Configurações do Projeto
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid gap-2">
								<label className="text-sm font-medium">Nome do Projeto</label>
								<Input
									value={editName}
									onChange={(e) => setEditName(e.target.value)}
									disabled={!isOwner}
								/>
							</div>

							<div className="grid gap-2">
								<label className="text-sm font-medium">Cópia Oculta (BCC) de Auditoria</label>
								<p className="text-xs text-muted-foreground">
									Se preenchido, todos os e-mails enviados por este serviço enviarão uma cópia
									oculta para este endereço.
								</p>
								<Input
									placeholder="ex: auditoria@empresa.com"
									value={editSettings?.auditBccEmail || ''}
									disabled={!isOwner}
									onChange={(e) =>
										setEditSettings({ ...editSettings, auditBccEmail: e.target.value })
									}
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

							{isOwner && (
								<Button
									onClick={handleSaveService}
									disabled={saving || !editName.trim()}
									className="cursor-pointer"
								>
									{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar Configurações
								</Button>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-4">
							<div>
								<CardTitle className="flex items-center gap-2">
									<Shield className="h-5 w-5" /> Credenciais de Disparo
								</CardTitle>
								<CardDescription>
									Conexões e chaves de API vinculadas a este projeto.
								</CardDescription>
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
								unifiedConnections.map((conn) => (
									<div
										key={conn.id}
										className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors gap-4"
									>
										<div className="flex items-center gap-4">
											<div className="p-3 bg-secondary rounded-md">
												{conn.auth_type === 'oauth2' ? (
													<FaGoogle className="h-5 w-5" />
												) : (
													<Settings2 className="h-5 w-5" />
												)}
											</div>
											<div>
												<div className="flex items-center gap-2">
													<p className="font-semibold">{conn.name}</p>
													{conn.auth_type === 'oauth2' && !conn.refresh_token ? (
														<Badge
															variant="destructive"
															className="cursor-pointer"
															onClick={() => handleAuthorizeGoogle(conn.id)}
														>
															<AlertCircle className="mr-1 h-3 w-3" /> Requer Autorização
														</Badge>
													) : (
														<Badge
															variant="secondary"
															className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
														>
															<Check className="mr-1 h-3 w-3" /> Pronto
														</Badge>
													)}
												</div>
												<p className="text-sm text-muted-foreground">{conn.login}</p>
											</div>
										</div>
										<div className="flex flex-col items-end gap-2 w-full sm:w-auto">
											<div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md w-full sm:w-auto">
												<KeyRound className="h-4 w-4 text-primary shrink-0" />
												<code
													className={`text-sm font-mono flex-1 ${
														!conn.is_active ? 'line-through opacity-50' : ''
													}`}
												>
													{conn.prefix ? `${conn.prefix}••••••••` : 'NÃO GERADA'}
												</code>
												<Badge
													className={`text-[9px] cursor-default shrink-0 ${
														conn.is_active
															? 'bg-emerald-100 text-emerald-800'
															: 'bg-red-100 text-red-700'
													}`}
												>
													{conn.is_active ? 'Ativa' : 'Inativa'}
												</Badge>
												{/* Botão Editar — apenas para SMTP plain e quem criou ou dono */}
												{conn.auth_type === 'plain' &&
													(isOwner || session?.user?.id === conn.creator_id) && (
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer"
															title="Editar credencial"
															onClick={() => handleOpenEditCred(conn)}
														>
															<Pencil className="h-3.5 w-3.5" />
														</Button>
													)}
												{/* Botão Ativar/Desativar API Key */}
												{(isOwner || session?.user?.id === conn.creator_id) && (
													<Button
														variant="ghost"
														size="icon"
														className={`h-6 w-6 cursor-pointer ${
															conn.is_active
																? 'text-emerald-600 hover:text-amber-600 hover:bg-amber-50'
																: 'text-red-500 hover:text-emerald-600 hover:bg-emerald-50'
														}`}
														title={conn.is_active ? 'Desativar chave' : 'Ativar chave'}
														disabled={togglingKeyId === conn.id}
														onClick={() => handleToggleKeyStatus(conn.id, conn.is_active)}
													>
														{togglingKeyId === conn.id ? (
															<Loader2 className="h-3.5 w-3.5 animate-spin" />
														) : conn.is_active ? (
															<ToggleRight className="h-4 w-4" />
														) : (
															<ToggleLeft className="h-4 w-4" />
														)}
													</Button>
												)}
												{(isOwner || session?.user?.id === conn.creator_id) && (
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6 text-destructive hover:bg-destructive/10 cursor-pointer"
														onClick={() => {
															setItemToDelete(conn);
															setShowDeleteCredModal(true);
														}}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												)}
											</div>
										</div>
									</div>
								))
							)}
						</CardContent>
					</Card>
				</div>

				{/* Coluna da Direita (Equipe) */}
				<div className="space-y-6">
					<Card>
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5" /> Equipe do Projeto
								</CardTitle>
								{isOwner && (
									<Button
										variant="outline"
										size="sm"
										className="h-8 cursor-pointer"
										onClick={() => setShowAddMember(true)}
									>
										<Plus className="mr-1 h-3.5 w-3.5" /> Adicionar
									</Button>
								)}
							</div>
							<CardDescription>Membros com acesso a este serviço.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{members.length === 0 ? (
								<p className="text-sm text-muted-foreground text-center py-4">
									Nenhum membro carregado.
								</p>
							) : (
								members.map((member) => (
									<div
										key={member.id}
										className="flex items-center justify-between py-2 border-b last:border-0 group"
									>
										<div className="flex flex-col">
											<span className="text-sm font-medium flex items-center gap-2">
												{member.name}
												{member.role === 'owner' ? (
													<Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] h-4 px-1.5 cursor-default">
														Dono
													</Badge>
												) : (
													<Badge
														variant="secondary"
														className="text-[10px] h-4 px-1.5 cursor-default"
													>
														Membro
													</Badge>
												)}
											</span>
											<span className="text-xs text-muted-foreground">{member.email}</span>
										</div>
										{isOwner && member.id !== session?.user?.id && (
											<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7 text-muted-foreground hover:text-primary cursor-pointer"
													title="Transferir Posse"
													onClick={() => {
														setTransferToId(member.id);
														setShowTransferModal(true);
													}}
												>
													<ArrowRightLeft className="h-3.5 w-3.5" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
													title="Remover Membro"
													onClick={() => handleRemoveMember(member.id)}
												>
													<UserMinus className="h-3.5 w-3.5" />
												</Button>
											</div>
										)}
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
								<DialogDescription>
									Escolha o tipo de autenticação que deseja configurar.
								</DialogDescription>
							</DialogHeader>

							<div className="py-4">
								{error && (
									<div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
										{error}
									</div>
								)}

								{!selectedType ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div
											onClick={() => setSelectedType('plain')}
											className="border rounded-lg p-4 cursor-pointer hover:border-primary text-center"
										>
											<Settings2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
											<h4 className="font-semibold">SMTP Padrão</h4>
											<p className="text-xs text-muted-foreground mt-1">
												Usuário e senha convencionais (App Password)
											</p>
										</div>
										<div
											onClick={() => setSelectedType('oauth2')}
											className="border rounded-lg p-4 cursor-pointer hover:border-primary text-center"
										>
											<FaGoogle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
											<h4 className="font-semibold">Google OAuth2</h4>
											<p className="text-xs text-muted-foreground mt-1">
												Autorização segura para Gmail/Workspace
											</p>
										</div>
									</div>
								) : (
									<div className="space-y-4">
										<Button
											variant="link"
											onClick={() => setSelectedType(null)}
											className="px-0 h-auto cursor-pointer"
										>
											← Voltar
										</Button>

										<div className="grid gap-2">
											<label className="text-sm font-medium">Nome da Identificação</label>
											<Input
												value={formData.name}
												onChange={(e) => setFormData({ ...formData, name: e.target.value })}
												placeholder="Ex: Suporte"
											/>
										</div>
										<div className="grid gap-2">
											<label className="text-sm font-medium">E-mail Remetente</label>
											<Input
												value={formData.login}
												onChange={(e) => setFormData({ ...formData, login: e.target.value })}
												placeholder="contato@empresa.com"
											/>
										</div>

										{selectedType === 'plain' ? (
											<div className="space-y-4">
												<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
													<div className="col-span-2 grid gap-2">
														<label className="text-sm font-medium">Host SMTP</label>
														<Input
															value={formData.smtpHost}
															onChange={(e) =>
																setFormData({ ...formData, smtpHost: e.target.value })
															}
															placeholder="smtp.gmail.com"
														/>
													</div>
													<div className="grid gap-2">
														<label className="text-sm font-medium">Porta</label>
														<Input
															value={formData.smtpPort}
															onChange={(e) =>
																setFormData({ ...formData, smtpPort: e.target.value })
															}
															placeholder="465"
														/>
													</div>
												</div>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
													<div className="grid gap-2">
														<label className="text-sm font-medium">Criptografia</label>
														<Select
															value={formData.smtpSecure ? 'ssl' : 'tls'}
															onValueChange={(v) =>
																setFormData({ ...formData, smtpSecure: v === 'ssl' })
															}
														>
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="ssl">SSL (465)</SelectItem>
																<SelectItem value="tls">STARTTLS (587)</SelectItem>
															</SelectContent>
														</Select>
													</div>
													<div className="grid gap-2">
														<label className="text-sm font-medium">Senha / App Password</label>
														<Input
															type="password"
															value={formData.passkey}
															onChange={(e) =>
																setFormData({ ...formData, passkey: e.target.value })
															}
															placeholder="••••••••"
														/>
													</div>
												</div>
											</div>
										) : (
											<div className="bg-muted p-4 rounded-md text-sm">
												<p className="font-semibold mb-1">Integração simplificada Google</p>
												<p className="text-muted-foreground">
													Após salvar, você precisará autorizar o acesso à sua conta Google clicando
													no selo "Requer Autorização".
												</p>
											</div>
										)}
									</div>
								)}
							</div>
							{selectedType && (
								<DialogFooter>
									<Button variant="outline" onClick={closeModal} className="cursor-pointer">
										Cancelar
									</Button>
									<Button
										onClick={handleCreateConnection}
										disabled={submitting || !formData.name}
										className="cursor-pointer"
									>
										{submitting ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											'Salvar Conexão'
										)}
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
									<p className="text-xs font-semibold text-slate-500 mb-2 uppercase">
										Token de Acesso (API Key)
									</p>
									<code className="text-sm break-all text-slate-900">{generatedKey}</code>
								</div>
								<div className="flex justify-end mt-3">
									<Button
										size="sm"
										className="cursor-pointer"
										onClick={() => {
											navigator.clipboard.writeText(generatedKey);
											setCopied(true);
											setTimeout(() => setCopied(false), 2000);
										}}
									>
										{copied ? (
											<Check className="mr-2 h-4 w-4" />
										) : (
											<Copy className="mr-2 h-4 w-4" />
										)}
										{copied ? 'Copiado' : 'Copiar'}
									</Button>
								</div>
								<p className="text-sm text-red-500 mt-4 text-center font-medium">
									Salve este token agora! Ele não será exibido novamente.
								</p>
							</div>
							<DialogFooter className="pb-6">
								<Button className="w-full cursor-pointer" onClick={closeModal}>
									Entendi, concluir
								</Button>
							</DialogFooter>
						</>
					)}
				</DialogContent>
			</Dialog>

			<Dialog open={showEditCredModal} onOpenChange={setShowEditCredModal}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Editar Credencial</DialogTitle>
						<DialogDescription>
							Atualize os dados de conexão SMTP para "{editingCred?.name}".
						</DialogDescription>
					</DialogHeader>
					<div className="py-4 space-y-4">
						<div className="grid gap-2">
							<label className="text-sm font-medium">Nome</label>
							<Input
								value={editCredForm.name}
								onChange={(e) => setEditCredForm({ ...editCredForm, name: e.target.value })}
							/>
						</div>
						<div className="grid gap-2">
							<label className="text-sm font-medium">Login/Usuário</label>
							<Input
								value={editCredForm.login}
								onChange={(e) => setEditCredForm({ ...editCredForm, login: e.target.value })}
							/>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<div className="col-span-2 grid gap-2">
								<label className="text-sm font-medium">Host SMTP</label>
								<Input
									value={editCredForm.smtpHost}
									onChange={(e) => setEditCredForm({ ...editCredForm, smtpHost: e.target.value })}
								/>
							</div>
							<div className="grid gap-2">
								<label className="text-sm font-medium">Porta</label>
								<Input
									value={editCredForm.smtpPort}
									onChange={(e) => setEditCredForm({ ...editCredForm, smtpPort: e.target.value })}
								/>
							</div>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="grid gap-2">
								<label className="text-sm font-medium">Criptografia</label>
								<Select
									value={editCredForm.smtpSecure ? 'ssl' : 'tls'}
									onValueChange={(v) =>
										setEditCredForm({ ...editCredForm, smtpSecure: v === 'ssl' })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ssl">SSL (465)</SelectItem>
										<SelectItem value="tls">STARTTLS (587)</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="grid gap-2">
								<label className="text-sm font-medium text-muted-foreground">
									Nova Senha (opcional)
								</label>
								<Input
									type="password"
									value={editCredForm.passkey}
									onChange={(e) => setEditCredForm({ ...editCredForm, passkey: e.target.value })}
									placeholder="Deixe em branco para manter"
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowEditCredModal(false)}>
							Cancelar
						</Button>
						<Button onClick={handleEditCredential} disabled={savingCred}>
							{savingCred ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={showAddMember} onOpenChange={setShowAddMember}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Convidar Membro</DialogTitle>
						<DialogDescription>O usuário precisa já ter uma conta no Hermes.</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<div className="grid gap-2">
							<label className="text-sm font-medium">E-mail do usuário</label>
							<Input
								placeholder="joao@empresa.com"
								value={newMemberEmail}
								onChange={(e) => setNewMemberEmail(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowAddMember(false)}>
							Cancelar
						</Button>
						<Button onClick={handleAddMember} disabled={!newMemberEmail.trim() || addingMember}>
							{addingMember && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Adicionar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<ConfirmModal
				isOpen={showTransferModal}
				onClose={() => setShowTransferModal(false)}
				onConfirm={handleTransferOwnership}
				variant="danger"
				title="Transferir Propriedade"
				description="Tem certeza que deseja transferir a propriedade deste projeto? Você passará a ser apenas um membro e perderá direitos de exclusão e edição de configurações globais."
			/>
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

			{/* History Sidebar */}
			<Sheet open={showHistoryModal} onOpenChange={setShowHistoryModal}>
				<SheetContent className="sm:max-w-[500px] w-[90vw] overflow-y-auto">
					<SheetHeader className="mb-6">
						<SheetTitle className="flex items-center gap-2">
							<History className="h-5 w-5" /> Histórico de Ações
						</SheetTitle>
						<SheetDescription>
							Registro de auditoria de tudo que aconteceu neste serviço.
						</SheetDescription>
					</SheetHeader>

					<div className="space-y-6">
						{logs.length === 0 && !loadingLogs ? (
							<div className="text-center py-10 text-muted-foreground">
								<p>Nenhum registro encontrado.</p>
							</div>
						) : (
							<div className="relative border-l border-muted-foreground/20 ml-3 space-y-6 pb-6">
								{logs.map((log) => (
									<div key={log.id} className="relative pl-6">
										<span className="absolute -left-1.5 top-1.5 flex h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
										<div className="flex flex-col gap-1">
											<span className="text-xs text-muted-foreground font-medium">
												{new Date(log.createdAt).toLocaleString('pt-BR', {
													dateStyle: 'short',
													timeStyle: 'medium',
												})}
											</span>
											<p className="text-sm font-semibold">{log.action}</p>
											<p className="text-sm text-muted-foreground">{log.description}</p>
											{log.actorName && (
												<p className="text-xs text-muted-foreground mt-1">
													Realizado por:{' '}
													<span className="font-medium text-foreground">{log.actorName}</span> (
													{log.actorEmail})
												</p>
											)}
										</div>
									</div>
								))}
							</div>
						)}

						{loadingLogs && (
							<div className="flex justify-center py-4">
								<Loader2 className="h-6 w-6 animate-spin text-primary" />
							</div>
						)}

						{hasMoreLogs && !loadingLogs && logs.length > 0 && (
							<div className="flex justify-center pt-2">
								<Button
									variant="outline"
									size="sm"
									onClick={loadMoreLogs}
									className="cursor-pointer"
								>
									Carregar mais
								</Button>
							</div>
						)}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
