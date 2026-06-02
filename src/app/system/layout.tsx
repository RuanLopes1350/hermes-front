'use client';

import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/src/lib/auth-client';
import { Loader2, LogOut, Settings, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Button } from '@/src/components/ui/button';

interface AppUser {
	id: string;
	name: string;
	isAdmin: boolean;
}

export default function SystemLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const user = session?.user as AppUser | undefined;

	const navItems = [
		{ name: 'Dashboard', path: '/system/dashboard' },
		{ name: 'Serviços', path: '/system/services' },
		{ name: 'E-mails', path: '/system/emails' },
		{ name: 'Templates', path: '/system/templates' },
		{ name: 'Sandbox', path: '/system/sandbox' },
	];

	if (isPending) {
		return (
			<div className="flex h-screen items-center justify-center bg-background">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Top Navigation Bar */}
			<header className="sticky top-0 z-50 w-full border-b bg-card">
				<div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6">
					
					{/* Left: Brand & Links */}
					<div className="flex items-center gap-8">
						<Link href="/system/dashboard" className="flex items-center gap-2 cursor-pointer group">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
								<img src="/hermes-icon.svg" alt="Hermes Icon" className="h-5 w-5" />
							</div>
							<span className="font-bold text-lg tracking-tight hidden sm:inline-block transition-colors group-hover:text-primary">Hermes</span>
						</Link>
						
						<nav className="hidden md:flex items-center space-x-1">
							{navItems.map((item) => {
								const isActive = pathname?.startsWith(item.path);
								return (
									<Link
										key={item.path}
										href={item.path}
										className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
											isActive 
												? 'bg-secondary text-secondary-foreground' 
												: 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
										}`}
									>
										{item.name}
									</Link>
								);
							})}
						</nav>
					</div>

					{/* Right: Actions & Profile */}
					<div className="flex items-center gap-4">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="relative h-9 rounded-full pl-2 pr-4 border border-border/50 hover:bg-secondary/50 cursor-pointer">
									<div className="flex items-center gap-2">
										<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
											<UserIcon className="h-3 w-3 text-primary" />
										</div>
										<span className="text-sm font-medium">{user?.name?.split(' ')[0] || 'Conta'}</span>
									</div>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">{user?.name}</p>
										<p className="text-xs leading-none text-muted-foreground">
											{user?.isAdmin ? 'Administrador' : 'Usuário Padrão'}
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/system/profile" className="cursor-pointer flex w-full">
										<UserIcon className="mr-2 h-4 w-4" />
										<span>Meu Perfil</span>
									</Link>
								</DropdownMenuItem>
								
								{user?.isAdmin && (
									<DropdownMenuItem asChild>
										<Link href="/system/users" className="cursor-pointer flex w-full">
											<Settings className="mr-2 h-4 w-4" />
											<span>Gerenciar Usuários</span>
										</Link>
									</DropdownMenuItem>
								)}
								
								<DropdownMenuSeparator />
								<DropdownMenuItem 
									className="text-destructive focus:text-destructive cursor-pointer flex w-full"
									onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => router.push('/auth/sign-in') }})}
								>
									<LogOut className="mr-2 h-4 w-4" />
									<span>Sair da plataforma</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</header>

			{/* Main Content Viewport */}
			<main className="flex-1 overflow-y-auto">
				<div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8">
					{children}
				</div>
			</main>
		</div>
	);
}
