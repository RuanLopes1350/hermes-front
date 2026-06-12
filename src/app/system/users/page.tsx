'use client';

import {
	Users,
	Shield,
	Search,
	Trash2,
	Loader2,
	RefreshCw,
	MoreVertical,
	Ban,
	CheckCircle2,
	UserCog,
} from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/src/components/ui/table';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/src/components/ui/card';
import { apiFetch } from '@/src/lib/api';
import { authClient } from '@/src/lib/auth-client';
import { useToast } from '@/src/hooks/use-toast';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { ConfirmModal } from '@/src/components/ui/confirm-modal';

interface User {
	id: string;
	name: string;
	email: string;
	isAdmin: boolean | null;
	isActive: boolean | null;
	createdAt: string;
}

interface AppUser {
	id: string;
	isAdmin: boolean;
}

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [isActionInProgress, setIsActionInProgress] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

	const { data: session, isPending } = authClient.useSession();
	const { toast } = useToast();
	const currentUser = session?.user as AppUser | undefined;

	useEffect(() => {
		if (!isPending && currentUser && !currentUser.isAdmin) {
			notFound();
		}
	}, [currentUser, isPending]);

	const fetchUsers = useCallback(async () => {
		try {
			setLoading(true);
			const response = await apiFetch('/api/users');
			const result = await response.json();
			if (!response.ok || result.error) throw new Error();
			setUsers(Array.isArray(result.data) ? result.data : []);
		} catch (error: any) {
			toast({
				variant: 'destructive',
				title: 'Erro',
				description: 'Não foi possível carregar usuários.',
			});
			setUsers([]);
		} finally {
			setLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		if (!isPending && currentUser?.isAdmin) {
			fetchUsers();
		}
	}, [fetchUsers, isPending, currentUser]);

	const handleDeleteUser = (id: string, name: string) => {
		if (id === currentUser?.id) {
			toast({
				variant: 'destructive',
				title: 'Operação Bloqueada',
				description: 'Você não pode remover sua própria conta.',
			});
			return;
		}
		setDeleteTarget({ id, name });
	};

	const confirmDeleteUser = async () => {
		if (!deleteTarget) return;
		try {
			setIsActionInProgress(true);
			const response = await apiFetch(`/api/users/${deleteTarget.id}`, { method: 'DELETE' });
			const result = await response.json();

			if (!response.ok || result.error) throw new Error();

			toast({ title: 'Sucesso', description: `O usuário foi removido com sucesso.` });
			setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
		} catch (error: any) {
			toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao excluir usuário.' });
		} finally {
			setIsActionInProgress(false);
		}
	};

	const handleUpdateUser = async (
		id: string,
		name: string,
		payload: { isAdmin?: boolean; isActive?: boolean },
	) => {
		if (id === currentUser?.id) {
			toast({
				variant: 'destructive',
				title: 'Operação Bloqueada',
				description: 'Você não pode alterar suas próprias permissões/status.',
			});
			return;
		}

		try {
			setIsActionInProgress(true);
			const response = await apiFetch(`/api/users/${id}/admin`, {
				method: 'PATCH',
				body: JSON.stringify(payload),
			});
			const result = await response.json();

			if (!response.ok || result.error) throw new Error();

			toast({ title: 'Sucesso', description: `Usuário atualizado com sucesso.` });
			setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...payload } : u)));
		} catch (error: any) {
			toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao atualizar usuário.' });
		} finally {
			setIsActionInProgress(false);
		}
	};

	const filteredUsers = useMemo(() => {
		const lowerSearch = searchTerm.toLowerCase().trim();
		if (!lowerSearch) return users;
		return users.filter(
			(user) =>
				user.name.toLowerCase().includes(lowerSearch) ||
				user.email.toLowerCase().includes(lowerSearch),
		);
	}, [users, searchTerm]);

	if (isPending) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<>
			<ConfirmModal
				isOpen={!!deleteTarget}
				onClose={() => setDeleteTarget(null)}
				onConfirm={confirmDeleteUser}
				title="Excluir Usuário"
				description={`Tem certeza que deseja excluir permanentemente o usuário "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
				confirmText="Excluir"
				variant="danger"
			/>
			<div className="space-y-6 animate-in fade-in duration-500">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">Gestão de Usuários</h2>
						<p className="text-sm text-muted-foreground">
							Gerencie o acesso à infraestrutura Hermes.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							onClick={fetchUsers}
							disabled={loading}
							className="cursor-pointer"
						>
							<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
						</Button>
					</div>
				</div>

				<Card>
					<CardHeader className="pb-3">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div>
								<CardTitle>Base de Usuários</CardTitle>
								<CardDescription>Visualizando {users.length} membros registrados.</CardDescription>
							</div>
							<div className="relative w-full sm:w-64 mt-2 sm:mt-0">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Buscar por nome ou e-mail..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8"
								/>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="rounded-md border overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Usuário</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Acesso</TableHead>
										<TableHead>Data de Entrada</TableHead>
										<TableHead className="text-right">Ações</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{loading && users.length === 0 ? (
										<TableRow>
											<TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
												Carregando usuários...
											</TableCell>
										</TableRow>
									) : filteredUsers.length === 0 ? (
										<TableRow>
											<TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
												Nenhum usuário encontrado.
											</TableCell>
										</TableRow>
									) : (
										filteredUsers.map((user) => (
											<TableRow key={user.id}>
												<TableCell>
													<div className="font-medium flex items-center gap-2">
														{user.name}
														{user.id === currentUser?.id && (
															<Badge
																variant="secondary"
																className="text-[10px] bg-primary text-primary-foreground hover:bg-primary/90"
															>
																Você
															</Badge>
														)}
													</div>
													<div className="text-sm text-muted-foreground">{user.email}</div>
												</TableCell>
												<TableCell>
													{user.isActive !== false ? (
														<Badge className="bg-emerald-500 hover:bg-emerald-600 cursor-default">
															Ativa
														</Badge>
													) : (
														<Badge variant="destructive" className="cursor-default">
															Suspensa
														</Badge>
													)}
												</TableCell>
												<TableCell>
													{user.isAdmin ? (
														<Badge className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-fit items-center gap-1 cursor-default">
															<Shield className="h-3 w-3" /> Admin
														</Badge>
													) : (
														<Badge variant="outline" className="cursor-default">
															Membro
														</Badge>
													)}
												</TableCell>
												<TableCell className="text-sm text-muted-foreground">
													{new Date(user.createdAt).toLocaleDateString('pt-BR')}
												</TableCell>
												<TableCell className="text-right">
													{user.id !== currentUser?.id && (
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
																	<MoreVertical className="h-4 w-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end" className="w-64">
																<DropdownMenuLabel>Ações Administrativas</DropdownMenuLabel>
																<DropdownMenuSeparator />

																<DropdownMenuItem
																	className="cursor-pointer"
																	onClick={() =>
																		handleUpdateUser(user.id, user.name, { isAdmin: !user.isAdmin })
																	}
																>
																	<UserCog className="mr-2 h-4 w-4" />
																	{user.isAdmin ? 'Remover privilégios Admin' : 'Promover a Admin'}
																</DropdownMenuItem>

																<DropdownMenuItem
																	className="cursor-pointer"
																	onClick={() =>
																		handleUpdateUser(user.id, user.name, {
																			isActive: user.isActive === false ? true : false,
																		})
																	}
																>
																	{user.isActive !== false ? (
																		<>
																			<Ban className="mr-2 h-4 w-4 text-amber-500" />{' '}
																			<span className="text-amber-500">Suspender Conta</span>
																		</>
																	) : (
																		<>
																			<CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />{' '}
																			<span className="text-emerald-500">Ativar Conta</span>
																		</>
																	)}
																</DropdownMenuItem>

																<DropdownMenuSeparator />
																<DropdownMenuItem
																	className="text-destructive focus:text-destructive cursor-pointer"
																	onClick={() => handleDeleteUser(user.id, user.name)}
																>
																	<Trash2 className="mr-2 h-4 w-4" />
																	Excluir Permanentemente
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													)}
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
