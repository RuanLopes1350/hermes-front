'use client';

import Button from '@/src/components/button';
import ButtonInput from '@/src/components/button-input';
import { Input } from '@/src/components/ui/input';
import {
	User,
	Shield,
	Bell,
	Trash2,
	Mail,
	Loader2,
	Save,
	Lock,
	ArrowRight,
	Fingerprint,
	UserCircle,
	AlertTriangle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { authClient } from '@/src/lib/auth-client';
import { apiFetch } from '@/src/lib/api';
import { useToast } from '@/src/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';

export default function ProfilePage() {
	const { data: session, isPending: isSessionLoading } = authClient.useSession();
	const { toast } = useToast();

	// Estados do Perfil
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [isSavingProfile, setIsSavingProfile] = useState(false);

	// Estados de Senha
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

	// Sincroniza dados da sessão com o estado local
	useEffect(() => {
		if (session?.user) {
			setName(session.user.name || '');
			setEmail(session.user.email || '');
		}
	}, [session]);

	// Atualizar Nome
	const handleSaveProfile = async () => {
		if (!session?.user?.id) return;
		if (!name.trim()) {
			toast({ variant: 'destructive', title: 'Erro', description: 'O nome não pode estar vazio.' });
			return;
		}

		setIsSavingProfile(true);
		try {
			const response = await apiFetch(`/api/users/${session.user.id}`, {
				method: 'PATCH',
				body: JSON.stringify({ name }),
			});

			const result = await response.json();

			if (response.ok) {
				toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso!' });
				await authClient.getSession();
			} else {
				throw new Error(result.message || 'Falha ao atualizar perfil.');
			}
		} catch (error: any) {
			toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
		} finally {
			setIsSavingProfile(false);
		}
	};

	// Atualizar Senha
	const handleUpdatePassword = async () => {
		if (newPassword !== confirmPassword) {
			toast({ variant: 'destructive', title: 'Erro', description: 'As novas senhas não coincidem.' });
			return;
		}

		setIsUpdatingPassword(true);
		try {
			const { error } = await authClient.changePassword({
				currentPassword,
				newPassword,
				revokeOtherSessions: true,
			});

			if (error) {
				toast({
					variant: 'destructive',
					title: 'Erro de segurança',
					description: error.message || 'Não foi possível alterar a senha.',
				});
			} else {
				toast({ title: 'Senha alterada', description: 'Sua senha foi atualizada com sucesso.' });
				setCurrentPassword('');
				setNewPassword('');
				setConfirmPassword('');
			}
		} catch (error: any) {
			toast({
				variant: 'destructive',
				title: 'Erro interno',
				description: 'Ocorreu um erro ao processar sua solicitação.',
			});
		} finally {
			setIsUpdatingPassword(false);
		}
	};

	if (isSessionLoading) {
		return (
			<div className="h-screen flex items-center justify-center -mt-20">
				<Loader2 className="animate-spin text-primary" size={48} />
			</div>
		);
	}

	return (
		<div className="space-y-10 pb-20 text-left animate-in fade-in duration-700">
			{/* Header */}
			<div className="flex flex-col gap-2">
				<h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
					Central do Usuário
				</h2>
				<p className="text-muted-foreground text-sm italic font-medium">
					Gerencie sua identidade e parâmetros de segurança na infraestrutura Hermes.
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Coluna Esquerda: Resumo (Bento Small) */}
				<div className="lg:col-span-4 space-y-8">
					<Card className="bg-surface border-border-subtle rounded-[40px] p-8 border shadow-xl relative overflow-hidden group">
						<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors duration-700"></div>

						<CardHeader className="p-0 mb-8">
							<div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 border border-primary/20">
								<UserCircle size={32} />
							</div>
							<CardTitle className="text-2xl font-bold tracking-tight text-foreground truncate">
								{session?.user.name}
							</CardTitle>
							<CardDescription className="text-muted-foreground text-xs font-mono lowercase">
								{session?.user.email}
							</CardDescription>
						</CardHeader>
					</Card>
				</div>

				{/* Coluna Direita: Formulários (Bento Large) */}
				<div className="lg:col-span-8 space-y-8">
					{/* Informações Básicas */}
					<Card className="bg-surface border-border-subtle rounded-[40px] p-10 border shadow-sm">
						<CardHeader className="p-0 mb-10 flex flex-row items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-xl">
								<User size={20} className="text-primary" />
							</div>
							<CardTitle className="text-xl font-bold uppercase italic tracking-tighter text-foreground">
								Dados Pessoais
							</CardTitle>
						</CardHeader>

						<CardContent className="p-0 space-y-8">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div className="space-y-3">
									<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-1">
										Seu Nome Completo
									</label>
									<Input
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Ex: Ruan Lopes"
										className="bg-background border-border-subtle rounded-2xl px-6 h-14 italic font-medium focus:ring-1 focus:ring-primary transition-all"
									/>
								</div>
								<div className="space-y-3">
									<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-1 opacity-50">
										E-mail de Acesso
									</label>
									<div className="flex items-center gap-3 bg-background/30 border border-border-subtle/30 rounded-2xl px-6 h-14 text-text-secondary italic font-medium cursor-not-allowed select-none">
										<Mail size={16} className="opacity-30" />
										{email}
									</div>
								</div>
							</div>

							<div className="flex justify-end pt-4">
								<Button
									label={isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
									labelIcon={
										isSavingProfile ? <Loader2 className="animate-spin" /> : <Save size={16} />
									}
									onClick={handleSaveProfile}
									disabled={isSavingProfile}
									containerClassName="md:w-auto px-10 h-14 shadow-lg shadow-primary/10 font-black uppercase text-[10px] tracking-widest cursor-pointer"
								/>
							</div>
						</CardContent>
					</Card>

					{/* Segurança */}
					<Card className="bg-surface border-border-subtle rounded-[40px] p-10 border shadow-sm">
						<CardHeader className="p-0 mb-10 flex flex-row items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-xl">
								<Lock size={20} className="text-primary" />
							</div>
							<CardTitle className="text-xl font-bold uppercase italic tracking-tighter text-foreground">
								Alterar Senha
							</CardTitle>
						</CardHeader>

						<CardContent className="p-0 space-y-8">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="space-y-3">
									<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-1">
										Senha Atual
									</label>
									<Input
										type="password"
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										placeholder="••••••••"
										className="bg-background border-border-subtle rounded-2xl px-6 h-14 focus:ring-1 focus:ring-primary transition-all"
									/>
								</div>
								<div className="space-y-3">
									<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-1">
										Nova Senha
									</label>
									<Input
										type="password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										placeholder="••••••••"
										className="bg-background border-border-subtle rounded-2xl px-6 h-14 focus:ring-1 focus:ring-primary transition-all"
									/>
								</div>
								<div className="space-y-3">
									<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] px-1">
										Confirmar Nova
									</label>
									<Input
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										placeholder="••••••••"
										className="bg-background border-border-subtle rounded-2xl px-6 h-14 focus:ring-1 focus:ring-primary transition-all"
									/>
								</div>
							</div>

							<div className="flex justify-end pt-4">
								<Button
									label={isUpdatingPassword ? 'Processando...' : 'Atualizar Senha'}
									variant="secondary"
									labelIcon={
										isUpdatingPassword ? <Loader2 className="animate-spin" /> : <Shield size={16} />
									}
									onClick={handleUpdatePassword}
									disabled={isUpdatingPassword || !newPassword}
									containerClassName="md:w-auto px-10 h-14 font-black uppercase text-[10px] tracking-widest cursor-pointer"
								/>
							</div>
						</CardContent>
					</Card>

					{/* Zona de Perigo */}
					<Card className="bg-danger/5 border border-danger/20 rounded-[40px] p-10 border shadow-sm group">
						<div className="flex flex-col md:flex-row items-center justify-between gap-8">
							<div className="text-center md:text-left space-y-2">
								<div className="flex items-center gap-2 justify-center md:justify-start text-danger mb-2">
									<AlertTriangle size={18} />
									<h4 className="font-black uppercase tracking-tighter text-lg italic">
										Zona de Perigo
									</h4>
								</div>
								<p className="text-text-primary font-bold text-sm">
									Excluir minha conta permanentemente
								</p>
								<p className="text-muted-foreground text-xs italic max-w-md">
									Esta ação é irreversível. Todos os seus serviços, templates e histórico de logs
									serão apagados instantaneamente.
								</p>
							</div>
							<Button
								label="Remover Acesso"
								variant="danger"
								containerClassName="w-full md:w-auto px-12 h-14 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-danger/20 hover:scale-105 transition-transform cursor-pointer"
							/>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
