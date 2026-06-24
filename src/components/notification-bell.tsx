'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { Button } from '@/src/components/ui/button';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { apiFetch } from '@/src/lib/api';

interface Notification {
	id: string;
	type: 'error' | 'warning' | 'info' | 'success';
	title: string;
	message: string;
	is_read: boolean;
	createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function NotificationBell() {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState(false);

	const { data: notifications = [] } = useQuery<Notification[]>({
		queryKey: ['notifications'],
		queryFn: async () => {
			const res = await apiFetch('/api/notifications/my-alerts');
			if (!res.ok) throw new Error('Falha ao buscar notificações');
			return res.json();
		},
		refetchInterval: 60000, // Poll a cada 1 minuto
	});

	const unreadCount = notifications.length;

	const markAsRead = useMutation({
		mutationFn: async (id: string) => {
			await apiFetch(`/api/notifications/${id}/read`, {
				method: 'PATCH',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notifications'] });
		},
	});

	const markAllAsRead = useMutation({
		mutationFn: async () => {
			await apiFetch('/api/notifications/read-all', {
				method: 'POST',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notifications'] });
		},
	});

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'error':
				return 'bg-red-500/10 text-red-500 border-red-500/20';
			case 'warning':
				return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
			case 'success':
				return 'bg-green-500/10 text-green-500 border-green-500/20';
			default:
				return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
		}
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative h-9 w-9 rounded-full cursor-pointer"
				>
					<Bell className="h-5 w-5 text-muted-foreground" />
					{unreadCount > 0 && (
						<span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
				<div className="flex items-center justify-between border-b px-4 py-3">
					<span className="font-semibold text-sm">Notificações</span>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
							onClick={() => markAllAsRead.mutate()}
						>
							<Check className="mr-1 h-3 w-3" />
							Marcar todas lidas
						</Button>
					)}
				</div>
				<ScrollArea className="h-max max-h-80">
					{notifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-center px-4">
							<Bell className="h-8 w-8 text-muted-foreground/50 mb-3" />
							<p className="text-sm text-muted-foreground">
								Você não tem notificações não lidas no momento.
							</p>
						</div>
					) : (
						<div className="flex flex-col">
							{notifications.map((notif) => (
								<div
									key={notif.id}
									className="flex flex-col gap-1 border-b p-4 transition-colors hover:bg-muted/50"
								>
									<div className="flex items-start justify-between gap-2">
										<div className="flex items-center gap-2">
											<div
												className={`h-2 w-2 rounded-full ${getTypeColor(notif.type).split(' ')[1]}`}
											/>
											<span className="font-medium text-sm leading-none">{notif.title}</span>
										</div>
										<span className="text-[10px] text-muted-foreground whitespace-nowrap">
											{formatDistanceToNow(new Date(notif.createdAt), {
												addSuffix: true,
												locale: ptBR,
											})}
										</span>
									</div>
									<p className="text-xs text-muted-foreground mt-1.5 leading-snug">
										{notif.message}
									</p>
									<div className="flex justify-end mt-2">
										<Button
											variant="ghost"
											size="sm"
											className="h-6 px-2 text-[10px] cursor-pointer"
											onClick={() => markAsRead.mutate(notif.id)}
										>
											Marcar como lida
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</ScrollArea>
			</PopoverContent>
		</Popover>
	);
}
