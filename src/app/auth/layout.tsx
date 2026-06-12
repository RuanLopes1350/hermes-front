import type { Metadata } from 'next';
import { Documentacao, Status, Privacidade, Version } from '@/src/constants/links';
import { ThemeToggle } from '@/src/components/theme-toggle';

export const metadata: Metadata = {
	title: 'Hermes | Autenticação',
};

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<main className="min-h-screen flex flex-col items-center bg-slate-50 dark:bg-zinc-950 px-4 py-8 sm:py-12 w-full relative">
			<div className="absolute top-4 right-4 sm:top-6 sm:right-6">
				<ThemeToggle />
			</div>
			<div className="flex flex-col items-center gap-2 mb-8 mt-4 sm:mt-8">
				<div className="bg-primary/10 p-3 rounded-2xl">
					<img className="w-10 h-10" src="/hermes-icon1.svg" alt="Hermes Logo" />
				</div>
				<h1 className="text-2xl font-black tracking-tight">Hermes</h1>
			</div>

			<div className="w-full max-w-md flex-1 flex flex-col justify-center">{children}</div>

			<div className="flex flex-col items-center gap-4 text-xs text-muted-foreground mt-8">
				<div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
					<a
						href={Documentacao}
						target="_blank"
						rel="noreferrer"
						className="hover:text-primary transition-colors"
					>
						Documentação
					</a>
					<a
						href={Status}
						target="_blank"
						rel="noreferrer"
						className="hover:text-primary transition-colors"
					>
						Status API
					</a>
					<a
						href={Privacidade}
						target="_blank"
						rel="noreferrer"
						className="hover:text-primary transition-colors"
					>
						Privacidade
					</a>
				</div>
				<p>Hermes - v{Version}</p>
				<p>© {new Date().getFullYear()} Hermes. Todos os direitos reservados.</p>
			</div>
		</main>
	);
}
