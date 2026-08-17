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
	History,
	AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/src/lib/api';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/src/components/ui/sheet';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { ConfirmModal } from '@/src/components/ui/confirm-modal';
import { useToast } from '@/src/hooks/use-toast';
import { useTour } from '@/src/hooks/use-tour';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/src/components/ui/select';
import Editor, { OnMount } from '@monaco-editor/react';
import format from 'xml-formatter';
import { onMount } from 'better-auth/react';

interface Service {
	id: string;
	name: string;
}

// Gera um valor de teste plausível pro preview, com base em padrões comuns no nome da variável.
// Cai no formato [VARIAVEL] de sempre quando nenhum padrão é reconhecido.
function generatePreviewValue(varName: string): string {
	const key = varName.toLowerCase();

	if (key.includes('email')) return 'joao@exemplo.com';
	if (key.includes('nome') || key.includes('name')) return 'João da Silva';
	if (key.includes('telefone') || key.includes('phone')) return '(11) 91234-5678';
	if (key.includes('link') || key.includes('url')) return 'https://exemplo.com/acao';
	if (key.includes('data') || key.includes('date')) {
		return new Date().toLocaleDateString('pt-BR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	}
	if (
		key.includes('valor') ||
		key.includes('total') ||
		key.includes('preco') ||
		key.includes('preço') ||
		key.includes('price')
	) {
		return (149.9).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	}

	return `[${varName.toUpperCase()}]`;
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

	// History Modal
	const [showHistoryModal, setShowHistoryModal] = useState(false);
	const [logs, setLogs] = useState<any[]>([]);
	const [loadingLogs, setLoadingLogs] = useState(false);
	const [logsOffset, setLogsOffset] = useState(0);
	const [hasMoreLogs, setHasMoreLogs] = useState(true);
	const LOGS_LIMIT = 20;

	const fetchLogs = useCallback(
		async (offset = 0) => {
			setLoadingLogs(true);
			try {
				const res = await apiFetch(
					`/api/templates/${id}/logs?limit=${LOGS_LIMIT}&offset=${offset}`,
				);
				if (!res.ok) throw new Error();
				const result = await res.json();

				if (offset === 0) setLogs(result.data);
				else setLogs((prev) => [...prev, ...result.data]);

				if (result.data.length < LOGS_LIMIT) setHasMoreLogs(false);
				else setHasMoreLogs(true);
			} catch (e) {
				toast({
					variant: 'destructive',
					title: 'Erro',
					description: 'Não foi possível carregar o histórico.',
				});
			} finally {
				setLoadingLogs(false);
			}
		},
		[id, toast],
	);

	useEffect(() => {
		if (showHistoryModal && logs.length === 0) {
			setLogsOffset(0);
			fetchLogs(0);
		}
	}, [showHistoryModal, logs.length, fetchLogs]);

	const loadMoreLogs = () => {
		const newOffset = logsOffset + LOGS_LIMIT;
		setLogsOffset(newOffset);
		fetchLogs(newOffset);
	};

	// Data States
	const [name, setName] = useState('');
	const [subject, setSubject] = useState('');
	const [content, setContent] = useState(''); // Este é o código MJML
	const [htmlPreview, setHtmlPreview] = useState('');
	const [previewErrors, setPreviewErrors] = useState<string[]>([]);
	const [serviceId, setServiceId] = useState<string | null>(null);
	const [isGlobal, setIsGlobal] = useState(false);
	const [services, setServices] = useState<Service[]>([]);

	// Snapshot do último estado salvo (carregado ou pós-save), usado pra detectar alterações não salvas.
	const [savedSnapshot, setSavedSnapshot] = useState<{
		name: string;
		subject: string;
		content: string;
		serviceId: string | null;
		isGlobal: boolean;
	} | null>(null);

	const isDirty =
		savedSnapshot !== null &&
		(name !== savedSnapshot.name ||
			subject !== savedSnapshot.subject ||
			content !== savedSnapshot.content ||
			serviceId !== savedSnapshot.serviceId ||
			isGlobal !== savedSnapshot.isGlobal);

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (!isDirty) return;
			e.preventDefault();
			e.returnValue = '';
		};
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [isDirty]);

	// Variáveis agora são derivadas 100% do código (sem input manual)
	const detectedVariables = useMemo(() => {
		if (!content) return [];
		const matches = content.match(/\{\{\{?([^{}]+)\}?\}\}/g);
		if (!matches) return [];

		const detected = Array.from(
			new Set(
				matches
					.map((m) => {
						let v = m.replace(/\{|\}/g, '').trim();
						if (v.startsWith('#') || v.startsWith('/') || v.startsWith('!') || v === 'else')
							return null;
						return v.split(' ')[0];
					})
					.filter(Boolean),
			),
		) as string[];

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
				setSavedSnapshot({
					name: t.name,
					subject: t.subject_template || '',
					content: t.html_content || '',
					serviceId: t.service_id,
					isGlobal: t.global,
				});
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
					(acc, v) => ({ ...acc, [v]: generatePreviewValue(v) }),
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
					setPreviewErrors(result.errors || []);
				} else {
					const result = await response.json().catch(() => null);
					setPreviewErrors([result?.message || 'Falha ao gerar o preview.']);
				}
			} catch (err) {
				console.error('Falha no preview:', err);
				setPreviewErrors(['Falha de conexão ao gerar o preview.']);
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
			// Enviamos o código para a api renderizar. Não tratamos isso no frontend.
			const response = await apiFetch(`/api/templates/${id}`, {
				method: 'PATCH',
				body: JSON.stringify({
					name,
					subject_template: subject,
					html_content: content,
					global: isGlobal,
					service_id: isGlobal ? null : serviceId,
				}),
			});

			if (!response.ok) {
				const result = await response.json().catch(() => null);
				throw new Error(result?.message || 'Falha ao salvar o template.');
			}

			setSavedSnapshot({
				name,
				subject,
				content,
				serviceId: isGlobal ? null : serviceId,
				isGlobal,
			});
			toast({ title: 'Sucesso', description: 'Template salvo com sucesso.' });
		} catch (err: any) {
			console.error('Erro ao salvar:', err);
			toast({
				variant: 'destructive',
				title: 'Erro ao salvar',
				description: err.message || 'Falha ao salvar o template.',
			});
		} finally {
			setSaving(false);
		}
	};

	// 3b. RESTAURAR VERSÃO ANTERIOR (a partir do snapshot guardado no histórico)
	const [showRestoreModal, setShowRestoreModal] = useState(false);
	const [logToRestore, setLogToRestore] = useState<any>(null);

	const handleRequestRestore = (log: any) => {
		setLogToRestore(log);
		setShowRestoreModal(true);
	};

	const handleConfirmRestore = () => {
		const snapshot = logToRestore?.metadata?.snapshot;
		if (!snapshot) return;

		setName(snapshot.name ?? '');
		setSubject(snapshot.subject_template ?? '');
		setContent(snapshot.html_content ?? '');
		setIsGlobal(!!snapshot.global);
		setServiceId(snapshot.service_id ?? null);

		setShowRestoreModal(false);
		setLogToRestore(null);
		setShowHistoryModal(false);

		toast({
			title: 'Versão restaurada no editor',
			description: 'Confira o conteúdo e clique em "Salvar" para confirmar a restauração.',
		});
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

	const { startTour, moveNext, movePrevious, destroy } = useTour([
		{
			element: '#tour-template-subject',
			popover: {
				title: 'Assunto do E-mail',
				description: 'Defina o assunto que será usado quando este template for disparado.',
				side: 'bottom',
			},
		},
		{
			element: '#tour-template-editor',
			// O Monaco Editor é carregado de forma assíncrona; espera ele montar de verdade.
			waitForElement: 1500,
			popover: {
				title: 'Editor MJML',
				description: 'Escreva o layout do e-mail em MJML. Use {{variavel}} para marcar pontos que serão preenchidos dinamicamente pelo Handlebars.',
				side: 'right',
			},
		},
		{
			element: '#tour-template-preview',
			popover: {
				title: 'Preview em Tempo Real',
				description: 'O HTML final compilado aparece aqui automaticamente, poucos segundos depois de você parar de digitar.',
				side: 'left',
			},
		},
		{
			element: '#tour-template-vars',
			popover: {
				title: 'Variáveis Detectadas',
				description: 'Toda variável {{assim}} usada no código MJML é detectada automaticamente e listada aqui — sem precisar declarar nada manualmente.',
				side: 'left',
			},
		},
		{
			element: '#tour-template-save',
			popover: {
				title: 'Salvar',
				description: 'Salva o template. Ele fica disponível imediatamente para uso via template_id nas requisições de e-mail.',
				side: 'bottom',
			},
		},
		{
			element: '#tour-template-history',
			popover: {
				title: 'Histórico',
				description: 'Vamos abrir o histórico de alterações deste template. Clique em Próximo.',
				side: 'bottom',
				onNextClick: () => {
					setShowHistoryModal(true);
					moveNext();
				},
			},
		},
		{
			element: '#tour-template-history-panel',
			// Aguarda o painel (Sheet, renderizado via portal pelo Radix) montar no DOM.
			waitForElement: 1000,
			popover: {
				title: 'Registro de Auditoria',
				description: 'Toda edição, criação e exclusão relacionada a este template fica registrada aqui, com autor e data/hora.',
				side: 'left',
				onNextClick: () => {
					setShowHistoryModal(false);
					moveNext();
				},
				onPrevClick: () => {
					setShowHistoryModal(false);
					movePrevious();
				},
				onCloseClick: () => {
					setShowHistoryModal(false);
					destroy();
				},
			},
		},
	]);

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
		<div className="h-[calc(100vh-140px)] flex flex-col gap-4 overflow-hidden text-left animate-in fade-in duration-300 ease-out">
			<div className="flex flex-col md:flex-row md:items-start justify-between gap-4 shrink-0">
				<div className="flex items-center gap-4 text-left">
					<Link href="/system/templates">
						<Button
							variant="outline"
							size="icon"
							className="cursor-pointer h-10 w-10 rounded-xl bg-card border text-muted-foreground hover:text-primary text-left shadow-sm"
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
								className={`${isGlobal ? 'bg-primary/10 text-primary hover:bg-primary/10' : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10'} border-none text-[9px] font-bold uppercase gap-1 px-2 py-0.5 cursor-default`}
							>
								{isGlobal ? <Globe size={10} /> : <Server size={10} />}
								{isGlobal ? 'Global' : services.find((s) => s.id === serviceId)?.name || 'Privado'}
							</Badge>
						</div>
						<div
							onClick={() => {
								navigator.clipboard.writeText(id as string);
								toast({
									title: 'Copiado!',
									description: 'ID do template copiado para a área de transferência.',
								});
							}}
							className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground hover:text-primary cursor-pointer w-fit transition-colors"
							title="Clique para copiar o ID"
						>
							<span className="font-mono">ID: {id}</span>
							<Copy size={12} />
						</div>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2 sm:gap-3 text-left">
					<Button
						onClick={startTour}
						variant="outline"
						className="cursor-pointer border-primary text-primary hover:bg-primary/10 gap-2 font-bold text-[10px] uppercase tracking-widest h-10 px-5 shadow-sm"
					>
						Tour Guiado
					</Button>

					<div id="tour-template-subject" className="flex items-center gap-2 bg-card border rounded-xl px-3 py-1 h-10 text-left flex-1 min-w-[180px] shadow-sm">
						<span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-left whitespace-nowrap">
							Assunto:
						</span>
						<input
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
							className="bg-transparent border-none text-[11px] font-medium italic focus:ring-0 w-full text-foreground placeholder:opacity-30 outline-none"
							placeholder="Assunto do e-mail..."
						/>
					</div>

					{/* <Button
						variant="outline"
						onClick={() => handlePreview(content)}
						disabled={rendering}
						className="cursor-pointer gap-2 font-bold text-[10px] uppercase tracking-widest h-10 px-5 border hover:bg-muted shadow-sm"
					>
						<RefreshCw size={14} className={rendering ? 'animate-spin' : ''} /> Preview
					</Button> */}

					<Button
						id="tour-template-history"
						variant="outline"
						onClick={() => setShowHistoryModal(true)}
						className="cursor-pointer gap-2 font-bold text-[10px] uppercase tracking-widest h-10 px-5 border hover:bg-muted shadow-sm"
					>
						<History size={14} /> Histórico
					</Button>

					<Button
						id="tour-template-save"
						onClick={handleSave}
						disabled={saving || deleting}
						className="cursor-pointer gap-2 font-black text-[10px] uppercase tracking-widest h-10 px-6"
					>
						{saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
						Salvar
					</Button>

					<Button
						variant="outline"
						onClick={handleRequestDelete}
						disabled={deleting || saving}
						className="cursor-pointer h-10 w-10 p-0 rounded-xl border bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all shadow-sm"
					>
						{deleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={18} />}
					</Button>
				</div>
			</div>

			{isGlobal && (
				<div className="shrink-0 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 flex items-center gap-2 text-xs text-foreground">
					<Globe className="h-4 w-4 shrink-0 text-warning" />
					<span>
						Este é um template <strong>global</strong> — alterações salvas aqui afetam todos os
						serviços que o utilizam, não só o seu.
					</span>
				</div>
			)}

			<div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 text-left overflow-auto lg:overflow-hidden">
				<Card id="tour-template-editor" className="flex-1 bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col text-left">
					<div className="p-4 border-b bg-muted/30 flex items-center justify-between text-left">
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

				<div className="w-full lg:w-[450px] flex flex-col gap-4 lg:gap-6 shrink-0 text-left">
					<Card id="tour-template-preview" className="flex-1 bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col relative text-left">
						<div className="p-4 border-b bg-muted/30 flex items-center justify-between text-left">
							<div className="flex items-center gap-2 text-left">
								<Eye size={14} className="text-emerald-500" />
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
						{previewErrors.length > 0 && (
							<div className="border-b bg-warning/10 px-4 py-3 flex gap-2 text-xs text-foreground">
								<AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-warning" />
								<div className="flex flex-col gap-1">
									<span className="font-semibold text-warning">
										{previewErrors.length === 1
											? '1 aviso de validação do MJML'
											: `${previewErrors.length} avisos de validação do MJML`}
									</span>
									{previewErrors.map((e, i) => (
										<span key={i} className="text-muted-foreground">
											{e}
										</span>
									))}
								</div>
							</div>
						)}
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

					<Card id="tour-template-vars" className="bg-card rounded-xl shadow-sm p-5 border shrink-0 text-left">
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
									<span className="text-xs text-muted-foreground italic">
										Nenhuma variável no código.
									</span>
								) : (
									detectedVariables.map((tag) => (
										<Badge
											key={tag}
											variant="outline"
											className="bg-background/50 border-border-subtle text-primary font-mono text-[9px] gap-2 py-1.5 px-3"
										>
											{'{{' + tag + '}}'}
										</Badge>
									))
								)}
							</div>
						</div>
					</Card>
				</div>
			</div>

			<ConfirmModal
				isOpen={showRestoreModal}
				onClose={() => {
					setShowRestoreModal(false);
					setLogToRestore(null);
				}}
				onConfirm={handleConfirmRestore}
				variant="primary"
				title="Restaurar esta versão?"
				description={
					logToRestore
						? `Isso vai substituir o conteúdo atual do editor pela versão de ${new Date(
								logToRestore.createdAt,
							).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' })}. Nada é salvo até você clicar em "Salvar".`
						: ''
				}
				confirmText="Restaurar no editor"
			/>

			<ConfirmModal
				isOpen={showDeleteModal}
				onClose={handleCloseDeleteModal}
				onConfirm={handleConfirmDelete}
				variant="danger"
				title="Excluir Template?"
				description={`Excluir "${name}" permanentemente? Esta ação não pode ser desfeita.`}
				confirmText="Sim, Excluir"
			/>

			<Sheet open={showHistoryModal} onOpenChange={setShowHistoryModal}>
				<SheetContent id="tour-template-history-panel" className="sm:max-w-[500px] w-[90vw] overflow-y-auto">
					<SheetHeader className="mb-6">
						<SheetTitle className="flex items-center gap-2">
							<History className="h-5 w-5" /> Histórico de Ações
						</SheetTitle>
						<SheetDescription>
							Registro de auditoria de tudo que aconteceu neste template.
						</SheetDescription>
					</SheetHeader>

					<div className="space-y-6">
						{logs.length === 0 && !loadingLogs ? (
							<div className="text-center py-10 text-muted-foreground">
								<p>Nenhum registro encontrado.</p>
							</div>
						) : (
							<div className="relative border-l border-muted-foreground/20 ml-3 space-y-6 pb-6">
								{logs.map((log) => (
									<div key={log.id} className="relative pl-6">
										<span className="absolute -left-1.5 top-1.5 flex h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
										<div className="flex flex-col gap-1">
											<span className="text-xs text-muted-foreground font-medium">
												{new Date(log.createdAt).toLocaleString('pt-BR', {
													dateStyle: 'short',
													timeStyle: 'medium',
												})}
											</span>
											<p className="text-sm font-semibold">{log.action}</p>
											<p className="text-sm text-muted-foreground">{log.description}</p>
											{log.actorName && (
												<p className="text-xs text-muted-foreground mt-1">
													Realizado por:{' '}
													<span className="font-medium text-foreground">{log.actorName}</span> (
													{log.actorEmail})
												</p>
											)}
											{log.metadata?.snapshot && (
												<Button
													variant="outline"
													size="sm"
													className="mt-2 w-fit cursor-pointer"
													onClick={() => handleRequestRestore(log)}
												>
													<RefreshCw className="mr-1.5 h-3 w-3" />
													Restaurar esta versão
												</Button>
											)}
										</div>
									</div>
								))}
							</div>
						)}

						{loadingLogs && (
							<div className="flex justify-center py-4">
								<Loader2 className="h-6 w-6 animate-spin text-primary" />
							</div>
						)}

						{hasMoreLogs && !loadingLogs && logs.length > 0 && (
							<div className="flex justify-center pt-2">
								<Button
									variant="outline"
									size="sm"
									onClick={loadMoreLogs}
									className="cursor-pointer"
								>
									Carregar mais
								</Button>
							</div>
						)}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
