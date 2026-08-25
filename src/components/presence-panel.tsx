'use client';

import { Circle, Users } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { useOnlineUsers } from '@/src/hooks/use-online-users';

export function PresencePanel({ isAdmin }: { isAdmin: boolean }) {
	const onlineUsers = useOnlineUsers(isAdmin);

	// Usuário comum não vê o painel — presença continua sendo rastreada para
	// ele nos bastidores (toda aba autenticada conta), só a listagem é restrita.
	if (!isAdmin) return null;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5 text-sm hover:bg-secondary/50 cursor-pointer"
				>
					<Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
					<span>{onlineUsers.length} online</span>
				</button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-64">
				<div className="flex items-center gap-2 mb-2 text-sm font-medium">
					<Users className="h-4 w-4" />
					Usuários online
				</div>
				<ScrollArea className="max-h-64">
					<div className="space-y-1">
						{onlineUsers.length === 0 && (
							<p className="text-xs text-muted-foreground py-2">Ninguém online no momento.</p>
						)}
						{onlineUsers.map((u) => (
							<div key={u.id} className="flex items-center gap-2 text-sm py-1">
								<Circle className="h-1.5 w-1.5 fill-emerald-500 text-emerald-500 shrink-0" />
								<span className="truncate">{u.name}</span>
							</div>
						))}
					</div>
				</ScrollArea>
			</PopoverContent>
		</Popover>
	);
}
