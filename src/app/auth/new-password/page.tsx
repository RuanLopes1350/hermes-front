'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';


export default function NewPasswordPage() {
	return (
		<div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
			<Card>
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl font-bold tracking-tight">Redefinir Senha</CardTitle>
					<CardDescription>
						Digite sua nova senha abaixo.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="password" className="text-sm font-medium leading-none">Nova Senha</label>
							<Input id="password" type="password" required />
						</div>
						<div className="space-y-2">
							<label htmlFor="confirm" className="text-sm font-medium leading-none">Confirmar Nova Senha</label>
							<Input id="confirm" type="password" required />
						</div>
						<Button type="button" className="w-full">
							Salvar Senha
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4 text-center">
					<div className="text-sm text-muted-foreground">
						<Link href="/auth/sign-in" className="flex items-center justify-center font-medium hover:text-primary transition-colors">
							<ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Login
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
