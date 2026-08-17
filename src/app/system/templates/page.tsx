'use client';

import { useState, useEffect } from 'react';
import {
	Plus,
	FileText,
	Globe,
	Server,
	Trash2,
	ArrowRight,
	Loader2,
	Layout,
	Copy,
} from 'lucide-react';
import { apiFetch } from '@/src/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { ConfirmModal } from '@/src/components/ui/confirm-modal';
import { useToast } from '@/src/hooks/use-toast';
import { useTour } from '@/src/hooks/use-tour';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/src/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/src/components/ui/select';

interface Template {
	id: string;
	name: string;
	subject_template: string;
	service_id: string | null;
	global: boolean;
}

interface ServiceType {
	id: string;
	name: string;
}

export default function TemplatesPage() {
	const [templates, setTemplates] = useState<Template[]>([]);
	const [services, setServices] = useState<ServiceType[]>([]);
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState(false);

	const [showCreateModal, setShowCreateModal] = useState(false);
	const [newName, setNewName] = useState('');
	const [selectedService, setSelectedService] = useState('');

	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		fetchTemplates();
		fetchServices();
	}, []);

	const fetchTemplates = async () => {
		setLoading(true);
		try {
			const res = await apiFetch('/api/templates');
			const data = await res.json();
			if (res.ok) setTemplates(data.data || []);
		} finally {
			setLoading(false);
		}
	};

	const fetchServices = async () => {
		try {
			const res = await apiFetch('/api/services');
			const data = await res.json();
			if (res.ok) setServices(data.data || []);
		} catch (e) {}
	};

	const handleCreate = async () => {
		if (!selectedService || !newName) return;
		setCreating(true);
		try {
			const isGlobal = selectedService === 'global';
			const response = await apiFetch('/api/templates', {
				method: 'POST',
				body: JSON.stringify({
					name: newName,
					service_id: isGlobal ? null : selectedService,
					global: isGlobal,
					subject_template: 'Novo E-mail',
					html_content:
						'<mjml><mj-body><mj-section><mj-column><mj-text>Olá!</mj-text></mj-column></mj-section></mj-body></mjml>',
				}),
			});
			const result = await response.json();
			if (response.ok) {
				setShowCreateModal(false);
				router.push(`/system/templates/${result.data.id}`);
			} else {
				toast({
					variant: 'destructive',
					title: 'Erro ao criar template',
					description: result?.message || 'Não foi possível criar o template.',
				});
			}
		} catch (err) {
			console.error('Erro ao criar template:', err);
			toast({
				variant: 'destructive',
				title: 'Erro ao criar template',
				description: 'Não foi possível criar o template.',
			});
		} finally {
			setCreating(false);
		}
	};

	const handleConfirmDelete = async () => {
		if (!templateToDelete) return;
		try {
			const res = await apiFetch(`/api/templates/${templateToDelete.id}`, { method: 'DELETE' });
			if (res.ok) {
				toast({ title: 'Sucesso', description: 'Template excluído.' });
				setTemplates((prev) => prev.filter((t) => t.id !== templateToDelete.id));
			}
		} finally {
			setDeleteModalOpen(false);
		}
	};

	const { startTour, moveNext, movePrevious, destroy } = useTour([
		{
			element: '#tour-templates-new',
			popover: {
				title: 'Novo Template',
				description: 'Vamos criar um template de exemplo. Clique em Próximo para abrir o formulário.',
				side: 'bottom',
				onNextClick: () => {
					setShowCreateModal(true);
					moveNext();
				},
			},
		},
		{
			element: '#tour-templates-modal-fields',
			// Aguarda o modal (renderizado via portal pelo Radix) montar de verdade no DOM.
			waitForElement: 1000,
			popover: {
				title: 'Nome e Escopo',
				description: 'Dê um nome ao template e escolha se ele é "Global" (disponível para todos os serviços) ou exclusivo de um serviço específico.',
				side: 'top',
				onNextClick: () => {
					setShowCreateModal(false);
					moveNext();
				},
				onPrevClick: () => {
					setShowCreateModal(false);
					movePrevious();
				},
				onCloseClick: () => {
					setShowCreateModal(false);
					destroy();
				},
			},
		},
		{
			element: '#tour-templates-grid',
			popover: {
				title: 'Seus Templates',
				description: 'Templates já criados aparecem aqui. Clique em "Editar" para abrir o editor MJML com preview ao vivo.',
				side: 'top',
			},
		},
	]);

	return (
		<div className="space-y-6 animate-in fade-in duration-300 ease-out">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Meus Templates</h2>
					<p className="text-sm text-muted-foreground">
						Gerencie seus layouts de e-mail transacionais.
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={startTour}
						variant="outline"
						className="cursor-pointer border-primary text-primary hover:bg-primary/10"
					>
						Tour Guiado
					</Button>
					<Button id="tour-templates-new" onClick={() => setShowCreateModal(true)}>
						<Plus className="mr-2 h-4 w-4" /> Novo Template
					</Button>
				</div>
			</div>

			{loading ? (
				<div className="flex h-64 items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : templates.length === 0 ? (
				<div id="tour-templates-grid" className="flex flex-col items-center justify-center h-64 border border-dashed rounded-xl bg-card text-center p-6">
					<Layout className="h-10 w-10 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold">Nenhum Template</h3>
					<p className="text-sm text-muted-foreground mt-2 max-w-sm">
						Você ainda não criou nenhum template. Comece agora para agilizar seus envios.
					</p>
					<Button variant="outline" className="mt-4" onClick={() => setShowCreateModal(true)}>
						Criar Template
					</Button>
				</div>
			) : (
				<div id="tour-templates-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{templates.map((tmpl) => (
						<Card key={tmpl.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
							<CardHeader className="pb-4">
								<div className="flex justify-between items-start mb-2">
									<div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
										<FileText className="h-5 w-5" />
									</div>
									{tmpl.global ? (
										<Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 flex items-center gap-1 cursor-default">
											<Globe className="h-3 w-3" /> Global
										</Badge>
									) : (
										<Badge variant="secondary" className="hover:bg-secondary flex items-center gap-1 cursor-default">
											<Server className="h-3 w-3" />{' '}
											{services.find((s) => s.id === tmpl.service_id)?.name || 'Específico'}
										</Badge>
									)}
								</div>
								<CardTitle className="text-lg truncate" title={tmpl.name}>
									{tmpl.name}
								</CardTitle>
								<p className="text-xs text-muted-foreground truncate font-mono">
									{tmpl.subject_template}
								</p>
								<div
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										navigator.clipboard.writeText(tmpl.id);
										toast({
											title: 'Copiado!',
											description: 'ID do template copiado para a área de transferência.',
										});
									}}
									className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground hover:text-primary cursor-pointer w-fit transition-colors"
									title="Clique para copiar o ID"
								>
									<span className="font-mono">ID: {tmpl.id}</span>
									<Copy className="h-3 w-3" />
								</div>
							</CardHeader>
							<CardFooter className="mt-auto flex gap-2 pt-0">
								<Button asChild className="mt-4 flex-1 cursor-pointer gap-2">
									<Link href={`/system/templates/${tmpl.id}`}>
										Editar <ArrowRight className="h-4 w-4" />
									</Link>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => {
										setTemplateToDelete(tmpl);
										setDeleteModalOpen(true);
									}}
									className="mt-4 text-destructive hover:bg-destructive/10"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			)}

			<Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Criar Novo Template</DialogTitle>
					</DialogHeader>
					<div id="tour-templates-modal-fields" className="grid gap-4 py-4">
						<div className="grid gap-2">
							<label className="text-sm font-medium">Nome do Template</label>
							<Input
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								placeholder="Ex: Boas-vindas"
							/>
						</div>
						<div className="grid gap-2">
							<label className="text-sm font-medium">Escopo de Uso</label>
							<Select value={selectedService} onValueChange={setSelectedService}>
								<SelectTrigger>
									<SelectValue placeholder="Onde este template será usado?" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="global" className="font-semibold text-primary">
										🌍 Global (Todos os Serviços)
									</SelectItem>
									{services.map((s) => (
										<SelectItem key={s.id} value={s.id}>
											{s.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowCreateModal(false)}>
							Cancelar
						</Button>
						<Button onClick={handleCreate} disabled={creating || !newName || !selectedService}>
							{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Criar e Abrir
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<ConfirmModal
				isOpen={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={handleConfirmDelete}
				variant="danger"
				title="Excluir Template"
				description={`Remover "${templateToDelete?.name}"? Ação permanente.`}
			/>
		</div>
	);
}
