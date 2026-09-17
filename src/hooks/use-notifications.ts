'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiFetch } from '@/src/lib/api';
import { useSSE } from '@/src/hooks/use-sse';

const notificationEventSchema = z.object({
	type: z.literal('new_notification'),
	notification: z.object({
		id: z.string(),
		type: z.enum(['error', 'warning', 'info', 'success']),
		title: z.string(),
		message: z.string(),
	}),
});

export interface NotificationItem {
	id: string;
	type: 'error' | 'warning' | 'info' | 'success';
	title: string;
	message: string;
	is_read: boolean;
	createdAt: string;
}

export function useNotifications(enabled: boolean) {
	const queryClient = useQueryClient();

	const { data: notifications = [] } = useQuery<NotificationItem[]>({
		queryKey: ['notifications'],
		queryFn: async () => {
			const res = await apiFetch('/api/notifications/my-alerts');
			if (!res.ok) throw new Error('Falha ao buscar notificações');
			return res.json();
		},
		enabled,
		refetchOnWindowFocus: false,
		// Fallback de polling reduzido: 30s em vez de 60s.
		// Cobre o caso de notificações criadas pelo systemWorker (processo separado).
		// Quando o SSE do processo da API dispara, a invalidação é instantânea.
		refetchInterval: 30000,
	});

	// SSE: invalida a query instantaneamente quando o backend empurra um evento
	useSSE('/api/notifications/stream', notificationEventSchema, {
		enabled,
		onMessage: () => {
			queryClient.invalidateQueries({ queryKey: ['notifications'] });
		},
	});

	return notifications;
}
