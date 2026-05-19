'use client';

import {
	Plus,
	FileText,
	MoreHorizontal,
	Loader2,
	Layout,
	ArrowRight,
	CheckCircle2,
	Globe,
	Server,
	Trash2,
	ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/src/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
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
import { Badge } from '@/src/components/ui/badge';
import { ConfirmModal } from '@/src/components/ui/confirm-modal';
import { useToast } from '@/src/hooks/use-toast';

interface Template {
	id: string;
	name: string;
	subject_template: string;
	service_id: string | null;
	global: boolean;
}

interface Service {
	id: string;
	name: string;
}

export default function TemplatesPage() {
	const [templates, setTemplates] = useState<Template[]>([]);
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	const [newName, setNewName] = useState('');
	const [selectedService, setSelectedService] = useState('');

	useEffect(() => {
		setMounted(true);
		fetchTemplates();
		fetchServices();
	}, []);

	const fetchTemplates = async () => {
		setLoading(true);
		try {
			const response = await apiFetch('/api/templates');
			if (response.ok) {
				const result = await response.json();
				setTemplates(result.data || []);
			}
		} catch (err) {
			console.error('Erro ao buscar templates:', err);
		} finally {
			setLoading(false);
		}
	};

	const fetchServices = async () => {
		try {
			const response = await apiFetch('/api/services');
			if (response.ok) {
				const result = await response.json();
				setServices(result.data || []);
			}
		} catch (err) {
			console.error('Erro ao buscar serviços:', err);
		}
	};

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedService || !newName) return;

		const isGlobal = selectedService === 'global';

		setCreating(true);
		try {
			const response = await apiFetch('/api/templates', {
				method: 'POST',
				body: JSON.stringify({
					name: newName,
					service_id: isGlobal ? null : selectedService,
					global: isGlobal,
					subject_template: 'Novo E-mail',
					html_content:
						'<mjml><mj-body><mj-section><mj-column><mj-text>Olá, {{name}}!</mj-text></mj-column></mj-section></mj-body></mjml>',
				}),
			});

			if (response.ok) {
				const result = await response.json();
				setOpen(false);
				router.push(`/system/templates/${result.data.id}`);
			}
		} catch (err) {
			console.error('Erro ao criar:', err);
		} finally {
			setCreating(false);
		}
	};

	const handleRequestDelete = (template: Template) => {
		setTemplateToDelete(template);
		setShowDeleteModal(true);
	};

	const handleConfirmDelete = async () => {
		if (!templateToDelete) return;
		const { id, name } = templateToDelete;
		setDeletingId(id);
		try {
			const response = await apiFetch(`/api/templates/${id}`, {
				method: 'DELETE',
			});

			const result = await response.json();

			if (response.ok) {
				setTemplates((prev) => prev.filter((t) => t.id !== id));
				toast({
					title: 'Template excluído',
					description: `O template "${name}" foi removido com sucesso.`,
				});
			} else {
				toast({
					variant: 'destructive',
					title: 'Erro ao excluir',
					description: result.message || 'Não foi possível excluir o template.',
				});
			}
		} catch (err) {
			console.error('Erro ao excluir:', err);
			toast({
				variant: 'destructive',
				title: 'Erro de conexão',
				description: 'Ocorreu um erro ao tentar se comunicar com o servidor.',
			});
		} finally {
			setDeletingId(null);
			setShowDeleteModal(false);
		}
	};

	const handleCloseDeleteModal = () => {
		setShowDeleteModal(false);
		setTemplateToDelete(null);
	};

	if (!mounted) return null;

	return (
		<div className="space-y-12 text-left">
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-left">
				<div className="text-left">
					<h2 className="text-3xl font-bold tracking-tight mb-2 uppercase text-foreground">
						Meus Templates
					</h2>
					<p className="text-muted-foreground text-sm font-medium italic">
						Gerencie seus layouts transacionais.
					</p>
				</div>

				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button className="cursor-pointer gap-2 uppercase font-black tracking-widest text-[10px] bg-primary shadow-lg shadow-primary/20 h-12 px-6">
							<Plus size={18} /> Novo Template
						</Button>
					</DialogTrigger>
					<DialogContent className="bg-surface border-border-subtle rounded-[40px] max-w-lg p-10 border text-left">
						<form onSubmit={handleCreate} className="space-y-8 text-left">
							<DialogHeader className="p-0 text-left">
								<DialogTitle className="text-2xl font-bold italic uppercase tracking-tighter text-foreground flex items-center gap-3">
									<FileText className="text-primary" /> Criar Template
								</DialogTitle>
							</DialogHeader>

							<div className="space-y-6 text-left">
								<div className="space-y-3 text-left">
									<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
										Escopo de Uso
									</label>

									<div className="relative">
										<select
											value={selectedService}
											onChange={(e) => setSelectedService(e.target.value)}
											className="w-full bg-background border border-border-subtle rounded-2xl h-14 italic font-medium px-6 text-foreground appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
										>
											<option value="" disabled className="bg-surface">
												Selecione onde usar...
											</option>
											<option value="global" className="bg-surface font-bold text-primary italic">
												🌍 Template Global (Todos os Serviços)
											</option>
											{services.map((s) => (
												<option key={s.id} value={s.id} className="bg-surface">
													Serviço: {s.name}
												</option>
											))}
										</select>
										<ChevronDown
											className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
											size={18}
										/>
									</div>
								</div>

								<div className="space-y-3 text-left">
									<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
										Nome do Template
									</label>
									<Input
										placeholder="Ex: Recuperação de Senha"
										value={newName}
										onChange={(e) => setNewName(e.target.value)}
										className="bg-background border-border-subtle rounded-2xl px-6 h-14 italic font-medium focus:ring-1 focus:ring-primary"
									/>
								</div>
							</div>

							<DialogFooter className="p-0 pt-4 flex gap-4">
								<Button
									disabled={creating || !selectedService || !newName}
									type="submit"
									className="flex-1 py-7 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 h-14 gap-2 cursor-pointer"
								>
									{creating ? (
										<Loader2 className="animate-spin" size={16} />
									) : (
										<CheckCircle2 size={16} />
									)}
									Criar e Abrir Editor
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{loading ? (
				<div className="h-96 flex items-center justify-center">
					<Loader2 className="animate-spin text-primary" size={40} />
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{templates.length === 0 ? (
						<div className="col-span-full h-96 border-2 border-dashed border-border-subtle rounded-[40px] flex flex-col items-center justify-center text-center p-12 bg-surface/30">
							<div className="w-20 h-20 bg-primary/10 rounded-4xl flex items-center justify-center text-primary mb-6">
								<Layout size={40} />
							</div>
							<h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-foreground text-center">
								Nenhum Template
							</h3>
							<p className="text-muted-foreground text-sm italic max-w-xs text-center">
								Você ainda não criou nenhum template de e-mail. Comece agora para agilizar seus
								envios.
							</p>
						</div>
					) : (
						templates.map((template) => (
							<Card
								key={template.id}
								className="group relative bg-surface border-border-subtle rounded-4xl p-8 hover:border-primary/40 transition-all duration-500 shadow-sm overflow-hidden text-left border"
							>
								<div className="flex justify-between items-start mb-6 text-left">
									<div className="p-3 rounded-2xl bg-primary/10 text-primary">
										<FileText size={24} />
									</div>
									{template.global ? (
										<Badge className="bg-primary/10 text-primary border-none text-[9px] font-bold uppercase gap-1.5 px-3 py-1 cursor-default">
											<Globe size={10} /> Global
										</Badge>
									) : (
										<Badge
											variant="outline"
											className="border-border-subtle text-[9px] font-bold uppercase px-3 py-1 cursor-default"
										>
											<Server size={10} className="mr-1.5" />
											{services.find((s) => s.id === template.service_id)?.name || 'Privado'}
										</Badge>
									)}
								</div>

								<div className="space-y-1 mb-8 text-left">
									<h3 className="text-xl font-bold text-foreground">{template.name}</h3>
									<p className="text-muted-foreground text-[10px] font-mono tracking-wider opacity-60 uppercase truncate italic">
										{template.subject_template}
									</p>
								</div>

								<div className="mt-auto flex gap-3 relative z-10 text-left">
									<Link href={`/system/templates/${template.id}`} className="flex-1 text-left">
										<Button
											variant="outline"
											className="cursor-pointer w-full py-2.5 rounded-xl bg-background border-border-subtle text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all gap-2 text-foreground group/btn"
										>
											Abrir Editor{' '}
											<ArrowRight
												size={14}
												className="group-hover/btn:translate-x-1 transition-transform"
											/>
										</Button>
									</Link>
									<Button
										variant="outline"
										onClick={() => handleRequestDelete(template)}
										disabled={deletingId === template.id}
										className="cursor-pointer h-10 w-10 p-0 rounded-xl border-border-subtle bg-danger/5 text-danger hover:bg-danger hover:text-white transition-all shrink-0"
									>
										{deletingId === template.id ? (
											<Loader2 className="animate-spin" size={14} />
										) : (
											<Trash2 size={16} />
										)}
									</Button>
								</div>
							</Card>
						))
					)}
				</div>
			)}

			<ConfirmModal
				isOpen={showDeleteModal}
				onClose={handleCloseDeleteModal}
				onConfirm={handleConfirmDelete}
				variant="danger"
				title="Excluir Template?"
				description={`Tem certeza que deseja excluir "${templateToDelete?.name}"? Esta ação é permanente.`}
				confirmText="Sim, Excluir"
			/>
		</div>
	);
}
