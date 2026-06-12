'use client';

import { useState, useEffect } from 'react';
import { Plus, FileText, Globe, Server, Trash2, ArrowRight, Loader2, Layout } from 'lucide-react';
import { apiFetch } from '@/src/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { ConfirmModal } from '@/src/components/ui/confirm-modal';
import { useToast } from '@/src/hooks/use-toast';
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
			}
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

	return (
		<div className="space-y-6 animate-in fade-in duration-500">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Meus Templates</h2>
					<p className="text-sm text-muted-foreground">
						Gerencie seus layouts de e-mail transacionais.
					</p>
				</div>
				<Button onClick={() => setShowCreateModal(true)}>
					<Plus className="mr-2 h-4 w-4" /> Novo Template
				</Button>
			</div>

			{loading ? (
				<div className="flex h-64 items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : templates.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg bg-card text-center p-6">
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
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{templates.map((tmpl) => (
						<Card key={tmpl.id} className="flex flex-col">
							<CardHeader className="pb-4">
								<div className="flex justify-between items-start mb-2">
									<div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
										<FileText className="h-5 w-5" />
									</div>
									{tmpl.global ? (
										<Badge className="bg-primary text-primary-foreground flex items-center gap-1 cursor-default">
											<Globe className="h-3 w-3" /> Global
										</Badge>
									) : (
										<Badge variant="secondary" className="flex items-center gap-1 cursor-default">
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
							</CardHeader>
							<CardFooter className="mt-auto flex gap-2 pt-0">
								<Button asChild variant="outline" className="flex-1">
									<Link href={`/system/templates/${tmpl.id}`}>
										Editar <ArrowRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => {
										setTemplateToDelete(tmpl);
										setDeleteModalOpen(true);
									}}
									className="text-destructive hover:bg-destructive/10"
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
					<div className="grid gap-4 py-4">
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
