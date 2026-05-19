'use client';

import {
	Users,
	UserPlus,
	Shield,
	Search,
	Trash2,
	Settings,
	Loader2,
	RefreshCw,
} from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
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
import { Card } from '@/src/components/ui/card';
import { apiFetch } from '@/src/lib/api';
import { authClient } from '@/src/lib/auth-client';
import { useToast } from '@/src/hooks/use-toast';

/**
 * Interface rigorosa baseada no schema do Drizzle e CommonResponse da API.
 */
interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	isAdmin: boolean | null;
	image?: string | null;
	createdAt: string;
	updatedAt: string;
}

interface ApiResponse<T> {
	error: boolean;
	code: number;
	message: string | null;
	data: T;
	errors: any[];
}

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [isActionInProgress, setIsActionInProgress] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	const { data: session } = authClient.useSession();
	const { toast } = useToast();

	/**
	 * Busca de usuários com tratamento de erro exaustivo.
	 */
	const fetchUsers = useCallback(async () => {
		try {
			setLoading(true);
			const response = await apiFetch('/api/users');

			// Tenta dar parse no JSON independente do status HTTP
			const result: ApiResponse<User[]> = await response.json();

			if (!response.ok || result.error) {
				throw new Error(result.message || `Erro ${response.status}: Falha ao buscar usuários.`);
			}

			// Garante que data seja um array antes de setar
			setUsers(Array.isArray(result.data) ? result.data : []);
		} catch (error: any) {
			console.error('Falha na integração /api/users:', error);
			toast({
				variant: 'destructive',
				title: 'Erro de Sincronização',
				description: error.message || 'Não foi possível carregar a lista de usuários.',
			});
			setUsers([]);
		} finally {
			setLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	/**
	 * Deleção de usuário com proteção contra auto-deleção e feedback de loading.
	 */
	const handleDeleteUser = async (id: string, name: string) => {
		if (id === session?.user.id) {
			toast({
				variant: 'destructive',
				title: 'Operação Bloqueada',
				description:
					'Por segurança, você não pode remover sua própria conta administrativa por aqui.',
			});
			return;
		}

		if (
			!confirm(
				`Confirmar exclusão de "${name}"? Esta ação removerá permanentemente o acesso deste usuário.`,
			)
		) {
			return;
		}

		try {
			setIsActionInProgress(true);
			const response = await apiFetch(`/api/users/${id}`, {
				method: 'DELETE',
			});

			const result: ApiResponse<any> = await response.json();

			if (!response.ok || result.error) {
				throw new Error(result.message || 'Falha ao processar exclusão no servidor.');
			}

			toast({
				title: 'Usuário Excluído',
				description: `O perfil de ${name} foi removido com sucesso.`,
			});

			// Atualização do estado após sucesso
			setUsers((prev) => prev.filter((u) => u.id !== id));
		} catch (error: any) {
			toast({
				variant: 'destructive',
				title: 'Erro na Exclusão',
				description: error.message || 'Ocorreu um erro ao tentar remover o usuário.',
			});
		} finally {
			setIsActionInProgress(false);
		}
	};

	/**
	 * Filtro memorizado para performance.
	 */
	const filteredUsers = useMemo(() => {
		const lowerSearch = searchTerm.toLowerCase().trim();
		if (!lowerSearch) return users;

		return users.filter(
			(user) =>
				user.name.toLowerCase().includes(lowerSearch) ||
				user.email.toLowerCase().includes(lowerSearch) ||
				user.id.toLowerCase().includes(lowerSearch),
		);
	}, [users, searchTerm]);

	return (
		<div className="space-y-12 text-left">
			{/* Header com ações globais */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
				<div>
					<h2 className="text-3xl font-bold tracking-tight mb-2 uppercase text-foreground">
						Gestão de Usuários
					</h2>
					<p className="text-muted-foreground text-sm font-medium italic">
						Visualizando {users.length} usuários registrados na plataforma.
					</p>
				</div>

				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="icon"
						onClick={fetchUsers}
						disabled={loading}
						className="rounded-xl border-border-subtle cursor-pointer"
					>
						<RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
					</Button>

					{(session?.user as any)?.isAdmin && (
						<Button className="gap-2 uppercase font-black tracking-widest text-[10px] px-6 cursor-pointer">
							<UserPlus size={18} /> Convidar Usuário
						</Button>
					)}
				</div>
			</div>

			{/* Container da Tabela */}
			<Card className="bg-surface border-border-subtle rounded-[32px] overflow-hidden shadow-sm border">
				<div className="p-6 border-b border-border-subtle bg-background/30 flex items-center justify-between gap-4">
					<div className="relative flex-1 max-w-md">
						<Search
							className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
							size={18}
						/>
						<Input
							placeholder="Buscar por nome, e-mail ou ID..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							disabled={loading && users.length === 0}
							className="bg-background border-border-subtle rounded-2xl pl-12 pr-6 py-6 italic h-12"
						/>
					</div>
				</div>

				<div className="overflow-x-auto">
					<Table>
						<TableHeader className="bg-background/50">
							<TableRow className="border-b border-border-subtle/30">
								<TableHead className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
									Identificação
								</TableHead>
								<TableHead className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
									Permissões
								</TableHead>
								<TableHead className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
									Membro desde
								</TableHead>
								<TableHead className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-right">
									Ações
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading && users.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="h-48 text-center">
										<div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
											<Loader2 className="animate-spin text-primary" size={32} />
											<span className="italic">Carregando usuários...</span>
										</div>
									</TableCell>
								</TableRow>
							) : filteredUsers.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="h-48 text-center text-muted-foreground italic">
										{searchTerm
											? 'Nenhum resultado para sua busca.'
											: 'Nenhum usuário encontrado na base de dados.'}
									</TableCell>
								</TableRow>
							) : (
								filteredUsers.map((user) => (
									<TableRow
										key={user.id}
										className="hover:bg-white/5 transition-colors group border-b border-border-subtle/30"
									>
										<TableCell className="px-8 py-6">
											<div className="flex items-center gap-4">
												<div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
													{user.image ? (
														<img
															src={user.image}
															alt={user.name}
															className="w-full h-full object-cover"
														/>
													) : (
														user.name.charAt(0).toUpperCase()
													)}
												</div>
												<div className="text-left">
													<div className="flex items-center gap-2">
														<p className="text-sm font-bold text-foreground">{user.name}</p>
														{user.id === session?.user.id && (
															<Badge className="bg-primary/20 text-primary border-none text-[8px] h-4 px-1">
																VOCÊ
															</Badge>
														)}
													</div>
													<p className="text-[10px] text-muted-foreground italic">{user.email}</p>
												</div>
											</div>
										</TableCell>
										<TableCell className="px-8 py-6 text-left">
											{user.isAdmin ? (
												<Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase gap-1.5 px-3 py-1">
													<Shield size={12} /> Administrador
												</Badge>
											) : (
												<Badge
													variant="outline"
													className="bg-white/5 text-muted-foreground border-border-subtle text-[10px] font-bold uppercase px-3 py-1"
												>
													Membro
												</Badge>
											)}
										</TableCell>
										<TableCell className="px-8 py-6 text-left">
											<span className="text-xs font-mono text-muted-foreground">
												{new Date(user.createdAt).toLocaleDateString('pt-BR', {
													day: '2-digit',
													month: 'long',
													year: 'numeric',
												})}
											</span>
										</TableCell>
										<TableCell className="px-8 py-6 text-right">
											<div className="flex items-center justify-end gap-2">
												<Button
													variant="ghost"
													size="icon"
													className="text-muted-foreground hover:text-foreground hover:bg-white/10 cursor-pointer"
												>
													<Settings size={18} />
												</Button>

												{session?.user &&
													(session.user as any).isAdmin &&
													user.id !== session?.user.id && (
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleDeleteUser(user.id, user.name)}
															disabled={isActionInProgress}
															className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
														>
															{isActionInProgress ? (
																<Loader2 size={16} className="animate-spin" />
															) : (
																<Trash2 size={18} />
															)}
														</Button>
													)}
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</Card>
		</div>
	);
}
