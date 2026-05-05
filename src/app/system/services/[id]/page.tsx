"use client";

import { 
    ArrowLeft, 
    Settings, 
    Code,
    Copy,
    Save,
    Trash2,
    RefreshCw,
    Loader2,
    CheckCircle2,
    Globe,
    Mail,
    Bell,
    KeyRound,
    Plus,
    Settings2,
    Shield,
    Check,
    AlertCircle,
    Key
} from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/api";
import { useToast } from "@/src/hooks/use-toast";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
import { CustomSelect } from "@/src/components/ui/custom-select";

interface ServiceSettings {
    timezone: string;
    defaultSenderName: string;
    replyTo: string;
    notifyOnFailure: boolean;
    defaultPriority: "high" | "medium" | "low";
}

interface Service {
    id: string;
    name: string;
    settings: ServiceSettings | any;
    createdAt: string;
    updatedAt: string;
}

interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    is_active: boolean;
    last_used_at: string | null;
    expiresAt: string | null;
    createdAt: string;
    key?: string;
}

interface Credential {
    id: string;
    name: string;
    auth_type: 'plain' | 'oauth2';
    login: string;
    smtp_host: string;
    refresh_token?: string | null;
}

const DEFAULT_SETTINGS: ServiceSettings = {
    timezone: "America/Sao_Paulo",
    defaultSenderName: "",
    replyTo: "",
    notifyOnFailure: true,
    defaultPriority: "medium"
};

export default function ServiceDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const [service, setService] = useState<Service | null>(null);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // Estados editáveis do serviço
    const [editName, setEditName] = useState("");
    const [editSettings, setEditSettings] = useState<ServiceSettings>(DEFAULT_SETTINGS);

    // Estados de Conexão e API Key (Unificado)
    const [showConnModal, setShowConnModal] = useState(false);
    const [selectedType, setSelectedType] = useState<'plain' | 'oauth2' | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        login: "",
        smtpHost: "",
        smtpPort: "465",
        smtpSecure: true,
        passkey: "",
        clientId: "",
        clientSecret: ""
    });
    const [generatedKey, setGeneratedKey] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    // Estado para revogação de chave
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);

    // Estado para exclusão de credencial
    const [showDeleteCredModal, setShowDeleteCredModal] = useState(false);
    const [credToDelete, setCredToDelete] = useState<{id: string, name: string} | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [svcRes, keysRes, credsRes] = await Promise.all([
                apiFetch(`/api/services/${params.id}`),
                apiFetch(`/api/services/${params.id}/api-keys`),
                apiFetch(`/api/services/${params.id}/credentials`)
            ]);

            const svcData = await svcRes.json();
            const keysData = await keysRes.json();
            const credsData = await credsRes.json();

            if (!svcRes.ok) throw new Error(svcData.message || "Erro ao carregar serviço.");

            setService(svcData.data);
            setEditName(svcData.data.name);
            setEditSettings({ ...DEFAULT_SETTINGS, ...(svcData.data.settings || {}) });
            setApiKeys(keysData.data || []);
            setCredentials(credsData.data || []);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Erro de carregamento", description: error.message });
            router.push("/system/services");
        } finally {
            setLoading(false);
        }
    }, [params.id, router, toast]);

    useEffect(() => {
        if (params.id) fetchData();
    }, [params.id, fetchData]);

    const handleSaveService = async () => {
        setSaving(true);
        try {
            const response = await apiFetch(`/api/services/${params.id}`, {
                method: "PATCH",
                body: JSON.stringify({ name: editName, settings: editSettings })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            toast({ title: "Sucesso", description: "Configurações salvas." });
            setService(result.data);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Falha ao salvar", description: error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteService = async () => {
        try {
            const response = await apiFetch(`/api/services/${params.id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Erro ao excluir serviço.");
            toast({ title: "Serviço Excluído" });
            router.push("/system/services");
        } catch (error: any) {
            toast({ variant: "destructive", title: "Erro", description: error.message });
        }
    };

    const handleCreateConnection = async () => {
        if (!selectedType) return;
        setSubmitting(true);
        setError("");
        try {
            const response = await apiFetch(`/api/services/${params.id}/credentials`, {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    authType: selectedType
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Erro ao criar conexão.");
            
            setGeneratedKey(result.data.initial_api_key);
            fetchData(); // Atualiza listas
            toast({ title: "Conexão Criada" });
        } catch (error: any) {
            setError(error.message);
            toast({ variant: "destructive", title: "Erro", description: error.message });
        } finally {
            setSubmitting(false);
        }
    };

    const confirmRevokeKey = (id: string) => {
        setKeyToRevoke(id);
        setShowRevokeModal(true);
    };

    const handleRevokeKey = async () => {
        if (!keyToRevoke) return;
        try {
            const response = await apiFetch(`/api/services/${params.id}/api-keys/${keyToRevoke}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Falha ao revogar.");
            setApiKeys(prev => prev.filter(k => k.id !== keyToRevoke));
            toast({ title: "Chave Revogada" });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Erro", description: error.message });
        } finally {
            setKeyToRevoke(null);
            setShowRevokeModal(false);
        }
    };

    const confirmDeleteCredential = (id: string, name: string) => {
        setCredToDelete({ id, name });
        setShowDeleteCredModal(true);
    };

    const handleDeleteCredential = async () => {
        if (!credToDelete) return;
        try {
            const response = await apiFetch(`/api/services/${params.id}/credentials/${credToDelete.id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Erro ao excluir credencial.");
            setCredentials(prev => prev.filter(c => c.id !== credToDelete.id));
            toast({ title: "Credencial Removida" });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Erro", description: error.message });
        } finally {
            setCredToDelete(null);
            setShowDeleteCredModal(false);
        }
    };

    const copyToClipboard = (text: string, msg = "Copiado!") => {
        navigator.clipboard.writeText(text);
        toast({ title: msg });
    };

    const closeModal = () => {
        setShowConnModal(false);
        setSelectedType(null);
        setGeneratedKey(null);
        setError("");
        setFormData({
            name: "", login: "", smtpHost: "", smtpPort: "465", 
            smtpSecure: true, passkey: "", clientId: "", clientSecret: ""
        });
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>;

    return (
        <div className="space-y-12 text-left pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/system/services">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-surface border-border-subtle text-muted-foreground hover:text-primary group">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-3xl font-bold tracking-tight uppercase text-foreground">{service?.name}</h2>
                            <Badge className="bg-success/10 text-success border-none uppercase text-[10px]">Ativo</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm italic">Gestão de segurança e parâmetros do motor de e-mail.</p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => setShowDeleteModal(true)} className="bg-danger/10 text-danger border-none h-12 px-6 rounded-xl uppercase font-black text-[10px] gap-2 hover:bg-danger/20">
                    <Trash2 size={16} /> Excluir Serviço
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-12">
                    
                    {/* SEÇÃO 1: CONFIGURAÇÕES */}
                    <Card className="bg-surface border-border-subtle rounded-[40px] p-10 border shadow-sm">
                        <CardHeader className="p-0 mb-10 flex flex-row items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Settings size={22} /></div>
                            <div>
                                <CardTitle className="text-xl font-bold italic uppercase tracking-tighter text-foreground">Ajustes do Projeto</CardTitle>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Configurações de Identidade e Fluxo</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Nome do Serviço</label>
                                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-background border-border-subtle rounded-2xl px-6 py-7 text-base focus:border-primary font-medium italic h-14" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Timezone</label>
                                    <CustomSelect 
                                        value={editSettings.timezone} 
                                        onValueChange={(val) => setEditSettings(prev => ({ ...prev, timezone: val }))}
                                        options={[
                                            { value: "America/Sao_Paulo", label: "GMT-3 (Brasília)" },
                                            { value: "UTC", label: "UTC (Universal)" },
                                            { value: "America/New_York", label: "GMT-5 (New York)" }
                                        ]}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Prioridade Padrão</label>
                                    <CustomSelect 
                                        value={editSettings.defaultPriority || "medium"} 
                                        onValueChange={(val: any) => setEditSettings(prev => ({ ...prev, defaultPriority: val }))}
                                        options={[
                                            { value: "high", label: "Alta (Fura-Fila)" },
                                            { value: "medium", label: "Média (Padrão)" },
                                            { value: "low", label: "Baixa (Background)" }
                                        ]}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Remetente Padrão</label>
                                    <Input placeholder="Ex: Suporte Hermes" value={editSettings.defaultSenderName} onChange={(e) => setEditSettings(prev => ({ ...prev, defaultSenderName: e.target.value }))} className="bg-background border-border-subtle rounded-2xl px-6 py-7 text-base focus:border-primary font-medium italic h-14" />
                                </div>
                            </div>
                            <div className="pt-6 border-t border-border-subtle/50">
                                <Button onClick={handleSaveService} disabled={saving} className="w-full md:w-fit px-12 py-7 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-hover h-14 gap-2">
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : "Salvar Alterações"} <Save size={18} />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SEÇÃO 2: SEGURANÇA E ACESSO */}
                    <Card className="bg-surface border-border-subtle rounded-[40px] p-10 border shadow-sm">
                        <CardHeader className="p-0 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Shield size={22} /></div>
                                <div>
                                    <CardTitle className="text-xl font-bold italic uppercase tracking-tighter text-foreground">Segurança e Acesso</CardTitle>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Conexões SMTP e Chaves de Integração</p>
                                </div>
                            </div>
                            <Button onClick={() => { setGeneratedKey(null); setSelectedType(null); setShowConnModal(true); }} className="gap-2 uppercase font-black tracking-widest text-[10px] px-6 h-12 rounded-xl">
                                <Plus size={16} /> Nova Conexão
                            </Button>
                        </CardHeader>
                        
                        <CardContent className="p-0 space-y-10">
                            {/* Lista de Remetentes */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2 text-left">Remetentes Configurados</h4>
                                {credentials.length === 0 ? (
                                    <div className="py-10 border border-dashed border-border-subtle rounded-3xl text-center italic text-muted-foreground text-sm">Nenhum remetente vinculado a este serviço.</div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {credentials.map(c => (
                                            <div key={c.id} className="flex items-center justify-between p-6 bg-background/50 rounded-3xl border border-border-subtle hover:border-primary/20 transition-all group">
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className="p-3 bg-surface rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                        {c.auth_type === 'oauth2' ? <FaGoogle size={20} /> : <Settings2 size={20} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">{c.name}</p>
                                                        <p className="text-[10px] text-muted-foreground italic">{c.login}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge className="bg-success/10 text-success border-none uppercase text-[8px]">
                                                        {c.auth_type === 'oauth2' && !c.refresh_token ? 'Pendente Auth' : 'Ativa'}
                                                    </Badge>
                                                    <Button variant="ghost" size="icon" onClick={() => confirmDeleteCredential(c.id, c.name)} className="text-muted-foreground hover:text-danger">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Lista de API Keys */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2 text-left">Chaves de API Geradas</h4>
                                {apiKeys.length === 0 ? (
                                    <div className="py-10 border border-dashed border-border-subtle rounded-3xl text-center italic text-muted-foreground text-sm">Crie uma conexão para obter uma chave de acesso.</div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {apiKeys.map(key => (
                                            <div key={key.id} className="flex items-center justify-between p-6 bg-background/30 rounded-3xl border border-border-subtle group hover:border-primary/10 transition-all">
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className="p-3 bg-surface rounded-2xl text-muted-foreground group-hover:text-primary transition-colors">
                                                        <Code size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">{key.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <code className="text-[10px] font-mono text-primary bg-primary/5 px-2 py-0.5 rounded-md">{key.prefix}...</code>
                                                            <span className="text-[10px] text-muted-foreground italic">• Criada em {new Date(key.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => confirmRevokeKey(key.id)} className="text-muted-foreground hover:text-danger">
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Identificadores */}
                    <Card className="bg-surface border-border-subtle rounded-3xl p-8 space-y-6 border text-left shadow-sm">
                        <CardHeader className="p-0">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Code size={14} className="text-primary" /> Identificadores
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em]">Service ID (Endpoint Header)</p>
                                <div className="flex items-center gap-2 p-4 bg-background rounded-xl border border-border-subtle group hover:border-primary/20 transition-all">
                                    <code className="text-xs font-mono text-primary flex-1 truncate">{service?.id}</code>
                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(service?.id || "")} className="h-8 w-8 hover:bg-primary/10 text-muted-foreground hover:text-primary">
                                        <Copy size={14} />
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-border-subtle/30 space-y-3 text-left">
                                <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter">
                                    <span className="text-muted-foreground">Criado em</span>
                                    <span className="text-foreground">{service ? new Date(service.createdAt).toLocaleDateString() : "-"}</span>
                                </div>
                                <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter">
                                    <span className="text-muted-foreground">Última Modificação</span>
                                    <span className="text-foreground">{service ? new Date(service.updatedAt).toLocaleDateString() : "-"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Meta Informações */}
                    <Card className="bg-surface border-border-subtle rounded-3xl p-8 space-y-4 border text-left shadow-sm">
                         <CardHeader className="p-0">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <RefreshCw size={14} className="text-primary" /> Status do Sistema
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 text-left">
                            <div className="flex items-center gap-3 p-4 bg-background/50 rounded-2xl border border-border-subtle">
                                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                                <p className="text-xs font-bold text-foreground uppercase tracking-tight">API Sincronizada</p>
                            </div>
                            <p className="text-[9px] text-muted-foreground italic mt-3 px-1 leading-relaxed text-left">
                                Este serviço está isolado. Alterações feitas aqui não afetam outros projetos no Hermes.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal de Nova Conexão (UNIFICADO) */}
            <Dialog open={showConnModal} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="bg-surface border-border-subtle w-full max-w-2xl rounded-[40px] shadow-2xl p-0 overflow-hidden text-left">
                    {!generatedKey ? (
                        <>
                            <DialogHeader className="p-10 border-b border-border-subtle bg-background/30 text-center">
                                <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                                    <Shield size={32} />
                                </div>
                                <DialogTitle className="text-2xl font-bold italic uppercase tracking-tighter text-foreground">Nova Conexão</DialogTitle>
                                <DialogDescription className="text-muted-foreground text-sm mt-2 italic text-center">Vincule um provedor de e-mail ao seu projeto.</DialogDescription>
                            </DialogHeader>
                            
                            <div className="p-10 space-y-6 max-h-[500px] overflow-y-auto scrollbar-hide text-left">
                                {error && <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl text-danger text-[10px] font-bold uppercase">{error}</div>}
                                
                                {!selectedType ? (
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <div onClick={() => setSelectedType('plain')} className="p-6 border-2 border-border-subtle rounded-3xl hover:border-primary/50 cursor-pointer transition-all text-left group">
                                            <Settings2 className="text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                                            <h4 className="font-bold text-sm text-foreground">SMTP Padrão</h4>
                                            <p className="text-[10px] text-muted-foreground mt-1 italic">Outlook, SendGrid, SES...</p>
                                        </div>
                                        <div onClick={() => setSelectedType('oauth2')} className="p-6 border-2 border-border-subtle rounded-3xl hover:border-primary/50 cursor-pointer transition-all text-left group">
                                            <FaGoogle className="text-primary mb-3" />
                                            <h4 className="font-bold text-sm text-foreground">Google OAuth2</h4>
                                            <p className="text-[10px] text-muted-foreground mt-1 italic">Workspace, Gmail seguro...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                                        <button onClick={() => setSelectedType(null)} className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">← Mudar Provedor</button>
                                        
                                        <div className="grid grid-cols-1 gap-6 text-left">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase px-1 text-left">Nome da Chave/Conexão</label>
                                                <Input 
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                    className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm focus:border-primary font-medium h-12" 
                                                    placeholder="Ex: Suporte Global" 
                                                />
                                            </div>
                                            <div className="space-y-2 text-left">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase px-1 text-left">E-mail do Remetente</label>
                                                <Input 
                                                    value={formData.login}
                                                    onChange={(e) => setFormData({...formData, login: e.target.value})}
                                                    className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm focus:border-primary font-medium h-12" 
                                                    placeholder="contato@empresa.com" 
                                                />
                                            </div>

                                            {selectedType === 'plain' ? (
                                                <div className="space-y-6 text-left">
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div className="col-span-2 space-y-2 text-left">
                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase px-1 text-left">Host SMTP</label>
                                                            <Input value={formData.smtpHost} onChange={(e) => setFormData({...formData, smtpHost: e.target.value})} className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm focus:border-primary font-medium h-12" />
                                                        </div>
                                                        <div className="space-y-2 text-left">
                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase px-1 text-left">Porta</label>
                                                            <Input value={formData.smtpPort} onChange={(e) => setFormData({...formData, smtpPort: e.target.value})} className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm focus:border-primary font-medium h-12" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 text-left">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase px-1 text-left">Senha/App Password</label>
                                                        <Input type="password" value={formData.passkey} onChange={(e) => setFormData({...formData, passkey: e.target.value})} className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm focus:border-primary font-medium h-12" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-6 text-left">
                                                    <div className="space-y-2 text-left">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase px-1 font-mono tracking-tighter text-left">Google Client ID</label>
                                                        <Input value={formData.clientId} onChange={(e) => setFormData({...formData, clientId: e.target.value})} className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm font-mono focus:border-primary h-12" />
                                                    </div>
                                                    <div className="space-y-2 text-left">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase px-1 font-mono tracking-tighter text-left">Google Client Secret</label>
                                                        <Input type="password" value={formData.clientSecret} onChange={(e) => setFormData({...formData, clientSecret: e.target.value})} className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm font-mono focus:border-primary h-12" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="p-10 bg-background/30 border-t border-border-subtle">
                                <Button 
                                    onClick={handleCreateConnection}
                                    disabled={submitting || !selectedType || !formData.name}
                                    className="w-full py-7 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-hover h-14"
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : "Salvar e Gerar Acesso"}
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <div className="p-12 text-center animate-in zoom-in duration-500">
                            <DialogTitle className="sr-only">Conexão Criada com Sucesso</DialogTitle>
                            <div className="bg-success/10 w-20 h-20 rounded-[30px] flex items-center justify-center text-success mx-auto mb-8">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-success mb-2 text-center">Conexão Criada!</h3>
                            <p className="text-muted-foreground text-sm italic mb-10 text-center">O Hermes gerou uma <span className="text-foreground font-bold">API Key exclusiva</span> para este remetente.</p>
                            
                            <div className="bg-background border-2 border-dashed border-success/30 rounded-3xl p-8 mb-8 relative group text-left">
                                <div className="flex items-center gap-2 mb-4 text-success font-bold text-[9px] uppercase tracking-widest text-left">
                                    <Key size={12} /> Seu Token de Acesso
                                </div>
                                <p className="text-xs font-mono text-foreground break-all leading-relaxed select-all text-left">
                                    {generatedKey.token}
                                </p>
                                <Button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedKey.token);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className={"absolute -top-4 right-6 px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all " + (
                                        copied ? 'bg-success text-white' : 'bg-primary text-white shadow-lg'
                                    )}
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? 'Copiado!' : 'Copiar'}
                                </Button>
                            </div>

                            <Button 
                                onClick={closeModal}
                                className="w-full py-7 rounded-2xl bg-surface border-2 border-border-subtle text-foreground text-xs font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all h-14"
                            >
                                Concluído
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmModal 
                isOpen={showDeleteModal} 
                onClose={() => setShowDeleteModal(false)} 
                onConfirm={handleDeleteService} 
                variant="danger" 
                title="Excluir Serviço?" 
                description={`O projeto "${service?.name}" e todos os seus dados serão apagados permanentemente.`}
                confirmText="Sim, Excluir Tudo"
            />

            <ConfirmModal 
                isOpen={showRevokeModal} 
                onClose={() => setShowRevokeModal(false)} 
                onConfirm={handleRevokeKey} 
                variant="danger" 
                title="Revogar Chave?" 
                description={`A chave deixará de funcionar imediatamente em todas as integrações. Continuar?`}
                confirmText="Sim, Revogar"
            />

            <ConfirmModal 
                isOpen={showDeleteCredModal} 
                onClose={() => setShowDeleteCredModal(false)} 
                onConfirm={handleDeleteCredential} 
                variant="danger" 
                title="Remover Conexão?" 
                description={`A conexão "${credToDelete?.name}" será removida. Isso impedirá o envio de e-mails usando este remetente.`}
                confirmText="Sim, Remover"
            />
        </div>
    );
}
