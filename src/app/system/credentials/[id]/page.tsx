'use client';

import {
	ArrowLeft,
	Server,
	Lock,
	Eye,
	EyeOff,
	Save,
	Trash2,
	CheckCircle2,
	AlertCircle,
	Mail,
	ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';

export default function CredentialDetailsPage() {
	const [name, setName] = useState('SMTP Corporativo');
	const [showPassword, setShowPassword] = useState(false);
	const [testing, setTesting] = useState(false);

	return (
		<div className="space-y-12 text-left">
			<div className="flex items-center gap-4">
				<Link href="/system/credentials">
					<Button
						variant="outline"
						size="icon"
						className="h-12 w-12 rounded-2xl bg-surface border-border-subtle text-muted-foreground hover:text-primary group"
					>
						<ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
					</Button>
				</Link>
				<div>
					<div className="flex items-center gap-3 mb-1">
						<h2 className="text-3xl font-bold tracking-tight uppercase text-foreground">{name}</h2>
						<Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-widest px-3 py-1">
							SMTP
						</Badge>
					</div>
					<p className="text-muted-foreground text-sm font-medium italic">
						Configure os parâmetros de autenticação do seu servidor de e-mail.
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2">
					<Card className="bg-surface border-border-subtle rounded-[40px] overflow-hidden border">
						<CardHeader className="p-10 border-b border-border-subtle bg-background/30 flex flex-row items-center justify-between space-y-0">
							<CardTitle className="text-xl font-bold italic uppercase tracking-tighter text-foreground flex items-center gap-3">
								<Lock size={24} className="text-primary" /> Parâmetros de Acesso
							</CardTitle>
							<Button
								onClick={() => setTesting(true)}
								variant="outline"
								className="bg-success/10 text-success border-none text-[10px] font-black uppercase tracking-widest hover:bg-success/20 h-10 gap-2"
							>
								{testing ? 'Testando...' : 'Testar Conexão'}
								<ShieldCheck size={16} />
							</Button>
						</CardHeader>

						<CardContent className="p-10 space-y-8">
							<div className="space-y-3 text-left">
								<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
									Nome da Credencial
								</label>
								<Input
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="bg-background border-border-subtle rounded-2xl px-6 py-7 text-base focus:border-primary transition-all font-medium italic h-14"
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
								<div className="md:col-span-3 space-y-3 text-left">
									<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
										Host SMTP
									</label>
									<Input
										defaultValue="smtp.exemplo.com"
										className="bg-background border-border-subtle rounded-2xl px-6 py-7 text-base focus:border-primary transition-all font-medium italic h-14"
									/>
								</div>
								<div className="space-y-3 text-left">
									<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
										Porta
									</label>
									<Input
										defaultValue="587"
										className="bg-background border-border-subtle rounded-2xl px-6 py-7 text-base focus:border-primary transition-all font-medium italic h-14"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div className="space-y-3 text-left">
									<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
										Usuário / Email
									</label>
									<Input
										defaultValue="envio@exemplo.com"
										className="bg-background border-border-subtle rounded-2xl px-6 py-7 text-base focus:border-primary transition-all font-medium italic h-14"
									/>
								</div>
								<div className="space-y-3 text-left">
									<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
										Senha / Token
									</label>
									<div className="relative">
										<Input
											type={showPassword ? 'text' : 'password'}
											defaultValue="********"
											className="bg-background border-border-subtle rounded-2xl pl-6 pr-14 py-7 text-base focus:border-primary transition-all font-medium italic h-14"
										/>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
										>
											{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
										</Button>
									</div>
								</div>
							</div>

							<div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl flex items-start gap-4 text-left">
								<AlertCircle className="text-primary mt-1" size={20} />
								<div>
									<p className="text-xs font-bold text-foreground uppercase tracking-tight mb-1">
										Dica de Segurança
									</p>
									<p className="text-muted-foreground text-[11px] italic leading-relaxed">
										Para contas Gmail, utilize uma "Senha de App" em vez da sua senha principal.
										Certifique-se de que o Host aceita conexões TLS/SSL.
									</p>
								</div>
							</div>
						</CardContent>

						<CardContent className="p-10 bg-background/30 border-t border-border-subtle flex flex-col md:flex-row gap-4">
							<Button className="flex-1 py-7 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-hover h-14 gap-2">
								Salvar Alterações <Save size={18} />
							</Button>
							<Button
								variant="outline"
								className="px-8 py-7 rounded-2xl bg-danger/10 text-danger border-none text-xs font-black uppercase tracking-[0.2em] hover:bg-danger/20 h-14 gap-2"
							>
								Excluir Credencial <Trash2 size={18} />
							</Button>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-8">
					<Card className="bg-surface border-border-subtle rounded-3xl p-8 space-y-6 text-center border">
						<div className="w-20 h-20 bg-primary/10 text-primary rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-primary/20">
							<Server size={40} />
						</div>
						<div className="text-center">
							<CardTitle className="font-bold text-lg text-foreground uppercase tracking-tighter">
								Status do Host
							</CardTitle>
							<CardDescription className="text-muted-foreground text-xs italic mt-1">
								Verificado há 10 minutos
							</CardDescription>
						</div>
						<div className="flex items-center justify-center gap-2 text-success font-bold text-sm">
							<CheckCircle2 size={16} /> Online e Pronto
						</div>
					</Card>

					<Card className="bg-surface border-border-subtle rounded-3xl p-8 space-y-6 border text-left">
						<CardHeader className="p-0">
							<CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
								<Mail size={14} className="text-primary" /> Uso da Credencial
							</CardTitle>
						</CardHeader>

						<CardContent className="p-0 space-y-4">
							<div className="flex justify-between items-center">
								<p className="text-xs text-muted-foreground italic font-medium">
									Serviços Vinculados
								</p>
								<p className="text-sm font-bold text-foreground">2</p>
							</div>
							<div className="flex justify-between items-center">
								<p className="text-xs text-muted-foreground italic font-medium">Total de Envios</p>
								<p className="text-sm font-bold text-foreground">12,450</p>
							</div>
							<div className="flex justify-between items-center">
								<p className="text-xs text-muted-foreground italic font-medium">Taxa de Sucesso</p>
								<p className="text-sm font-bold text-success">100%</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
