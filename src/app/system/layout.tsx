'use client';

import LeftPanel from '@/src/components/left-panel';
import { User, Bell, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/src/lib/auth-client';
import Link from 'next/link';

export default function SystemLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const pathname = usePathname();
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	const pageName = pathname?.split('/').pop() || 'dashboard';
	const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

	const handleLogout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push('/auth/sign-in');
				},
			},
		});
	};

	if (isPending) {
		return (
			<div className="flex h-screen items-center justify-center bg-background">
				<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-background text-text-primary overflow-hidden">
			{/* Menu Lateral Estabilizado */}
			<LeftPanel />

			{/* Área de Conteúdo Principal - Removido a margem fixa */}
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				{/* Top Navigation Bar */}
				<header className="h-16 border-b border-border-subtle bg-surface/50 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
					<div className="flex items-center gap-4">
						<nav className="flex text-sm font-medium">
							<span className="text-text-primary font-semibold">{formattedPageName}</span>
						</nav>
					</div>

					<div className="flex items-center gap-6">
						{/* <button className="text-text-secondary hover:text-text-primary transition-colors relative">
							<Bell size={20} />
							<span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full border-2 border-surface"></span>
						</button> */}

						<div className="h-8 w-px bg-border-subtle/50"></div>

						<div className="flex items-center gap-3 group">
							<div className="flex flex-col items-end mr-1">
								<span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">
									{session?.user.name || 'Usuário'}
								</span>
							</div>

							<button
								onClick={handleLogout}
								className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
							>
								Sair
							</button>
						</div>
					</div>
				</header>

				{/* Viewport Principal */}
				<main className="flex-1 overflow-y-auto p-8 relative">
					<div className="absolute top-0 left-0 w-full h-64 bg-linear-to-b from-primary/5 to-transparent pointer-events-none"></div>

					<div className="max-w-7xl mx-auto relative z-10">{children}</div>
				</main>
			</div>
		</div>
	);
}
