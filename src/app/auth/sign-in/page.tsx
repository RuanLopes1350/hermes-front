'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';

import { authClient } from '@/src/lib/auth-client';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';


export default function SignInPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
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
				setError(authError.message || 'Erro ao realizar login.');
			} else if ((data?.user as any)?.isActive === false) {
				await authClient.signOut();
				setError('Sua conta foi suspensa pelo administrador. Contate o suporte.');
			} else {
				router.push('/system/dashboard');
			}
		} catch (err) {
			setError('Erro interno do servidor.');
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
		} catch (err) {
			setError('Erro ao iniciar login com Google.');
		}
	}

	return (
		<div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
			<Card>
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl font-bold tracking-tight">Acesso à Plataforma</CardTitle>
					<CardDescription>
						Digite seu e-mail e senha para entrar no Hermes.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSignIn} className="space-y-4">
						{error && (
							<div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
								{error}
							</div>
						)}
						<div className="space-y-2">
							<label htmlFor="email" className="text-sm font-medium leading-none">E-mail corporativo</label>
							<Input 
								id="email" 
								type="email" 
								placeholder="exemplo@empresa.com" 
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required 
							/>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<label htmlFor="password" className="text-sm font-medium leading-none">Senha</label>
								<Link href="/auth/recovery" className="text-sm font-medium text-primary hover:underline">
									Esqueceu a senha?
								</Link>
							</div>
							<Input 
								id="password" 
								type="password" 
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required 
							/>
						</div>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Entrar
						</Button>
					</form>

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">Ou continuar com</span>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<Button variant="outline" type="button" disabled={loading}>
							<FaGithub className="mr-2 h-4 w-4" />
							GitHub
						</Button>
						<Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={loading}>
							<FaGoogle className="mr-2 h-4 w-4" />
							Google
						</Button>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4 text-center">
					<div className="text-sm text-muted-foreground">
						Ainda não tem uma conta?{' '}
						<Link href="/auth/sign-up" className="font-semibold text-primary hover:underline">
							Criar conta gratuita
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
