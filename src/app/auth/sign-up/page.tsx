'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { Loader2, ShieldCheck } from 'lucide-react';

import { authClient } from '@/src/lib/auth-client';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';


export default function SignUpPage() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
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
				setError(authError.message || 'Erro ao criar conta.');
			} else {
				router.push('/system/dashboard');
			}
		} catch (err) {
			setError('Erro interno do servidor.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
			<Card>
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl font-bold tracking-tight">Criar Conta</CardTitle>
					<CardDescription>
						Junte-se ao Hermes e gerencie seus e-mails.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSignUp} className="space-y-4">
						{error && (
							<div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
								{error}
							</div>
						)}
						<div className="space-y-2">
							<label htmlFor="name" className="text-sm font-medium leading-none">Nome Completo</label>
							<Input 
								id="name" 
								type="text" 
								placeholder="John Doe" 
								value={name}
								onChange={(e) => setName(e.target.value)}
								required 
							/>
						</div>
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
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label htmlFor="password" className="text-sm font-medium leading-none">Senha</label>
								<Input 
									id="password" 
									type="password" 
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required 
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="confirmPassword" className="text-sm font-medium leading-none">Confirmar</label>
								<Input 
									id="confirmPassword" 
									type="password" 
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required 
								/>
							</div>
						</div>
						
						<div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-2 rounded-md">
							<ShieldCheck className="h-4 w-4 text-emerald-500" />
							<span>Suas credenciais são criptografadas de ponta-a-ponta.</span>
						</div>

						<Button type="submit" className="w-full" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Criar Conta Gratuita
						</Button>
					</form>

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">Ou cadastrar com</span>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<Button variant="outline" type="button" disabled={loading}>
							<FaGithub className="mr-2 h-4 w-4" />
							GitHub
						</Button>
						<Button variant="outline" type="button" disabled={loading}>
							<FaGoogle className="mr-2 h-4 w-4" />
							Google
						</Button>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4 text-center">
					<div className="text-sm text-muted-foreground">
						Já tem uma conta?{' '}
						<Link href="/auth/sign-in" className="font-semibold text-primary hover:underline">
							Fazer Login
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
