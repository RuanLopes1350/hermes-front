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
    Plus
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { apiFetch } from "@/src/lib/api";
import { useToast } from "@/src/hooks/use-toast";
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

    // Estados de API Key
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [newKeyCredentialId, setNewKeyCredentialId] = useState("");
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [creatingKey, setCreatingKey] = useState(false);

    // Estado para modal de revogação
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [svcRes, keysRes, credsRes] = await Promise.all([
                apiFetch(`/api/services/${params.id}`),
                apiFetch(`/api/services/${params.id}/api-keys`),
                apiFetch(`/api/credentials`)
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

    const handleCreateKey = async () => {
        if (!newKeyName || !newKeyCredentialId) return;
        setCreatingKey(true);
        try {
            const response = await apiFetch(`/api/services/${params.id}/api-keys`, {
                method: "POST",
                body: JSON.stringify({ name: newKeyName, credentialId: newKeyCredentialId })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            setGeneratedKey(result.data.key);
            setApiKeys(prev => [result.data, ...prev]);
            toast({ title: "Chave Gerada", description: "Nova API Key criada com sucesso." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Erro ao gerar chave", description: error.message });
        } finally {
            setCreatingKey(false);
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

    const copyToClipboard = (text: string, msg = "Copiado!") => {
        navigator.clipboard.writeText(text);
        toast({ title: msg });
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

                    {/* SEÇÃO 2: API KEYS */}
                    <Card className="bg-surface border-border-subtle rounded-[40px] p-10 border shadow-sm">
                        <CardHeader className="p-0 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><KeyRound size={22} /></div>
                                <div>
                                    <CardTitle className="text-xl font-bold italic uppercase tracking-tighter text-foreground">Chaves de Acesso</CardTitle>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Gerencie as credenciais de integração</p>
                                </div>
                            </div>
                            <Button onClick={() => { setGeneratedKey(null); setShowKeyModal(true); }} className="gap-2 uppercase font-black tracking-widest text-[10px] px-6 h-12 rounded-xl">
                                <Plus size={16} /> Nova Chave
                            </Button>
                        </CardHeader>
                        
                        <CardContent className="p-0 space-y-4">
                            {apiKeys.length === 0 ? (
                                <div className="text-center py-12 bg-background/30 rounded-[32px] border border-dashed border-border-subtle">
                                    <p className="text-sm text-muted-foreground italic">Nenhuma chave gerada para este serviço.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {apiKeys.map(key => (
                                        <div key={key.id} className="flex items-center justify-between p-6 bg-background/50 rounded-3xl border border-border-subtle group hover:border-primary/20 transition-all">
                                            <div className="flex items-center gap-4">
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
                            
                            <div className="pt-6 border-t border-border-subtle/30 space-y-3">
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
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3 p-4 bg-background/50 rounded-2xl border border-border-subtle">
                                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                                <p className="text-xs font-bold text-foreground uppercase tracking-tight">API Sincronizada</p>
                            </div>
                            <p className="text-[9px] text-muted-foreground italic mt-3 px-1 leading-relaxed">
                                Este serviço está isolado. Alterações feitas aqui não afetam outros projetos no Hermes.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal de Nova Chave */}
            <Dialog open={showKeyModal} onOpenChange={setShowKeyModal}>
                <DialogContent className="bg-surface border-border-subtle rounded-[40px] max-w-lg p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-10 bg-background/30 text-center border-b border-border-subtle">
                        <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                            <KeyRound size={32} />
                        </div>
                        <DialogTitle className="text-2xl font-bold italic uppercase tracking-tighter">Gerar Nova API Key</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm mt-2 italic">Vincule uma credencial SMTP para habilitar envios.</DialogDescription>
                    </DialogHeader>

                    <div className="p-10 space-y-6 text-left">
                        {!generatedKey ? (
                            <>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nome da Chave</label>
                                    <Input placeholder="Ex: Backend Produção" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} className="bg-background border-border-subtle rounded-2xl h-14 italic" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Credencial Vinculada</label>
                                    <CustomSelect 
                                        value={newKeyCredentialId} 
                                        onValueChange={setNewKeyCredentialId}
                                        placeholder="Selecione um SMTP"
                                        options={credentials.map(c => ({ value: c.id, label: c.name }))}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-warning/10 border border-warning/20 p-4 rounded-2xl text-warning text-[10px] font-bold uppercase leading-relaxed">
                                    ⚠️ Copie sua chave agora. Por segurança, ela não será exibida novamente.
                                </div>
                                <div className="flex items-center gap-2 p-5 bg-background rounded-2xl border-2 border-primary/30 border-dashed">
                                    <code className="text-sm font-mono text-primary font-bold flex-1 break-all">{generatedKey}</code>
                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedKey)} className="text-primary hover:bg-primary/10">
                                        <Copy size={18} />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-10 bg-background/30 border-t border-border-subtle">
                        {!generatedKey ? (
                            <Button onClick={handleCreateKey} disabled={creatingKey || !newKeyName || !newKeyCredentialId} className="w-full py-7 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20">
                                {creatingKey ? <Loader2 className="animate-spin" size={20} /> : "Gerar Credencial"}
                            </Button>
                        ) : (
                            <Button onClick={() => { setShowKeyModal(false); setGeneratedKey(null); setNewKeyName(""); }} className="w-full py-7 rounded-2xl bg-foreground text-background text-xs font-black uppercase tracking-[0.2em]">
                                Fechar e Finalizar
                            </Button>
                        )}
                    </DialogFooter>
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
        </div>
    );
}
