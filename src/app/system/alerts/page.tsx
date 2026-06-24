'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/src/components/ui/card';
import { apiFetch } from '@/src/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminAlertsPage() {
	const {
		data: alerts = [],
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['admin-alerts'],
		queryFn: async () => {
			const res = await apiFetch('/api/notifications/admin?limit=100');
			if (!res.ok) throw new Error('Falha ao buscar alertas globais');
			return res.json();
		},
	});

	if (isLoading) {
		return (
			<div className="flex h-[50vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center text-center text-destructive">
				<AlertCircle className="h-10 w-10 mb-4" />
				<h2 className="text-xl font-bold">Acesso Negado</h2>
				<p>
					Você não tem permissão para visualizar os alertas globais ou ocorreu um erro na conexão.
				</p>
			</div>
		);
	}

	const getBadgeProps = (type: string) => {
		switch (type) {
			case 'error':
				return { variant: 'destructive' as const, icon: AlertCircle, label: 'Erro Crítico' };
			case 'warning':
				return {
					variant: 'default' as const,
					className: 'bg-yellow-500 hover:bg-yellow-600',
					icon: AlertTriangle,
					label: 'Aviso',
				};
			case 'success':
				return {
					variant: 'default' as const,
					className: 'bg-green-500 hover:bg-green-600',
					icon: CheckCircle2,
					label: 'Sucesso',
				};
			default:
				return { variant: 'secondary' as const, icon: Info, label: 'Informação' };
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Alertas Globais</h1>
				<p className="text-muted-foreground">
					Monitoramento de eventos em todo o ecossistema Hermes.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Histórico de Eventos</CardTitle>
					<CardDescription>
						Visão geral de todos os erros de webhook, rotações automatizadas e avisos do sistema.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Status</TableHead>
									<TableHead>Título</TableHead>
									<TableHead className="hidden md:table-cell">Mensagem</TableHead>
									<TableHead className="text-right">Data</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{alerts.length === 0 ? (
									<TableRow>
										<TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
											Nenhum alerta registrado no sistema.
										</TableCell>
									</TableRow>
								) : (
									alerts.map((alert: any) => {
										const { variant, className, icon: Icon, label } = getBadgeProps(alert.type);
										return (
											<TableRow key={alert.id}>
												<TableCell>
													<Badge variant={variant} className={className}>
														<Icon className="mr-1 h-3 w-3" />
														{label}
													</Badge>
												</TableCell>
												<TableCell className="font-medium">{alert.title}</TableCell>
												<TableCell
													className="hidden md:table-cell max-w-[400px] truncate text-muted-foreground"
													title={alert.message}
												>
													{alert.message}
												</TableCell>
												<TableCell className="text-right text-sm text-muted-foreground">
													{format(new Date(alert.createdAt), "dd/MM/yy 'às' HH:mm", {
														locale: ptBR,
													})}
												</TableCell>
											</TableRow>
										);
									})
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
