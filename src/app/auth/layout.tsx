import type { Metadata } from 'next';
import { Documentacao, Status, Privacidade, Version } from '@/src/constants/links';

export const metadata: Metadata = {
	title: 'Hermes | Autenticação',
};

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 w-full relative">
			<div className="absolute top-12 flex flex-col items-center gap-2">
				<div className="bg-primary/10 p-3 rounded-2xl">
					<img className="w-10 h-10" src="/hermes-icon1.svg" alt="Hermes Logo" />
				</div>
				<h1 className="text-2xl font-black tracking-tight">Hermes</h1>
			</div>

			<div className="flex-1 flex flex-col justify-center items-center w-full mt-20 mb-10">
				{children}
			</div>

			<div className="flex flex-col items-center gap-4 text-xs text-muted-foreground mt-auto">
				<div className="flex items-center gap-6">
					<a href={Documentacao} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Documentação</a>
					<a href={Status} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Status API</a>
					<a href={Privacidade} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Privacidade</a>
				</div>
				<p>Hermes - v{Version}</p>
			</div>
		</main>
	);
}
