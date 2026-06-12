'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Server, Trash2, Pencil } from 'lucide-react';
import Link from 'next/link';

import { useServices } from '@/src/hooks/use-services';
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

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Serviços</h2>
					<p className="text-sm text-muted-foreground">
						Gerencie as instâncias isoladas de mensageria da sua infraestrutura.
					</p>
				</div>
				<Button onClick={handleOpenCreate} className="cursor-pointer">
					<Plus className="mr-2 h-4 w-4" /> Novo Serviço
				</Button>
			</div>

			<div className="flex items-center space-x-2">
				<div className="relative w-full sm:w-72">
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
				<div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
					Carregando serviços...
				</div>
			) : filteredServices.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-lg bg-card text-center p-6">
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
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredServices.map((service) => (
						<Card key={service.id} className="flex flex-col">
							<CardHeader className="flex flex-row items-start justify-between pb-2">
								<div className="space-y-1">
									<CardTitle className="text-base font-semibold leading-none flex items-center gap-2">
										<Server className="h-4 w-4 text-muted-foreground" />
										{service.name}
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
									<Button variant="secondary" className="w-full cursor-pointer">
										Acessar Painel
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
