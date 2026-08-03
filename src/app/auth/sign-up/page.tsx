'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

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

export default function SignUpPage() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const router = useRouter();

	async function handleSignUp(e?: React.FormEvent) {
		if (e) e.preventDefault();
		if (password !== confirmPassword) {
			setError('As senhas não coincidem.');
			return;
		}

		setLoading(true);
		setError('');

		try {
			const { error: authError } = await authClient.signUp.email({
				email,
				password,
				name,
			});

			if (authError) {
				setError(authError.message || 'Não foi possível criar a conta. Tente novamente.');
			} else {
				router.push('/system/dashboard');
			}
		} catch {
			setError('Não foi possível conectar ao servidor. Tente novamente.');
		} finally {
			setLoading(false);
		}
	}

	async function handleGoogleSignUp() {
		try {
			await authClient.signIn.social({
				provider: 'google',
				callbackURL: window.location.origin + '/system/dashboard',
			});
		} catch {
			setError('Erro ao iniciar cadastro com Google. Tente novamente.');
		}
	}

	async function handleGitHubSignUp() {
		try {
			await authClient.signIn.social({
				provider: 'github',
				callbackURL: window.location.origin + '/system/dashboard',
			});
		} catch {
			setError('Erro ao iniciar cadastro com GitHub. Tente novamente.');
		}
	}

	return (
		<div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
			<Card className="shadow-md ring-1 ring-border/60">
				<CardHeader className="space-y-1 text-center pb-2">
					<CardTitle className="text-2xl font-semibold tracking-tight">Criar Conta</CardTitle>
					<CardDescription>Junte-se ao Hermes e gerencie seus e-mails transacionais.</CardDescription>
				</CardHeader>

				<CardContent className="pt-4">
					<form onSubmit={handleSignUp} className="space-y-4">
						{error && (
							<div className="flex items-start gap-2.5 p-3 text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-xl">
								<AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
								<span>{error}</span>
							</div>
						)}

						<div className="space-y-1.5">
							<label htmlFor="name" className="text-sm font-medium">
								Nome Completo
							</label>
							<Input
								id="name"
								type="text"
								placeholder="João da Silva"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="h-10"
								autoComplete="name"
								required
							/>
						</div>

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

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<label htmlFor="password" className="text-sm font-medium">
									Senha
								</label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? 'text' : 'password'}
										placeholder="Crie uma senha"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="h-10 pr-10"
										autoComplete="new-password"
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword((v) => !v)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
										aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
									>
										{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
							</div>

							<div className="space-y-1.5">
								<label htmlFor="confirmPassword" className="text-sm font-medium">
									Repetir Senha
								</label>
								<div className="relative">
									<Input
										id="confirmPassword"
										type={showConfirm ? 'text' : 'password'}
										placeholder="Repita a senha"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className="h-10 pr-10"
										autoComplete="new-password"
										required
									/>
									<button
										type="button"
										onClick={() => setShowConfirm((v) => !v)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
										aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
									>
										{showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2.5 text-xs text-muted-foreground bg-muted/60 px-3 py-2.5 rounded-xl">
							<ShieldCheck className="h-4 w-4 text-success shrink-0" />
							<span>Suas credenciais são criptografadas de ponta-a-ponta.</span>
						</div>

						<Button type="submit" className="w-full h-10" disabled={loading}>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Criando conta…
								</>
							) : (
								'Criar Conta Gratuita'
							)}
						</Button>
					</form>

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs">
							<span className="bg-card px-2.5 text-muted-foreground">ou cadastrar com</span>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<Button variant="outline" type="button" onClick={handleGitHubSignUp} disabled={loading} className="h-10">
							<FaGithub className="mr-2 h-4 w-4" />
							GitHub
						</Button>
						<Button variant="outline" type="button" onClick={handleGoogleSignUp} disabled={loading} className="h-10">
							<FaGoogle className="mr-2 h-4 w-4" />
							Google
						</Button>
					</div>
				</CardContent>

				<CardFooter className="justify-center bg-transparent border-t-0 pt-0">
					<p className="text-sm text-muted-foreground">
						Já tem uma conta?{' '}
						<Link href="/auth/sign-in" className="font-semibold text-primary hover:underline">
							Fazer Login
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
