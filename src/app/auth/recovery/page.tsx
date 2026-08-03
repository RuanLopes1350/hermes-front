'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';

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

export default function RecoveryPage() {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [sent, setSent] = useState(false);

	async function handleRecovery(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const { error: authError } = await (authClient as any).requestPasswordReset({
				email,
				redirectTo: window.location.origin + '/auth/new-password',
			});

			if (authError) {
				setError(authError.message || 'Não foi possível enviar o link. Verifique o e-mail e tente novamente.');
			} else {
				setSent(true);
			}
		} catch {
			setError('Não foi possível conectar ao servidor. Tente novamente.');
		} finally {
			setLoading(false);
		}
	}

	if (sent) {
		return (
			<div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
				<Card className="shadow-md ring-1 ring-border/60">
					<CardContent className="flex flex-col items-center gap-4 py-10 text-center">
						<div className="flex items-center justify-center w-14 h-14 rounded-full bg-success/10 ring-1 ring-success/20">
							<CheckCircle2 className="h-7 w-7 text-success" />
						</div>
						<div className="space-y-1.5 max-w-xs">
							<p className="text-base font-semibold text-foreground">Link enviado!</p>
							<p className="text-sm text-muted-foreground">
								Verifique sua caixa de entrada em <span className="font-medium text-foreground">{email}</span>.
								O link expira em 1 hora.
							</p>
						</div>
						<Link
							href="/auth/sign-in"
							className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-2"
						>
							<ArrowLeft className="h-3.5 w-3.5" />
							Voltar para o Login
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
					<CardTitle className="text-2xl font-semibold tracking-tight">Recuperar Acesso</CardTitle>
					<CardDescription>
						Enviaremos um link seguro para o e-mail cadastrado.
					</CardDescription>
				</CardHeader>

				<CardContent className="pt-4">
					<form onSubmit={handleRecovery} className="space-y-4">
						{error && (
							<div className="flex items-start gap-2.5 p-3 text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-xl">
								<AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
								<span>{error}</span>
							</div>
						)}

						<div className="space-y-1.5">
							<label htmlFor="email" className="text-sm font-medium">
								E-mail cadastrado
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
								<Input
									id="email"
									type="email"
									placeholder="exemplo@empresa.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="h-10 pl-9"
									autoComplete="email"
									required
								/>
							</div>
						</div>

						<Button type="submit" className="w-full h-10" disabled={loading}>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Enviando…
								</>
							) : (
								'Enviar Link de Recuperação'
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
