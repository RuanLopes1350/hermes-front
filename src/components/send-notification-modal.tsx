'use client';

import { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { apiFetch } from '@/src/lib/api';
import { useToast } from '@/src/hooks/use-toast';
import { Loader2, Send, Info, AlertTriangle, CheckCircle2, AlertCircle, Users } from 'lucide-react';

interface SendNotificationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

interface UserOption {
	id: string;
	name: string;
	email: string;
	role: string;
}

export function SendNotificationModal({ isOpen, onClose, onSuccess }: SendNotificationModalProps) {
	const { toast } = useToast();
	const [users, setUsers] = useState<UserOption[]>([]);
	const [loadingUsers, setLoadingUsers] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	// Formulário
	const [targetUserId, setTargetUserId] = useState<string>(''); // Vazio = Todos (Broadcast)
	const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
	const [title, setTitle] = useState('');
	const [message, setMessage] = useState('');

	// Carrega lista de usuários ao abrir o modal
	useEffect(() => {
		if (isOpen) {
			fetchUsers();
		} else {
			// Reseta o form ao fechar
			setTargetUserId('');
			setType('info');
			setTitle('');
			setMessage('');
		}
	}, [isOpen]);

	const fetchUsers = async () => {
		setLoadingUsers(true);
		try {
			const res = await apiFetch('/api/users');
			const json = await res.json();
			if (Array.isArray(json.data)) {
				setUsers(json.data);
			}
		} catch (error) {
			console.error('Erro ao carregar usuários:', error);
		} finally {
			setLoadingUsers(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim() || !message.trim()) {
			toast({
				variant: 'destructive',
				title: 'Campos obrigatórios',
				description: 'Preencha o título e a mensagem da notificação.',
			});
			return;
		}

		setSubmitting(true);
		try {
			const payload = {
				userId: targetUserId || null,
				type,
				title: title.trim(),
				message: message.trim(),
			};

			const res = await apiFetch('/api/notifications/send', {
				method: 'POST',
				body: JSON.stringify(payload),
			});

			const json = await res.json();
			if (!res.ok) throw new Error(json.message || json.error || 'Falha ao enviar notificação.');

			toast({
				title: 'Notificação enviada!',
				description: targetUserId
					? 'O alerta foi entregue ao usuário em tempo real via SSE.'
					: 'O alerta em broadcast foi transmitido para todos os usuários.',
			});

			onSuccess?.();
			onClose();
		} catch (error: any) {
			toast({
				variant: 'destructive',
				title: 'Erro no envio',
				description: error.message,
			});
		} finally {
			setSubmitting(false);
		}
	};

	const types = [
		{
			id: 'info',
			label: 'Informação',
			icon: Info,
			color: 'text-blue-500 border-blue-500/30 bg-blue-500/10',
		},
		{
			id: 'success',
			label: 'Sucesso',
			icon: CheckCircle2,
			color: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10',
		},
		{
			id: 'warning',
			label: 'Aviso',
			icon: AlertTriangle,
			color: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
		},
		{
			id: 'error',
			label: 'Crítico',
			icon: AlertCircle,
			color: 'text-red-500 border-red-500/30 bg-red-500/10',
		},
	] as const;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[520px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-lg">
						<Send className="h-5 w-5 text-primary" />
						Enviar Notificação em Tempo Real
					</DialogTitle>
					<DialogDescription>
						Dispare um alerta administrativo que aparecerá instantaneamente no sino de notificações
						via SSE.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 py-2">
					{/* Seleção do Destinatário */}
					<div className="space-y-1.5">
						<label className="text-sm font-medium flex items-center justify-between">
							<span>Destinatário</span>
							{loadingUsers && (
								<span className="text-xs text-muted-foreground flex items-center gap-1">
									<Loader2 className="h-3 w-3 animate-spin" /> Carregando...
								</span>
							)}
						</label>
						<select
							value={targetUserId}
							onChange={(e) => setTargetUserId(e.target.value)}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
						>
							<option value="">📢 Todos os Usuários (Broadcast Geral)</option>
							<optgroup label="Usuários Cadastrados">
								{users.map((u) => (
									<option key={u.id} value={u.id}>
										{u.name} — {u.email} ({u.role})
									</option>
								))}
							</optgroup>
						</select>
						<p className="text-[11px] text-muted-foreground">
							{targetUserId
								? 'Apenas o usuário selecionado receberá este alerta em tempo real.'
								: 'Todos os usuários com o painel aberto receberão este alerta.'}
						</p>
					</div>

					{/* Seleção do Tipo Visual */}
					<div className="space-y-1.5">
						<label className="text-sm font-medium">Tipo do Alerta</label>
						<div className="grid grid-cols-4 gap-2">
							{types.map((t) => {
								const Icon = t.icon;
								const isSelected = type === t.id;
								return (
									<button
										key={t.id}
										type="button"
										onClick={() => setType(t.id)}
										className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
											isSelected
												? `${t.color} font-semibold ring-2 ring-primary/40`
												: 'border-border/60 hover:bg-muted text-muted-foreground'
										}`}
									>
										<Icon className="h-4 w-4 mb-1" />
										{t.label}
									</button>
								);
							})}
						</div>
					</div>

					{/* Título */}
					<div className="space-y-1.5">
						<label className="text-sm font-medium">Título</label>
						<Input
							placeholder="Ex: Manutenção Programada"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							maxLength={120}
							required
						/>
					</div>

					{/* Mensagem */}
					<div className="space-y-1.5">
						<label className="text-sm font-medium">Mensagem</label>
						<textarea
							rows={3}
							placeholder="Ex: A plataforma passará por uma atualização técnica hoje às 23:00. O serviço permanecerá estável."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							maxLength={1000}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
							required
						/>
					</div>

					<DialogFooter className="gap-2 sm:gap-0 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={submitting}
							className="cursor-pointer"
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={submitting} className="cursor-pointer gap-2">
							{submitting ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" /> Disparando...
								</>
							) : (
								<>
									<Send className="h-4 w-4" /> Disparar Notificação
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
