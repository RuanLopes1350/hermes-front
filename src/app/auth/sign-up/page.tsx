'use client';

import Input from '@/src/components/input';
import ButtonInput from '@/src/components/button-input';
import Button from '@/src/components/button';
import { ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import { GitHub, Version, Documentacao, Privacidade, Status } from '@/src/constants/links';
import { useState } from 'react';
import { authClient } from '@/src/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const router = useRouter();

	async function handleSignUp() {
		if (password !== confirmPassword) {
			setError('As senhas não coincidem.');
			return;
		}

		setLoading(true);
		setError('');

		try {
			const { data, error } = await authClient.signUp.email({
				email,
				password,
				name,
			});

			if (error) {
				setError(error.message || 'Erro ao criar conta.');
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
		<div className="flex flex-col items-center w-full max-w-screen-xl mx-auto px-6 py-12 gap-12">
			{/* Logo & Hero Section */}
			<div className="flex flex-col items-center text-center space-y-4">
				<div className="bg-primary/10 p-4 rounded-3xl border border-primary/20 shadow-2xl shadow-primary/10">
					<img className="w-16 h-16" src="/hermes-icon.svg" alt="Hermes Logo" />
				</div>
				<div>
					<h1 className="text-text-primary font-black text-6xl tracking-tighter">Hermes</h1>
					<p className="text-text-secondary text-lg font-medium tracking-tight">
						Crie sua conta na infraestrutura de e-mails
					</p>
				</div>
			</div>

			{/* Register Card */}
			<div className="w-full max-w-lg bg-surface p-10 border border-border-subtle rounded-3xl shadow-2xl relative overflow-hidden group">
				<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

				<div className="mb-10 text-center">
					<h2 className="text-text-primary text-3xl font-bold tracking-tight">Nova Conta</h2>
					<p className="text-text-secondary text-sm font-medium mt-1">
						Junte-se a centenas de desenvolvedores
					</p>
				</div>

				<div className="flex flex-col gap-6">
					{error && (
						<div className="bg-danger/10 border border-danger/20 text-danger text-xs p-3 rounded-lg font-medium">
							{error}
						</div>
					)}

					<Input
						type="text"
						label="Nome Completo"
						placeholder="Como devemos te chamar?"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>

					<Input
						type="email"
						label="E-mail profissional"
						placeholder="exemplo@empresa.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>

					<div className="grid grid-cols-2 gap-6">
						<Input
							type="password"
							label="Senha"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Input
							type="password"
							label="Confirmar"
							placeholder="••••••••"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
					</div>

					<div className="flex items-center gap-2 px-1">
						<ShieldCheck size={14} className="text-success" />
						<p className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">
							Sua senha está protegida por criptografia de ponta
						</p>
					</div>

					<ButtonInput
						label={loading ? 'Criando conta...' : 'Criar Conta Gratuita'}
						labelIcon={
							loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />
						}
						containerClassName="mt-4"
						onClick={handleSignUp}
					/>
				</div>

				<div className="flex items-center gap-4 my-8">
					<div className="flex-1 h-px bg-border-subtle/50"></div>
					<p className="text-[10px] font-bold text-text-secondary/50 tracking-widest whitespace-nowrap">
						OU CADASTRAR COM
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

				<div className="mt-10 text-center border-t border-border-subtle/30 pt-8">
					<p className="text-text-secondary text-sm font-medium">
						Já possui uma conta?{' '}
						<Link href="/auth/sign-in" className="text-primary font-bold hover:underline">
							Fazer login
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
				</div>
			</div>
		</div>
	);
}
