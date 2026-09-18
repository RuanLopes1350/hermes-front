import { useEffect, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Monitor, Smartphone, Trash2 } from 'lucide-react';
import { apiFetch } from '@/src/lib/api';
import { useToast } from '@/src/hooks/use-toast';
import { Badge } from '@/src/components/ui/badge';

interface ManageSessionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	userId: string | null;
	userName?: string;
}

export function ManageSessionsModal({
	isOpen,
	onClose,
	userId,
	userName,
}: ManageSessionsModalProps) {
	const [sessions, setSessions] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		if (isOpen && userId) {
			fetchSessions();
		} else {
			setSessions([]);
		}
	}, [isOpen, userId]);

	const fetchSessions = async () => {
		setLoading(true);
		try {
			const res = await apiFetch(`/api/users/${userId}/sessions`);
			const data = await res.json();
			if (data.data) {
				setSessions(data.data);
			}
		} catch (error) {
			console.error(error);
			toast({
				variant: 'destructive',
				title: 'Erro',
				description: 'Erro ao buscar sessões do usuário.',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleRevoke = async (token: string) => {
		if (!userId) return;
		try {
			await apiFetch(`/api/users/${userId}/sessions/${token}`, {
				method: 'DELETE',
			});
			toast({ title: 'Sucesso', description: 'Sessão revogada com sucesso!' });
			setSessions((prev) => prev.filter((s) => s.token !== token));
		} catch (error) {
			console.error(error);
			toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao revogar sessão.' });
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Sessões Ativas</DialogTitle>
					<DialogDescription>
						Gerenciando acessos de{' '}
						<strong className="text-foreground">{userName || 'Usuário'}</strong>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{loading ? (
						<div className="text-center py-8 text-muted-foreground text-sm">
							Carregando dispositivos conectados...
						</div>
					) : sessions.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground text-sm border rounded-lg bg-muted/20">
							Nenhuma sessão ativa encontrada.
						</div>
					) : (
						<div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
							{sessions.map((sess) => {
								const isMobile = sess.userAgent?.toLowerCase().includes('mobile');

								return (
									<div
										key={sess.token}
										className="flex items-center justify-between p-3 bg-muted/30 border rounded-lg"
									>
										<div className="flex items-center gap-3">
											{isMobile ? (
												<Smartphone className="h-5 w-5 text-muted-foreground" />
											) : (
												<Monitor className="h-5 w-5 text-muted-foreground" />
											)}
											<div>
												<p className="text-sm font-medium flex items-center gap-2">
													{sess.ipAddress}
												</p>
												<p
													className="text-xs text-muted-foreground mt-0.5 line-clamp-1"
													title={sess.userAgent}
												>
													{sess.userAgent}
												</p>
												<p className="text-xs text-muted-foreground mt-1">
													Criada em: {new Date(sess.createdAt).toLocaleDateString('pt-BR')}
												</p>
											</div>
										</div>

										<Button
											variant="ghost"
											size="icon"
											className="text-destructive hover:text-destructive hover:bg-destructive/10"
											onClick={() => handleRevoke(sess.token)}
											title="Revogar acesso"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
