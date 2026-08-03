'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';

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

export default function NewPasswordPage() {
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get('token') ?? '';

	async function handleNewPassword(e: React.FormEvent) {
		e.preventDefault();

		if (password !== confirmPassword) {
			setError('As senhas não coincidem.');
			return;
		}
		if (password.length < 8) {
			setError('A senha deve ter no mínimo 8 caracteres.');
			return;
		}

		setLoading(true);
		setError('');

		try {
			const { error: authError } = await authClient.resetPassword({
				newPassword: password,
				token,
			});

			if (authError) {
				setError(authError.message || 'Não foi possível redefinir a senha. O link pode ter expirado.');
			} else {
				setSuccess(true);
				setTimeout(() => router.push('/auth/sign-in'), 3000);
			}
		} catch {
			setError('Não foi possível conectar ao servidor. Tente novamente.');
		} finally {
			setLoading(false);
		}
	}

	if (success) {
		return (
			<div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
				<Card className="shadow-md ring-1 ring-border/60">
					<CardContent className="flex flex-col items-center gap-4 py-10 text-center">
						<div className="flex items-center justify-center w-14 h-14 rounded-full bg-success/10 ring-1 ring-success/20">
							<CheckCircle2 className="h-7 w-7 text-success" />
						</div>
						<div className="space-y-1.5 max-w-xs">
							<p className="text-base font-semibold text-foreground">Senha redefinida!</p>
							<p className="text-sm text-muted-foreground">
								Sua senha foi atualizada com sucesso. Você será redirecionado para o login.
							</p>
						</div>
						<Link
							href="/auth/sign-in"
							className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-2"
						>
							Ir para o Login agora
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
			<Card className="shadow-md ring-1 ring-border/60">
				<CardHeader className="space-y-1 text-center pb-2">
					<CardTitle className="text-2xl font-semibold tracking-tight">Redefinir Senha</CardTitle>
					<CardDescription>
						Crie uma nova senha segura para sua conta Hermes.
					</CardDescription>
				</CardHeader>

				<CardContent className="pt-4">
					{!token && (
						<div className="flex items-start gap-2.5 p-3 mb-4 text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-xl">
							<AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
							<span>Link inválido ou expirado. Solicite um novo link de recuperação.</span>
						</div>
					)}

					<form onSubmit={handleNewPassword} className="space-y-4">
						{error && (
							<div className="flex items-start gap-2.5 p-3 text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-xl">
								<AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
								<span>{error}</span>
							</div>
						)}

						<div className="space-y-1.5">
							<label htmlFor="password" className="text-sm font-medium">
								Nova Senha
							</label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? 'text' : 'password'}
									placeholder="Mínimo 8 caracteres"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="h-10 pr-10"
									autoComplete="new-password"
									disabled={!token}
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
									aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
									disabled={!token}
								>
									{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
						</div>

						<div className="space-y-1.5">
							<label htmlFor="confirm" className="text-sm font-medium">
								Confirmar Nova Senha
							</label>
							<div className="relative">
								<Input
									id="confirm"
									type={showConfirm ? 'text' : 'password'}
									placeholder="Repita a senha"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="h-10 pr-10"
									autoComplete="new-password"
									disabled={!token}
									required
								/>
								<button
									type="button"
									onClick={() => setShowConfirm((v) => !v)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
									aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
									disabled={!token}
								>
									{showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
						</div>

						<Button type="submit" className="w-full h-10" disabled={loading || !token}>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Salvando…
								</>
							) : (
								'Salvar Nova Senha'
							)}
						</Button>
					</form>
				</CardContent>

				<CardFooter className="justify-center bg-transparent border-t-0 pt-0">
					<Link
						href="/auth/sign-in"
						className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
					>
						<ArrowLeft className="h-3.5 w-3.5" />
						Voltar para o Login
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}
