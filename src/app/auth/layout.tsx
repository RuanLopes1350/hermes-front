import type { Metadata } from 'next';
import { Documentacao, Tutorial, Privacidade, Version } from '@/src/constants/links';
import { ThemeToggle } from '@/src/components/theme-toggle';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Hermes | Autenticação',
};

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<main className="min-h-screen flex flex-col items-center bg-background px-4 py-8 sm:py-16 w-full relative">
			<div className="absolute top-4 right-4 sm:top-6 sm:right-6">
				<ThemeToggle />
			</div>

			<div className="flex flex-col items-center gap-3 mb-10">
				<div className="bg-primary/10 p-3 rounded-xl shadow-sm ring-1 ring-primary/15">
					<img className="w-10 h-10" src="/hermes-icon.svg" alt="Hermes Logo" />
				</div>
				<span className="font-extrabold text-3xl tracking-tight text-foreground">
					Hermes
				</span>
			</div>

			<div className="w-full max-w-md flex-1 flex flex-col justify-center">{children}</div>

			<div className="flex flex-col items-center gap-3 text-xs text-muted-foreground mt-12">
				<div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
					<a
						href={Documentacao}
						target="_blank"
						rel="noreferrer"
						className="hover:text-primary transition-colors"
					>
						Documentação
					</a>
					<Link
						href={Tutorial}
						target="_blank"
						rel="noreferrer"
						className="hover:text-primary transition-colors"
					>
						Tutorial
					</Link>
					<a
						href={Privacidade}
						target="_blank"
						rel="noreferrer"
						className="hover:text-primary transition-colors"
					>
						Privacidade
					</a>
				</div>
				<p>Hermes v{Version} · © {new Date().getFullYear()} Hermes. Todos os direitos reservados.</p>
			</div>
		</main>
	);
}
