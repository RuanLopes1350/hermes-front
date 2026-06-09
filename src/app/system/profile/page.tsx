'use client';

import { User, Shield, Lock, Save, Loader2, Mail, UserCircle, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { authClient } from '@/src/lib/auth-client';
import { apiFetch } from '@/src/lib/api';
import { useToast } from '@/src/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

export default function ProfilePage() {
	const { data: session, isPending: isSessionLoading } = authClient.useSession();
	const { toast } = useToast();

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [isSavingProfile, setIsSavingProfile] = useState(false);

	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

	useEffect(() => {
		if (session?.user) {
			setName(session.user.name || '');
			setEmail(session.user.email || '');
		}
	}, [session]);

	const handleSaveProfile = async () => {
		if (!session?.user?.id) return;
		if (!name.trim()) return;

		setIsSavingProfile(true);
		try {
			const response = await apiFetch(`/api/users/${session.user.id}`, {
				method: 'PATCH',
				body: JSON.stringify({ name }),
			});
			if (response.ok) {
				toast({ title: 'Sucesso', description: 'Perfil atualizado.' });
				await authClient.getSession();
			} else {
				throw new Error('Falha ao atualizar perfil');
			}
		} catch (error: any) {
			toast({ variant: 'destructive', title: 'Erro', description: error.message });
		} finally {
			setIsSavingProfile(false);
		}
	};

	const handleUpdatePassword = async () => {
		if (newPassword !== confirmPassword) {
			toast({ variant: 'destructive', title: 'Erro', description: 'Senhas não coincidem.' });
			return;
		}

		setIsUpdatingPassword(true);
		try {
			const { error } = await authClient.changePassword({
				currentPassword,
				newPassword,
				revokeOtherSessions: true,
			});
			if (error) throw new Error(error.message);
			toast({ title: 'Sucesso', description: 'Senha atualizada.' });
			setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
		} catch (error: any) {
			toast({ variant: 'destructive', title: 'Erro', description: error.message });
		} finally {
			setIsUpdatingPassword(false);
		}
	};

	if (isSessionLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

	return (
		<div className="space-y-6 animate-in fade-in duration-500">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">Meu Perfil</h2>
				<p className="text-sm text-muted-foreground">Gerencie suas credenciais e identidade visual.</p>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<Card className="md:col-span-1">
					<CardHeader className="text-center pb-4">
						<div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
							<UserCircle className="h-12 w-12" />
						</div>
						<CardTitle>{session?.user?.name}</CardTitle>
						<CardDescription>{session?.user?.email}</CardDescription>
					</CardHeader>
				</Card>

				<div className="space-y-6 md:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Dados Pessoais</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-2">
								<label className="text-sm font-medium">Nome Completo</label>
								<Input value={name} onChange={e => setName(e.target.value)} />
							</div>
							<div className="grid gap-2 opacity-60 pointer-events-none">
								<label className="text-sm font-medium">E-mail (Imutável)</label>
								<div className="relative">
									<Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input value={email} readOnly className="pl-9 bg-muted" />
								</div>
							</div>
							<div className="flex justify-end pt-2">
								<Button onClick={handleSaveProfile} disabled={isSavingProfile || !name.trim()}>
									{isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar Alterações
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Segurança</CardTitle>
							<CardDescription>Atualize sua senha de acesso.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-2">
								<label className="text-sm font-medium">Senha Atual</label>
								<Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="grid gap-2">
									<label className="text-sm font-medium">Nova Senha</label>
									<Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
								</div>
								<div className="grid gap-2">
									<label className="text-sm font-medium">Confirmar Nova Senha</label>
									<Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
								</div>
							</div>
							<div className="flex justify-end pt-2">
								<Button variant="secondary" onClick={handleUpdatePassword} disabled={isUpdatingPassword || !newPassword}>
									{isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Atualizar Senha
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
