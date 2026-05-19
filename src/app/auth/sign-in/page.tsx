'use client';

import Input from '@/src/components/input';
import ButtonInput from '@/src/components/button-input';
import Button from '@/src/components/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import { GitHub, Version, Documentacao, Privacidade, Status } from '@/src/constants/links';
import { useState } from 'react';
import { authClient } from '@/src/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const router = useRouter();

	async function handleSignIn() {
		setLoading(true);
		setError('');

		try {
			const { data, error } = await authClient.signIn.email({
				email,
				password,
			});

			if (error) {
				setError(error.message || 'Erro ao realizar login.');
			} else {
				router.push('/system/dashboard');
			}
		} catch (err: any) {
			setError('Erro interno do servidor.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex flex-col items-center w-full max-w-7xl mx-auto px-6 py-12 gap-12">
			{/* Logo & Hero Section */}
			<div className="flex flex-col items-center text-center space-y-4">
				<div className="bg-primary/10 p-4 rounded-3xl border border-primary/20 shadow-2xl shadow-primary/10">
					<img className="w-16 h-16" src="/hermes-icon.svg" alt="Hermes Logo" />
				</div>
				<div>
					<h1 className="text-text-primary font-black text-6xl tracking-tighter">Hermes</h1>
					<p className="text-text-secondary text-lg font-medium tracking-tight">
						Lembrar de colocar um sub-titulo aqui
					</p>
				</div>
			</div>

			{/* Login Card */}
			<div className="w-full max-w-md bg-surface p-10 border border-border-subtle rounded-3xl shadow-2xl relative overflow-hidden group">
				<div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50"></div>

				<div className="mb-10 text-center">
					<h2 className="text-text-primary text-3xl font-bold tracking-tight">Bem-vindo</h2>
					<p className="text-text-secondary text-sm font-medium mt-1">
						Acesse sua conta para continuar
					</p>
				</div>

				<div className="flex flex-col gap-6">
					{error && (
						<div className="bg-danger/10 border border-danger/20 text-danger text-xs p-3 rounded-lg font-medium">
							{error}
						</div>
					)}

					<Input
						type="email"
						label="E-mail profissional"
						placeholder="exemplo@empresa.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>

					<div className="space-y-1">
						<Input
							type="password"
							label="Senha"
							secondaryLabel={
								<Link
									href="/auth/recovery"
									className="text-primary hover:text-primary-hover transition-colors"
								>
									Recuperar acesso
								</Link>
							}
							placeholder="Sua senha secreta"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>

					<ButtonInput
						label={loading ? 'Autenticando...' : 'Acessar Plataforma'}
						labelIcon={
							loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />
						}
						containerClassName="mt-4"
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								handleSignIn();
							}
						}}
						onClick={handleSignIn}
					/>
				</div>

				<div className="flex items-center gap-4 my-8">
					<div className="flex-1 h-px bg-border-subtle/50"></div>
					<p className="text-[10px] font-bold text-text-secondary/50 tracking-widest whitespace-nowrap">
						OU CONECTAR COM
					</p>
					<div className="flex-1 h-px bg-border-subtle/50"></div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Button
						label="GitHub"
						labelIcon={<FaGithub size={18} />}
						variant="outline"
						containerClassName="w-full"
					/>
					<Button
						label="Google"
						labelIcon={<FaGoogle size={18} />}
						variant="outline"
						containerClassName="w-full"
					/>
				</div>

				<div className="mt-10 text-center">
					<p className="text-text-secondary text-sm font-medium">
						Novo por aqui?{' '}
						<Link href="/auth/sign-up" className="text-primary font-bold hover:underline">
							Criar conta gratuita
						</Link>
					</p>
				</div>
			</div>

			{/* Footer Links */}
			<div className="flex flex-col items-center gap-6 text-[10px] font-bold tracking-widest text-text-secondary/60 uppercase">
				<div className="flex flex-row gap-10">
					<a
						href={Documentacao}
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-primary transition-colors"
					>
						Documentação
					</a>
					<a
						href={Status}
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-primary transition-colors"
					>
						Status
					</a>
					<a
						href={Privacidade}
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-primary transition-colors"
					>
						Privacidade
					</a>
				</div>
				<div className="text-center space-y-2">
					<p>Hermes Infrastructure © 2026 — v{Version}</p>
					<p className="opacity-50">
						Desenvolvido por{' '}
						<a
							href={GitHub}
							target="_blank"
							rel="noopener noreferrer"
							className="text-text-primary hover:text-primary underline decoration-primary/30"
						>
							Ruan Lopes
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
