'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/src/lib/auth-client';
import { Loader2, LogOut, Settings, User as UserIcon, Menu, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import LogoPrimarioClaro from '@/public/hermes-primario.svg';
import LogoPrimarioEscuro from '@/public/hermes-escuro.svg';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Button } from '@/src/components/ui/button';
import { ThemeToggle } from '@/src/components/theme-toggle';
import { NotificationBell } from '@/src/components/notification-bell';
import { useTour } from '@/src/hooks/use-tour';

const WELCOME_TOUR_STORAGE_KEY = 'hermes_welcome_tour_seen';

interface AppUser {
	id: string;
	name: string;
	role: 'super_admin' | 'admin' | 'user';
	isActive: boolean;
}

export default function SystemLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { data: session, isPending } = authClient.useSession();
	const user = session?.user as AppUser | undefined;

	const navItems = [
		{ name: 'Dashboard', path: '/system/dashboard' },
		{ name: 'Serviços', path: '/system/services' },
		{ name: 'E-mails', path: '/system/emails' },
		{ name: 'Templates', path: '/system/templates' },
		{ name: 'Sandbox', path: '/system/sandbox' },
	];

	useEffect(() => {
		if (user && user.isActive === false) {
			authClient.signOut({ fetchOptions: { onSuccess: () => router.push('/auth/sign-in') } });
		}
	}, [user, router]);

	const { startTour: startWelcomeTour } = useTour([
		{
			element: '#tour-welcome-logo',
			popover: {
				title: 'Bem-vindo ao Hermes! 🕊️',
				description: 'Este é o painel administrativo do seu gateway de e-mails transacionais. Vamos fazer um tour rápido pela barra superior.',
				side: 'bottom',
			},
		},
		{
			element: '#tour-welcome-nav',
			popover: {
				title: 'Navegação Principal',
				description: 'Dashboard (métricas), Serviços (seus namespaces de API Keys), E-mails (histórico), Templates (editor MJML) e Sandbox (teste de envios).',
				side: 'bottom',
			},
		},
		{
			element: '#tour-welcome-bell',
			popover: {
				title: 'Notificações',
				description: 'Avisos sobre rotação de chaves, falhas de webhook e outros eventos importantes aparecem aqui.',
				side: 'bottom',
			},
		},
		{
			element: '#tour-welcome-theme',
			popover: {
				title: 'Tema Claro/Escuro',
				description: 'Alterne entre os temas a qualquer momento.',
				side: 'bottom',
			},
		},
		{
			element: '#tour-welcome-account',
			popover: {
				title: 'Sua Conta',
				description: 'Acesse seu perfil, gerencie usuários (se você for administrador) e saia da plataforma por aqui. Você pode refazer os tours guiados de cada tela a qualquer momento clicando em "Tour Guiado".',
				side: 'bottom',
				align: 'end',
			},
		},
	]);

	useEffect(() => {
		if (isPending || !user) return;
		if (typeof window === 'undefined') return;
		if (window.localStorage.getItem(WELCOME_TOUR_STORAGE_KEY)) return;

		// Pequeno delay para garantir que o header já pintou antes de calcular as posições.
		const timer = setTimeout(() => {
			window.localStorage.setItem(WELCOME_TOUR_STORAGE_KEY, 'true');
			startWelcomeTour();
		}, 600);

		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isPending, user]);

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
					<div className="flex items-center gap-10">
						<div id="tour-welcome-logo" className="flex items-center">
							<Link href='/system/dashboard'>
								{/* Logo renderizado no tema claro */}
								<LogoPrimarioClaro className='block dark:hidden w-40 h-20' />
								{/* Logo renderizado no tema escuro */}
								<LogoPrimarioEscuro className='hidden dark:block w-40 h-20' />
							</Link>
						</div>

						<nav id="tour-welcome-nav" className="hidden md:flex items-center space-x-1">
							{navItems.map((item) => {
								const isActive = pathname?.startsWith(item.path);
								return (
									<Link
										key={item.path}
										href={item.path}
										className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${isActive
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
						<div id="tour-welcome-bell" className="flex">
							<NotificationBell />
						</div>
						<div id="tour-welcome-theme" className="flex">
							<ThemeToggle />
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									id="tour-welcome-account"
									variant="ghost"
									className="relative h-9 rounded-full pl-2 pr-4 border border-border/50 hover:bg-secondary/50 cursor-pointer"
								>
									<div className="flex items-center gap-2">
										<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
											<UserIcon className="h-3 w-3 text-primary" />
										</div>
										<span className="text-sm font-medium">
											{user?.name?.split(' ')[0] || 'Conta'}
										</span>
									</div>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">{user?.name}</p>
										<p className="text-xs leading-none text-muted-foreground">
											{(user?.role === 'super_admin' || user?.role === 'admin') ? 'Administrador' : 'Usuário Padrão'}
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

								{(user?.role === 'super_admin' || user?.role === 'admin') && (
									<>
										<DropdownMenuItem asChild>
											<Link href="/system/users" className="cursor-pointer flex w-full">
												<Settings className="mr-2 h-4 w-4" />
												<span>Gerenciar Usuários</span>
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link href="/system/alerts" className="cursor-pointer flex w-full">
												<AlertCircle className="mr-2 h-4 w-4" />
												<span>Alertas Globais</span>
											</Link>
										</DropdownMenuItem>
									</>
								)}

								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-destructive focus:text-destructive cursor-pointer flex w-full"
									onClick={() =>
										authClient.signOut({
											fetchOptions: { onSuccess: () => router.push('/auth/sign-in') },
										})
									}
								>
									<LogOut className="mr-2 h-4 w-4" />
									<span>Sair da plataforma</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<Button
							variant="ghost"
							className="md:hidden p-2"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						>
							{isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						</Button>
					</div>
				</div>

				{/* Mobile Navigation Menu */}
				{isMobileMenuOpen && (
					<nav className="md:hidden border-t bg-card px-4 py-4 space-y-1">
						{navItems.map((item) => {
							const isActive = pathname?.startsWith(item.path);
							return (
								<Link
									key={item.path}
									href={item.path}
									onClick={() => setIsMobileMenuOpen(false)}
									className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive
										? 'bg-secondary text-secondary-foreground'
										: 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
										}`}
								>
									{item.name}
								</Link>
							);
						})}
					</nav>
				)}
			</header>

			{/* Main Content Viewport */}
			<main className="flex-1 overflow-y-auto">
				<div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8">{children}</div>
			</main>
		</div>
	);
}
