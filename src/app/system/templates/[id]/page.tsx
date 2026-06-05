'use client';

import {
	ArrowLeft,
	Save,
	Eye,
	Code,
	Copy,
	Loader2,
	RefreshCw,
	Plus,
	X,
	Variable,
	Zap,
	Globe,
	Server,
	AlignLeft,
	Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/src/lib/api';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { ConfirmModal } from '@/src/components/ui/confirm-modal';
import { useToast } from '@/src/hooks/use-toast';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/src/components/ui/select';
import Editor, { OnMount } from '@monaco-editor/react';
import format from 'xml-formatter';

interface Service {
	id: string;
	name: string;
}

export default function TemplateDetailsPage() {
	const { id } = useParams();
	const router = useRouter();
	const editorRef = useRef<any>(null);
	const { toast } = useToast();

	// UI States
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [rendering, setRendering] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	// Data States
	const [name, setName] = useState('');
	const [subject, setSubject] = useState('');
	const [content, setContent] = useState(''); // Este é o código MJML
	const [htmlPreview, setHtmlPreview] = useState('');
	const [serviceId, setServiceId] = useState<string | null>(null);
	const [isGlobal, setIsGlobal] = useState(false);
	const [services, setServices] = useState<Service[]>([]);

	// Variáveis agora são derivadas 100% do código (sem input manual)
	const detectedVariables = useMemo(() => {
		if (!content) return [];
		const matches = content.match(/\{\{\{?([^{}]+)\}?\}\}/g);
		if (!matches) return [];
		
		const detected = Array.from(new Set(matches.map(m => {
			let v = m.replace(/\{|\}/g, '').trim();
			if (v.startsWith('#') || v.startsWith('/') || v.startsWith('!') || v === 'else') return null;
			return v.split(' ')[0];
		}).filter(Boolean))) as string[];
		
		return detected;
	}, [content]);

	// 1. CARREGAR DADOS
	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const [tRes, sRes] = await Promise.all([
				apiFetch(`/api/templates/${id}`),
				apiFetch('/api/services'),
			]);

			if (tRes.ok) {
				const tData = await tRes.json();
				const t = tData.data;
				setName(t.name);
				setSubject(t.subject_template || '');
				// IMPORTANTE: Carregamos do campo html_content que guarda o MJML no seu banco
				setContent(t.html_content || '');
				setServiceId(t.service_id);
				setIsGlobal(t.global);
			}

			if (sRes.ok) {
				const sData = await sRes.json();
				setServices(sData.data || []);
			}
		} catch (err) {
			console.error('Erro ao carregar dados:', err);
		} finally {
			setLoading(false);
		}
	}, [id]);

	// 2. EXECUTAR PREVIEW
	const handlePreview = useCallback(
		async (mjmlCode: string) => {
			if (!mjmlCode) return;
			setRendering(true);
			try {
				const previewVars = detectedVariables.reduce(
					(acc, v) => ({ ...acc, [v]: `[${v.toUpperCase()}]` }),
					{},
				);

				const response = await apiFetch('/api/templates/preview', {
					method: 'POST',
					body: JSON.stringify({
						mjml: mjmlCode,
						variables: previewVars,
					}),
				});

				if (response.ok) {
					const result = await response.json();
					setHtmlPreview(result.html);
				}
			} catch (err) {
				console.error('Falha no preview:', err);
			} finally {
				setRendering(false);
			}
		},
		[detectedVariables],
	);

	// 3. SALVAR ALTERAÇÕES
	const handleSave = async () => {
		setSaving(true);
		try {
			// CORREÇÃO: Enviamos o código do editor para 'html_content'
			// e NÃO enviamos a versão renderizada, deixando a API lidar com isso.
			await apiFetch(`/api/templates/${id}`, {
				method: 'PATCH',
				body: JSON.stringify({
					name,
					subject_template: subject,
					html_content: content,
					variables: detectedVariables,
					global: isGlobal,
					service_id: isGlobal ? null : serviceId,
				}),
			});
			toast({ title: 'Sucesso', description: 'Template salvo com sucesso.' });
		} catch (err) {
			console.error('Erro ao salvar:', err);
			toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao salvar o template.' });
		} finally {
			setSaving(false);
		}
	};

	// 4. DELETAR TEMPLATE
	const handleRequestDelete = () => {
		setShowDeleteModal(true);
	};

	const handleConfirmDelete = async () => {
		setDeleting(true);
		try {
			const response = await apiFetch(`/api/templates/${id}`, { method: 'DELETE' });
			if (response.ok) router.push('/system/templates');
		} catch (err) {
			console.error('Erro ao deletar:', err);
		} finally {
			setDeleting(false);
		}
	};

	const handleCloseDeleteModal = () => {
		setShowDeleteModal(false);
	};

	// 5. UTILITÁRIOS DO EDITOR
	const formatCode = useCallback(() => {
		if (!content) return;
		try {
			const formatted = format(content, {
				indentation: '  ',
				collapseContent: true,
				lineSeparator: '\n',
			});
			setContent(formatted);
		} catch (err) {
			console.warn('Erro ao formatar XML:', err);
			editorRef.current?.getAction('editor.action.formatDocument').run();
		}
	}, [content]);

	const handleEditorMount: OnMount = (editor) => {
		editorRef.current = editor;
	};

	// Lifecycle
	useEffect(() => {
		if (id) loadData();
	}, [id, loadData]);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (content) handlePreview(content);
		}, 1500);
		return () => clearTimeout(timer);
	}, [content, handlePreview]);

	if (loading) {
		return (
			<div className="h-screen flex items-center justify-center">
				<Loader2 className="animate-spin text-primary" size={40} />
			</div>
		);
	}

	return (
		<div className="h-[calc(100vh-140px)] flex flex-col gap-6 overflow-hidden text-left">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
				<div className="flex items-center gap-4 text-left">
					<Link href="/system/templates">
						<Button
							variant="outline"
							size="icon"
							className="cursor-pointer h-10 w-10 rounded-xl bg-surface border-border-subtle text-muted-foreground hover:text-primary text-left"
						>
							<ArrowLeft size={18} />
						</Button>
					</Link>
					<div className="text-left">
						<div className="flex items-center gap-2 text-left">
							<h2 className="text-xl font-bold tracking-tight uppercase text-foreground leading-tight text-left">
								{name}
							</h2>
							<Badge
								className={`${isGlobal ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'} border-none text-[9px] font-bold uppercase gap-1 px-2 py-0.5 cursor-default`}
							>
								{isGlobal ? <Globe size={10} /> : <Server size={10} />}
								{isGlobal ? 'Global' : services.find((s) => s.id === serviceId)?.name || 'Privado'}
							</Badge>
						</div>
						<div 
							onClick={() => {
								navigator.clipboard.writeText(id as string);
								toast({ title: 'Copiado!', description: 'ID do template copiado para a área de transferência.' });
							}}
							className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground hover:text-primary cursor-pointer w-fit transition-colors"
							title="Clique para copiar o ID"
						>
							<span className="font-mono">ID: {id}</span>
							<Copy size={12} />
						</div>
					</div>
				</div>

				<div className="flex items-center gap-3 text-left">
					<div className="flex items-center gap-2 bg-surface border border-border-subtle rounded-xl px-3 py-1 mr-2 h-10 text-left">
						<span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-left">
							Assunto:
						</span>
						<input
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
							className="bg-transparent border-none text-[11px] font-medium italic focus:ring-0 w-64 text-foreground placeholder:opacity-30"
							placeholder="Assunto do e-mail..."
						/>
					</div>

					<Button
						variant="outline"
						onClick={() => handlePreview(content)}
						disabled={rendering}
						className="cursor-pointer gap-2 font-bold text-[10px] uppercase tracking-widest h-10 px-5 border-border-subtle hover:bg-white/5"
					>
						<RefreshCw size={14} className={rendering ? 'animate-spin' : ''} /> Preview
					</Button>

					<Button
						onClick={handleSave}
						disabled={saving || deleting}
						className="cursor-pointer gap-2 font-black text-[10px] uppercase tracking-widest h-10 px-6 bg-primary shadow-lg shadow-primary/20"
					>
						{saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
						Salvar
					</Button>

					<Button
						variant="outline"
						onClick={handleRequestDelete}
						disabled={deleting || saving}
						className="cursor-pointer h-10 w-10 p-0 rounded-xl border-border-subtle bg-danger/5 text-danger hover:bg-danger hover:text-white transition-all"
					>
						{deleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={18} />}
					</Button>
				</div>
			</div>

			<div className="flex-1 flex gap-6 min-h-0 text-left">
				<Card className="flex-1 bg-surface border-border-subtle rounded-4xl border overflow-hidden flex flex-col text-left">
					<div className="p-4 border-b border-border-subtle bg-background/30 flex items-center justify-between text-left">
						<div className="flex items-center gap-2 text-left">
							<Code size={14} className="text-primary" />
							<span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">
								engine.mjml
							</span>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={formatCode}
							className="cursor-pointer h-7 text-[9px] uppercase font-bold text-muted-foreground hover:text-primary gap-1.5 px-2"
						>
							<AlignLeft size={12} /> Indentar MJML
						</Button>
					</div>
					<div className="flex-1 bg-[#1e1e1e] text-left">
						<Editor
							height="100%"
							defaultLanguage="xml"
							theme="vs-dark"
							value={content}
							onChange={(val) => setContent(val || '')}
							onMount={handleEditorMount}
							options={{
								minimap: { enabled: false },
								fontSize: 13,
								fontFamily: 'JetBrains Mono, monospace',
								lineHeight: 1.5,
								padding: { top: 15 },
								automaticLayout: true,
								wordWrap: 'on',
								tabSize: 2,
							}}
						/>
					</div>
				</Card>

				<div className="w-112.5 flex flex-col gap-6 shrink-0 text-left">
					<Card className="flex-1 bg-surface border-border-subtle rounded-4xl border overflow-hidden flex flex-col relative text-left">
						<div className="p-4 border-b border-border-subtle bg-background/30 flex items-center justify-between text-left">
							<div className="flex items-center gap-2 text-left">
								<Eye size={14} className="text-success" />
								<span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
									Saída em Tempo Real
								</span>
							</div>
							{rendering && (
								<Badge className="bg-primary/10 text-primary animate-pulse border-none text-[8px]">
									RENDERING
								</Badge>
							)}
						</div>
						<div className="flex-1 bg-white relative">
							{htmlPreview ? (
								<iframe
									srcDoc={htmlPreview}
									className="w-full h-full border-none"
									title="Preview"
								/>
							) : (
								<div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 italic text-xs px-12 text-center leading-relaxed">
									<Zap size={24} className="opacity-10" />
									Processando MJML...
								</div>
							)}
						</div>
					</Card>

					<Card className="bg-surface border-border-subtle rounded-4xl p-5 border shrink-0 text-left">
						<div className="flex flex-col gap-5 text-left">
							<div className="flex items-center justify-between text-left">
								<div className="flex items-center gap-2 text-left">
									<Variable size={14} className="text-primary" />
									<span className="text-[10px] font-bold uppercase tracking-widest text-foreground text-left">
										Variáveis Detectadas
									</span>
								</div>
							</div>

							<div className="flex flex-wrap gap-2 max-h-25 overflow-y-auto text-left">
								{detectedVariables.length === 0 ? (
									<span className="text-xs text-muted-foreground italic">Nenhuma variável no código.</span>
								) : detectedVariables.map((tag) => (
									<Badge
										key={tag}
										variant="outline"
										className="bg-background/50 border-border-subtle text-primary font-mono text-[9px] gap-2 py-1.5 px-3"
									>
										{'{{' + tag + '}}'}
									</Badge>
								))}
							</div>
						</div>
					</Card>
				</div>
			</div>

			<ConfirmModal
				isOpen={showDeleteModal}
				onClose={handleCloseDeleteModal}
				onConfirm={handleConfirmDelete}
				variant="danger"
				title="Excluir Template?"
				description={`Excluir "${name}" permanentemente? Esta ação não pode ser desfeita.`}
				confirmText="Sim, Excluir"
			/>
		</div>
	);
}
