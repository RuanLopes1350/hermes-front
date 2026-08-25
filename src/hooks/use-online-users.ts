'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiFetch } from '@/src/lib/api';
import { useSSE } from '@/src/hooks/use-sse';

const presenceEventSchema = z.object({
	type: z.enum(['online', 'offline']),
	userId: z.string(),
});

export interface OnlineUser {
	id: string;
	name: string;
	email: string;
	role: 'super_admin' | 'admin' | 'user';
	image?: string | null;
}

// enabled: normalmente `isAdmin` — só administradores podem ver o painel.
export function useOnlineUsers(enabled: boolean) {
	const queryClient = useQueryClient();

	const { data: onlineUsers = [] } = useQuery<OnlineUser[]>({
		queryKey: ['online-users'],
		queryFn: async () => {
			const res = await apiFetch('/api/users/online');
			if (!res.ok) throw new Error('Falha ao buscar usuários online');
			const json = await res.json();
			return Array.isArray(json.data) ? json.data : [];
		},
		enabled,
		refetchOnWindowFocus: false,
	});

	useSSE('/api/users/presence-stream', presenceEventSchema, {
		enabled,
		onMessage: () => {
			queryClient.invalidateQueries({ queryKey: ['online-users'] });
		},
	});

	return onlineUsers;
}
