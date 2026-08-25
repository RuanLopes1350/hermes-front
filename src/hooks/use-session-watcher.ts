'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { authClient } from '@/src/lib/auth-client';
import { useToast } from '@/src/hooks/use-toast';
import { useSSE } from '@/src/hooks/use-sse';

const sessionRevokedSchema = z.object({
	reason: z.enum(['banned', 'manual_revoke']),
	at: z.string(),
});

// Escuta /api/users/session-events via SSE e força o logout imediato quando a
// sessão do usuário autenticado é revogada (ex.: um admin desativou a conta),
// em vez de esperar a próxima requisição/refetch do useSession() para perceber.
export function useSessionWatcher(enabled: boolean) {
	const router = useRouter();
	const { toast } = useToast();

	useSSE('/api/users/session-events', sessionRevokedSchema, {
		enabled,
		onMessage: () => {
			toast({
				title: 'Sessão encerrada',
				description: 'Sua sessão foi encerrada por um administrador.',
				variant: 'destructive',
			});
			authClient.signOut({
				fetchOptions: { onSuccess: () => router.replace('/auth/sign-in') },
			});
		},
	});
}
