'use client';

import {
	LayoutDashboard,
	KeyRound,
	Code,
	FileText,
	History,
	SquareTerminal,
	CogIcon,
	Users,
} from 'lucide-react';
import { GrServices } from 'react-icons/gr';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/src/lib/auth-client';

interface AppUser {
	id: string;
	name: string;
	isAdmin: boolean;
}

export default function LeftPanel() {
	const pathname = usePathname();
	const [mounted, setMounted] = useState(false);
	const { data: session } = authClient.useSession();
	
	const user = session?.user as AppUser | undefined;
	const isAdmin = Boolean(user?.isAdmin);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isActive = (path: string) => {
		return pathname?.startsWith(`/system/${path}`);
	};

	if (!mounted) return <div className="w-64 border-r border-border-subtle bg-surface h-full" />;

	return (
		<aside className="w-64 bg-surface border-r border-border-subtle text-text-primary p-6 flex flex-col h-full overflow-y-auto shrink-0 z-50">
			<div className="flex flex-row items-center gap-3 mb-10">
				<div className="bg-primary/10 p-2 rounded-xl">
					<img className="w-10 h-10" src="/hermes-icon.svg" alt="Hermes Icon" />
				</div>
				<div className="flex flex-col items-start justify-center gap-0">
					<h1 className="font-bold text-xl tracking-tight">Hermes</h1>
					<p className="text-[10px] uppercase tracking-wider text-text-secondary font-medium text-left">
						Mail Engine
					</p>
				</div>
			</div>

			<div className="flex flex-col justify-between flex-grow">
				<nav className="flex flex-col gap-1.5 text-left">
					<p className="text-[10px] font-bold text-text-secondary uppercase px-3 mb-2 tracking-widest text-left">
						Geral
					</p>

					<Link
						href="/system/dashboard"
						className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
							isActive('dashboard')
								? 'bg-primary text-white shadow-lg shadow-primary/20'
								: 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
						}`}
					>
						<LayoutDashboard size={18} /> Dashboard
					</Link>

					<Link
						href="/system/services"
						className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
							isActive('services')
								? 'bg-primary text-white shadow-lg shadow-primary/20'
								: 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
						}`}
					>
						<GrServices size={18} /> Serviços
					</Link>

					<p className="text-[10px] font-bold text-text-secondary uppercase px-3 mt-6 mb-2 tracking-widest text-left">
						Monitoramento
					</p>

					<Link
						href="/system/templates"
						className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
							isActive('templates')
								? 'bg-primary text-white shadow-lg shadow-primary/20'
								: 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
						}`}
					>
						<FileText size={18} /> Templates
					</Link>

					{isAdmin && (
						<>
							<Link
								href="/system/sandbox"
								className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
									isActive('sandbox')
										? 'bg-primary text-white shadow-lg shadow-primary/20'
										: 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
								}`}
							>
								<SquareTerminal size={18} /> Sandbox
							</Link>

							<Link
								href="/system/logs"
								className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
									isActive('logs')
										? 'bg-primary text-white shadow-lg shadow-primary/20'
										: 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
								}`}
							>
								<History size={18} /> Logs
							</Link>

							<p className="text-[10px] font-bold text-text-secondary uppercase px-3 mt-6 mb-2 tracking-widest text-left">
								Administração
							</p>

							<Link
								href="/system/users"
								className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
									isActive('users')
										? 'bg-primary text-white shadow-lg shadow-primary/20'
										: 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
								}`}
							>
								<Users size={18} /> Usuários
							</Link>
						</>
					)}
				</nav>

				<div className="flex flex-col gap-2 mt-auto pt-6 border-t border-border-subtle/50 text-left">
					<Link
						href="/system/profile"
						className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
							isActive('profile')
								? 'bg-primary text-white'
								: 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
						}`}
					>
						<div className="w-6 h-6 rounded-full overflow-hidden border border-white/10">
							<img
								className="w-full h-full object-cover"
								src="/no-profile-photo.svg"
								alt="Profile"
							/>
						</div>
						Perfil
					</Link>
				</div>
			</div>
		</aside>
	);
}
