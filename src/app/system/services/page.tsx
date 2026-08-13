'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Server, Trash2, Pencil, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { useServices } from '@/src/hooks/use-services';
import { useTour } from '@/src/hooks/use-tour';
import { Service } from '@/src/types';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from '@/src/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/src/components/ui/dropdown-menu';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/src/components/ui/dialog';
import { ConfirmModal } from '@/src/components/ui/confirm-modal';

import { Badge } from '@/src/components/ui/badge';

export default function ServicesPage() {
	const { services, loading, processing, fetchServices, saveService, deleteService } =
		useServices();
	const [search, setSearch] = useState('');

	const [modalOpen, setModalOpen] = useState(false);
	const [editingService, setEditingService] = useState<Service | null>(null);
	const [serviceName, setServiceName] = useState('');

	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

	useEffect(() => {
		fetchServices();
	}, [fetchServices]);

	const handleOpenCreate = () => {
		setEditingService(null);
		setServiceName('');
		setModalOpen(true);
	};

	const handleOpenEdit = (service: Service) => {
		setEditingService(service);
		setServiceName(service.name);
		setModalOpen(true);
	};

	const handleSave = async () => {
		const success = await saveService(serviceName, editingService?.id);
		if (success) {
			setModalOpen(false);
		}
	};

	const handleRequestDelete = (service: Service) => {
		setServiceToDelete(service);
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (serviceToDelete) {
			await deleteService(serviceToDelete.id);
			setDeleteModalOpen(false);
		}
	};

	const filteredServices = services.filter((s) =>
		s.name.toLowerCase().includes(search.toLowerCase()),
	);

	const { startTour, moveNext, movePrevious, destroy } = useTour([
		{
			element: '#tour-new-service',
			popover: {
				title: 'Novo Serviço',
				description: 'Crie uma nova instância isolada de mensageria clicando aqui.',
				side: 'bottom',
				// Abre o modal e avança — o próximo step usa "waitForElement" para
				// esperar o input aparecer de verdade no DOM (o modal é montado via portal
				// pelo Radix, então não existe no primeiro render após o setModalOpen).
				onNextClick: () => {
					setModalOpen(true);
					moveNext();
				},
			},
		},
		{
			element: '#name',
			// Espera até 1s pelo input do modal ser montado no DOM antes de destacá-lo.
			waitForElement: 1000,
			popover: {
				title: 'Nome do Projeto',
				description: 'Dê um nome amigável para identificar sua aplicação ou projeto.',
				side: 'top',
				onNextClick: () => {
					setModalOpen(false);
					moveNext();
				},
				onPrevClick: () => {
					setModalOpen(false);
					movePrevious();
				},
				// Garante que o modal não fique aberto "órfão" se o usuário fechar o tour aqui.
				onCloseClick: () => {
					setModalOpen(false);
					destroy();
				},
			},
		},
		{
			element: '#tour-search-service',
			popover: {
				title: 'Busca Rápida',
				description: 'Encontre serviços rapidamente pelo nome usando a busca.',
				side: 'right',
			},
		},
		{
			element: '#tour-service-list',
			popover: {
				title: 'Seus Serviços',
				description: 'Aqui ficam listados todos os seus serviços. Clique em "Acessar Painel" para gerenciar credenciais, templates e ver as métricas do serviço.',
				side: 'top',
			},
		},
	]);

	return (
		<div className="space-y-6 animate-in fade-in duration-300 ease-out">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Serviços</h2>
					<p className="text-sm text-muted-foreground">
						Gerencie as instâncias isoladas de mensageria da sua infraestrutura.
					</p>
				</div>
				<div className="flex gap-2">
					<Button onClick={startTour} variant="outline" className="cursor-pointer border-primary text-primary hover:bg-primary/10">
						Tour Guiado
					</Button>
					<Button id="tour-new-service" onClick={handleOpenCreate} className="cursor-pointer">
						<Plus className="mr-2 h-4 w-4" /> Novo Serviço
					</Button>
				</div>
			</div>

			<div className="flex items-center space-x-2">
				<div id="tour-search-service" className="relative w-full sm:w-72">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Buscar serviço..."
						className="pl-8"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>

			{loading ? (
				<div className="flex flex-col items-center justify-center h-48 gap-3 text-sm text-muted-foreground">
					<Loader2 className="h-6 w-6 animate-spin text-primary" />
					<span>Carregando serviços...</span>
				</div>
			) : filteredServices.length === 0 ? (
				<div id="tour-service-list" className="flex flex-col items-center justify-center h-48 border border-dashed rounded-xl bg-card text-center p-6">
					<Server className="h-10 w-10 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold">Nenhum serviço encontrado</h3>
					<p className="text-sm text-muted-foreground mt-2 max-w-sm">
						Você ainda não possui serviços criados ou nenhum bate com sua busca.
					</p>
					<Button variant="outline" className="mt-4 cursor-pointer" onClick={handleOpenCreate}>
						Criar Primeiro Serviço
					</Button>
				</div>
			) : (
				<div id="tour-service-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredServices.map((service) => (
						<Card key={service.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
							<CardHeader className="flex flex-row items-start justify-between pb-2">
								<div className="space-y-1">
									<CardTitle className="text-base font-semibold leading-none flex items-center gap-2">
										<Server className="h-4 w-4 text-muted-foreground" />
										{service.name}
										{service.ownerName && (
											<Badge
												variant="secondary"
												title={service.ownerEmail}
												className="ml-2 text-xs font-medium bg-primary/10 text-primary border border-primary/20"
											>
												<span title={service.ownerEmail} className="font-semibold">
													{service.ownerName.split(' ')[0]}
												</span>
											</Badge>
										)}
									</CardTitle>
									<CardDescription className="font-mono text-xs mt-1">
										ID: {service.id.split('-')[0]}
									</CardDescription>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
											<span className="sr-only">Menu</span>
											<MoreVertical className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => handleOpenEdit(service)}
											className="cursor-pointer"
										>
											<Pencil className="mr-2 h-4 w-4" /> Editar Nome
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => handleRequestDelete(service)}
											className="text-destructive focus:text-destructive cursor-pointer"
										>
											<Trash2 className="mr-2 h-4 w-4" /> Excluir
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</CardHeader>
							<CardContent className="mt-auto pt-4">
								<Link href={`/system/services/${service.id}`} className="w-full">
									<Button className="w-full cursor-pointer gap-2">
										Acessar Painel
										<ArrowRight className="h-3.5 w-3.5" />
									</Button>
								</Link>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<Dialog open={modalOpen} onOpenChange={setModalOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{editingService ? 'Editar Serviço' : 'Criar Serviço'}</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<label htmlFor="name" className="text-sm font-medium">
								Nome
							</label>
							<Input
								id="name"
								value={serviceName}
								onChange={(e) => setServiceName(e.target.value)}
								placeholder="Nome do projeto"
								onKeyDown={(e) => e.key === 'Enter' && handleSave()}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setModalOpen(false)}
							className="cursor-pointer"
						>
							Cancelar
						</Button>
						<Button
							onClick={handleSave}
							disabled={processing || !serviceName.trim()}
							className="cursor-pointer"
						>
							{processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{processing ? 'Salvando...' : 'Salvar'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<ConfirmModal
				isOpen={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={handleConfirmDelete}
				variant="danger"
				title="Excluir Serviço"
				description={`Tem certeza que deseja excluir o serviço "${serviceToDelete?.name}"? Esta ação é irreversível.`}
				confirmText="Excluir Serviço"
			/>
		</div>
	);
}
