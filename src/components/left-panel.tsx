'use client';

import { LayoutDashboard, FileText, SquareTerminal, Users } from 'lucide-react';
import { GrServices } from 'react-icons/gr';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/src/lib/auth-client';

interface AppUser {
	id: string;
	name: string;
	isAdmin: boolean;
}

export default function LeftPanel() {
	const pathname = usePathname();
	const { data: session } = authClient.useSession();
	const user = session?.user as AppUser | undefined;

	const navItems = [
		{ title: 'Geral', items: [
			{ name: 'Dashboard', path: '/system/dashboard', icon: LayoutDashboard },
			{ name: 'Serviços', path: '/system/services', icon: GrServices },
		]},
		{ title: 'Monitoramento', items: [
			{ name: 'Templates', path: '/system/templates', icon: FileText },
			{ name: 'Sandbox', path: '/system/sandbox', icon: SquareTerminal },
		]},
	];

	if (user?.isAdmin) {
		navItems.push({ title: 'Administração', items: [
			{ name: 'Usuários', path: '/system/users', icon: Users },
		]});
	}

	return (
		<aside className="w-64 border-r bg-card flex flex-col h-full shrink-0">
			<div className="flex h-14 items-center border-b px-6">
				<span className="font-semibold tracking-tight">Hermes Engine</span>
			</div>
			<div className="flex-1 overflow-y-auto py-4">
				<nav className="grid gap-4 px-4 text-sm font-medium">
					{navItems.map((group, i) => (
						<div key={i} className="flex flex-col gap-2">
							<span className="text-xs font-semibold text-muted-foreground px-2">
								{group.title}
							</span>
							{group.items.map((item) => {
								const isActive = pathname?.startsWith(item.path);
								return (
									<Link
										key={item.path}
										href={item.path}
										className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
											isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
										}`}
									>
										<item.icon className="h-4 w-4" />
										{item.name}
									</Link>
								);
							})}
						</div>
					))}
				</nav>
			</div>
			<div className="mt-auto border-t p-4">
				<Link href="/system/profile" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground">
					<div className="h-6 w-6 rounded-full bg-secondary overflow-hidden">
						<img src="/no-profile-photo.svg" alt="Avatar" className="h-full w-full object-cover" />
					</div>
					<span>Perfil</span>
				</Link>
			</div>
		</aside>
	);
}
