'use client';

import {
	Plus,
	Shield,
	Settings,
	MoreHorizontal,
	Loader2,
	AlertCircle,
	Pencil,
	Trash2,
	ExternalLink,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/src/lib/api';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from '@/src/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/src/components/ui/dropdown-menu';
import { ConfirmModal } from '@/src/components/ui/confirm-modal';
import { Card } from '@/src/components/ui/card';
import { useToast } from '@/src/hooks/use-toast';

interface Service {
	id: string;
	name: string;
	createdAt: string;
}

export default function ServicesPage() {
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [currentService, setCurrentService] = useState<Service | null>(null);
	const [serviceName, setServiceName] = useState('');
	const [processing, setProcessing] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
	const { toast } = useToast();

	const fetchServices = async () => {
		setLoading(true);
		try {
			const response = await apiFetch('/api/services');
			const result = await response.json();
			if (response.ok && !result.error) {
				setServices(result.data || []);
			} else {
				toast({
					variant: 'destructive',
					title: 'Erro ao carregar serviços',
					description: result.message || 'Tente novamente mais tarde.',
				});
			}
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Falha na conexão',
				description: 'Não foi possível conectar ao servidor.',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleOpenCreate = () => {
		setIsEditing(false);
		setCurrentService(null);
		setServiceName('');
		setShowModal(true);
	};

	const handleOpenEdit = (service: Service) => {
		setIsEditing(true);
		setCurrentService(service);
		setServiceName(service.name);
		setShowModal(true);
	};

	const handleSaveService = async () => {
		if (!serviceName.trim()) return;
		setProcessing(true);
		try {
			const endpoint = isEditing ? `/api/services/${currentService?.id}` : '/api/services';
			const method = isEditing ? 'PATCH' : 'POST';

			const response = await apiFetch(endpoint, {
				method,
				body: JSON.stringify({ name: serviceName }),
			});

			const result = await response.json();

			if (response.ok && !result.error) {
				toast({
					title: isEditing ? 'Serviço Atualizado' : 'Serviço Criado',
					description: `O projeto "${serviceName}" foi salvo com sucesso.`,
				});
				setShowModal(false);
				fetchServices();
			} else {
				toast({
					variant: 'destructive',
					title: 'Erro na operação',
					description: result.message || 'Não foi possível salvar o serviço.',
				});
			}
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Erro de rede',
				description: 'Falha ao tentar se comunicar com a API.',
			});
		} finally {
			setProcessing(false);
		}
	};

	const handleRequestDeleteService = (service: Service) => {
		setServiceToDelete(service);
		setShowDeleteModal(true);
	};

	const handleConfirmDeleteService = async () => {
		if (!serviceToDelete) return;
		const { id, name } = serviceToDelete;
		try {
			const response = await apiFetch(`/api/services/${id}`, {
				method: 'DELETE',
			});

			const result = await response.json();

			if (response.ok && !result.error) {
				toast({
					title: 'Serviço Removido',
					description: `O projeto "${name}" e todos os seus dados foram excluídos.`,
				});
				setServices((prev) => prev.filter((s) => s.id !== id));
			} else {
				toast({
					variant: 'destructive',
					title: 'Falha ao deletar',
					description: result.message || 'O servidor negou a exclusão.',
				});
			}
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Erro crítico',
				description: 'Não foi possível processar a exclusão.',
			});
		}
	};

	const handleCloseDeleteModal = () => {
		setShowDeleteModal(false);
		setServiceToDelete(null);
	};

	useEffect(() => {
		fetchServices();
	}, []);

	return (
		<div className="space-y-12 text-left">
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
				<div>
					<h2 className="text-3xl font-bold tracking-tight mb-2 uppercase text-foreground">
						Meus Serviços
					</h2>
					<p className="text-muted-foreground text-sm font-medium italic">
						Gerencie as instâncias isoladas de e-mail para suas aplicações.
					</p>
				</div>

				<Button
					onClick={handleOpenCreate}
					className="cursor-pointer gap-2 uppercase font-black tracking-widest text-[10px] px-6"
				>
					<Plus size={18} /> Novo Serviço
				</Button>

				<Dialog open={showModal} onOpenChange={setShowModal}>
					<DialogContent className="bg-surface border-border-subtle rounded-[40px] max-w-lg p-0 overflow-hidden shadow-2xl">
						<DialogHeader className="p-10 bg-background/30 text-center border-b border-border-subtle">
							<div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
								{isEditing ? <Pencil size={32} /> : <Plus size={32} />}
							</div>
							<DialogTitle className="text-2xl font-bold italic uppercase tracking-tighter text-foreground">
								{isEditing ? 'Editar Serviço' : 'Novo Serviço'}
							</DialogTitle>
							<DialogDescription className="text-muted-foreground text-sm mt-2 italic">
								{isEditing
									? 'Altere o nome identificador do seu projeto.'
									: 'Dê um nome único para o seu projeto.'}
							</DialogDescription>
						</DialogHeader>

						<div className="p-10 space-y-6">
							<div className="space-y-3">
								<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
									Nome do Serviço
								</label>
								<Input
									autoFocus
									value={serviceName}
									onChange={(e) => setServiceName(e.target.value)}
									className="bg-background border-border-subtle rounded-2xl px-6 py-7 text-base focus:border-primary transition-all font-medium italic h-14"
									placeholder="Ex: API de Pagamentos"
								/>
							</div>
						</div>

						<DialogFooter className="p-10 bg-background/30 border-t border-border-subtle flex flex-col gap-4 sm:flex-col">
							<Button
								onClick={handleSaveService}
								disabled={processing || !serviceName.trim()}
								className="cursor-pointer w-full py-7 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-hover disabled:opacity-50"
							>
								{processing ? (
									<Loader2 className="animate-spin" size={20} />
								) : isEditing ? (
									'Salvar Alterações'
								) : (
									'Finalizar Cadastro'
								)}
							</Button>
							<Button
								variant="ghost"
								onClick={() => setShowModal(false)}
								className="cursor-pointer w-full py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
							>
								Cancelar
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{loading ? (
				<div className="h-96 flex items-center justify-center">
					<div className="flex flex-col items-center gap-4 text-muted-foreground">
						<Loader2 className="animate-spin text-primary" size={40} />
						<p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">
							Sincronizando com a nuvem...
						</p>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{services.map((service) => (
						<Card
							key={service.id}
							className="group relative bg-surface border-border-subtle rounded-3xl p-8 hover:border-primary/40 transition-all duration-500 shadow-sm overflow-hidden text-left border"
						>
							<div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>

							<div className="flex justify-between items-start mb-8 relative z-10">
								<div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
									<Shield size={24} />
								</div>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
										>
											<MoreHorizontal size={18} />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="bg-surface border-border-subtle rounded-xl min-w-40"
									>
										<DropdownMenuItem
											onClick={() => handleOpenEdit(service)}
											className="gap-2 cursor-pointer py-3 text-xs font-bold uppercase tracking-wider"
										>
											<Pencil size={14} /> Editar Nome
										</DropdownMenuItem>
										<DropdownMenuSeparator className="bg-border-subtle/50" />
										<DropdownMenuItem
											onClick={() => handleRequestDeleteService(service)}
											className="gap-2 cursor-pointer py-3 text-xs font-bold uppercase tracking-wider text-danger focus:text-danger focus:bg-danger/10"
										>
											<Trash2 size={14} /> Excluir Projeto
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>

							<div className="space-y-1 mb-8 relative z-10">
								<h3
									className="text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate"
									title={service.name}
								>
									{service.name}
								</h3>
								<div className="flex items-center gap-2">
									<p className="text-muted-foreground text-[10px] font-mono tracking-wider opacity-60 uppercase">
										ID: {service.id}
									</p>
								</div>
							</div>

							<div className="mt-auto flex gap-3 relative z-10">
								<Link href={`/system/services/${service.id}`} className="flex-1">
									<Button
										variant="outline"
										className="cursor-pointer w-full py-2.5 rounded-xl bg-background border-border-subtle text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all gap-2 text-foreground"
									>
										Explorar <ExternalLink size={14} />
									</Button>
								</Link>
							</div>
						</Card>
					))}

					<div
						onClick={handleOpenCreate}
						className="group border-2 border-dashed border-border-subtle rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all duration-300 min-h-65"
					>
						<div className="p-4 bg-white/5 rounded-full text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-500 scale-110">
							<Plus size={32} />
						</div>
						<div>
							<h4 className="font-bold text-lg text-foreground uppercase tracking-tight text-center">
								Novo Projeto
							</h4>
							<p className="text-muted-foreground text-xs mt-1 italic">
								Configure uma nova aplicação
							</p>
						</div>
					</div>
				</div>
			)}

			<ConfirmModal
				isOpen={showDeleteModal}
				onClose={handleCloseDeleteModal}
				onConfirm={handleConfirmDeleteService}
				variant="danger"
				title="Excluir Serviço?"
				description={`Tem certeza que deseja deletar "${serviceToDelete?.name}"? Todos os e-mails, templates e chaves vinculados a este serviço serão removidos permanentemente.`}
				confirmText="Sim, Excluir Tudo"
			/>
		</div>
	);
}
