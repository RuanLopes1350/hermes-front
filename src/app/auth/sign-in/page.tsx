'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

import { authClient } from '@/src/lib/auth-client';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/src/components/ui/card';

export default function SignInPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const router = useRouter();

	async function handleSignIn(e?: React.FormEvent) {
		if (e) e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const { data, error: authError } = await authClient.signIn.email({
				email,
				password,
			});

			if (authError) {
				setError(authError.message || 'Credenciais inválidas. Verifique e-mail e senha.');
			} else if ((data?.user as any)?.isActive === false) {
				await authClient.signOut();
				setError('Sua conta foi suspensa pelo administrador. Contate o suporte.');
			} else {
				router.push('/system/dashboard');
			}
		} catch {
			setError('Não foi possível conectar ao servidor. Tente novamente.');
		} finally {
			setLoading(false);
		}
	}

	async function handleGoogleSignIn() {
		try {
			await authClient.signIn.social({
				provider: 'google',
				callbackURL: window.location.origin + '/system/dashboard',
			});
		} catch {
			setError('Erro ao iniciar login com Google. Tente novamente.');
		}
	}

	async function handleGitHubSignIn() {
		try {
			await authClient.signIn.social({
				provider: 'github',
				callbackURL: window.location.origin + '/system/dashboard',
			});
		} catch {
			setError('Erro ao iniciar login com GitHub. Tente novamente.');
		}
	}

	return (
		<div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
			<Card className="shadow-md ring-1 ring-border/60">
				<CardHeader className="space-y-1 text-center pb-2">
					<CardTitle className="text-2xl font-semibold tracking-tight">Acesso à Plataforma</CardTitle>
					<CardDescription>Digite seu e-mail e senha para entrar no Hermes.</CardDescription>
				</CardHeader>

				<CardContent className="pt-4">
					<form onSubmit={handleSignIn} className="space-y-4">
						{error && (
							<div className="flex items-start gap-2.5 p-3 text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-xl">
								<AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
								<span>{error}</span>
							</div>
						)}

						<div className="space-y-1.5">
							<label htmlFor="email" className="text-sm font-medium">
								E-mail
							</label>
							<Input
								id="email"
								type="email"
								placeholder="exemplo@empresa.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="h-10"
								autoComplete="email"
								required
							/>
						</div>

						<div className="space-y-1.5">
							<div className="flex items-center justify-between">
								<label htmlFor="password" className="text-sm font-medium">
									Senha
								</label>
								<Link
									href="/auth/recovery"
									className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
								>
									Esqueceu a senha?
								</Link>
							</div>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? 'text' : 'password'}
									placeholder="Digite sua senha"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="h-10 pr-10"
									autoComplete="current-password"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						<Button type="submit" className="w-full h-10" disabled={loading}>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Entrando…
								</>
							) : (
								'Entrar'
							)}
						</Button>
					</form>

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs">
							<span className="bg-card px-2.5 text-muted-foreground">ou continuar com</span>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<Button variant="outline" type="button" onClick={handleGitHubSignIn} disabled={loading} className="h-10">
							<FaGithub className="mr-2 h-4 w-4" />
							GitHub
						</Button>
						<Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={loading} className="h-10">
							<FaGoogle className="mr-2 h-4 w-4" />
							Google
						</Button>
					</div>
				</CardContent>

				<CardFooter className="justify-center bg-transparent border-t-0 pt-0">
					<p className="text-sm text-muted-foreground">
						Ainda não tem uma conta?{' '}
						<Link href="/auth/sign-up" className="font-semibold text-primary hover:underline">
							Criar conta gratuita
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
