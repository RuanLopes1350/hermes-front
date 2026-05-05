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
    Bell
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { apiFetch } from "@/src/lib/api";
import { useToast } from "@/src/hooks/use-toast";

interface ServiceSettings {
    timezone: string;
    defaultSenderName: string;
    replyTo: string;
    notifyOnFailure: boolean;
}

interface Service {
    id: string;
    name: string;
    settings: ServiceSettings | any;
    createdAt: string;
    updatedAt: string;
}

const DEFAULT_SETTINGS: ServiceSettings = {
    timezone: "America/Sao_Paulo",
    defaultSenderName: "",
    replyTo: "",
    notifyOnFailure: true
};

export default function ServiceDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Estados editáveis
    const [editName, setEditName] = useState("");
    const [editSettings, setEditSettings] = useState<ServiceSettings>(DEFAULT_SETTINGS);

    const fetchService = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiFetch(`/api/services/${params.id}`);
            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.message || "Serviço não encontrado.");
            }

            const data = result.data;
            setService(data);
            setEditName(data.name);
            
            // Mesclar settings vindos do banco com os padrões para evitar undefined
            setEditSettings({
                ...DEFAULT_SETTINGS,
                ...(data.settings || {})
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao carregar",
                description: error.message
            });
            router.push("/system/services");
        } finally {
            setLoading(false);
        }
    }, [params.id, router, toast]);

    useEffect(() => {
        if (params.id) fetchService();
    }, [params.id, fetchService]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await apiFetch(`/api/services/${params.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    name: editName,
                    settings: editSettings
                })
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.message || "Erro ao salvar alterações.");
            }

            toast({
                title: "Configurações Salvas",
                description: "As alterações do serviço foram aplicadas com sucesso."
            });
            setService(result.data);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Falha ao salvar",
                description: error.message
            });
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copiado!",
            description: "ID do serviço copiado para a área de transferência."
        });
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-12 text-left">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/system/services">
                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-surface border-border-subtle text-muted-foreground hover:text-primary group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-3xl font-bold tracking-tight uppercase text-foreground">{service?.name}</h2>
                        <span className="px-3 py-1 bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1.5">
                            <CheckCircle2 size={12} /> Ativo
                        </span>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium italic">Configurações técnicas e parâmetros do serviço.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Configurações do Serviço */}
                    <Card className="bg-surface border-border-subtle rounded-[40px] p-10 border shadow-sm">
                        <CardHeader className="p-0 mb-10 flex flex-row items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                <Settings size={22} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold italic uppercase tracking-tighter text-foreground">Ajustes do Projeto</CardTitle>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Personalize o comportamento global</p>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-0 space-y-10">
                            {/* Nome e Timezone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                        <Code size={12} className="text-primary" /> Nome do Serviço
                                    </label>
                                    <Input 
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="bg-background border-border-subtle rounded-2xl px-6 py-7 text-base focus:border-primary transition-all font-medium italic h-14" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                        <Globe size={12} className="text-primary" /> Timezone (Fuso)
                                    </label>
                                    <Select 
                                        value={editSettings.timezone} 
                                        onValueChange={(val) => setEditSettings(prev => ({ ...prev, timezone: val }))}
                                    >
                                        <SelectTrigger className="bg-background border-border-subtle rounded-2xl px-6 py-7 text-base focus:border-primary font-medium italic h-14">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-surface border-border-subtle">
                                            <SelectItem value="America/Sao_Paulo">GMT-3 (Brasília)</SelectItem>
                                            <SelectItem value="UTC">UTC (Universal)</SelectItem>
                                            <SelectItem value="America/New_York">GMT-5 (New York)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Configurações de E-mail (JSON Settings) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                        <Mail size={12} className="text-primary" /> Nome do Remetente Padrão
                                    </label>
                                    <Input 
                                        placeholder="Ex: Suporte Hermes"
                                        value={editSettings.defaultSenderName}
                                        onChange={(e) => setEditSettings(prev => ({ ...prev, defaultSenderName: e.target.value }))}
                                        className="bg-background border-border-subtle rounded-2xl px-6 py-7 text-base focus:border-primary transition-all font-medium italic h-14" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                        <RefreshCw size={12} className="text-primary" /> E-mail de Resposta (Reply-To)
                                    </label>
                                    <Input 
                                        type="email"
                                        placeholder="Ex: help@suaempresa.com"
                                        value={editSettings.replyTo}
                                        onChange={(e) => setEditSettings(prev => ({ ...prev, replyTo: e.target.value }))}
                                        className="bg-background border-border-subtle rounded-2xl px-6 py-7 text-base focus:border-primary transition-all font-medium italic h-14" 
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-background/50 rounded-3xl border border-border-subtle group hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                        <Bell size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-foreground">Notificar Falhas</p>
                                        <p className="text-[10px] text-muted-foreground italic font-medium">Receber alerta administrativo em caso de erro crítico no envio.</p>
                                    </div>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={editSettings.notifyOnFailure}
                                    onChange={(e) => setEditSettings(prev => ({ ...prev, notifyOnFailure: e.target.checked }))}
                                    className="w-10 h-5 appearance-none bg-border-subtle checked:bg-primary rounded-full relative cursor-pointer transition-all after:content-[''] after:absolute after:w-4 after:h-4 after:bg-white after:rounded-full after:top-0.5 after:left-0.5 checked:after:left-5 after:transition-all"
                                />
                            </div>

                            {/* Ações */}
                            <div className="pt-8 border-t border-border-subtle/50 flex flex-col md:flex-row gap-4">
                                <Button 
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 py-7 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-hover h-14 gap-2"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : "Salvar Alterações"} <Save size={18} />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Identificadores Reais */}
                    <Card className="bg-surface border-border-subtle rounded-3xl p-8 space-y-6 border text-left shadow-sm">
                        <CardHeader className="p-0">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Code size={14} className="text-primary" /> Identificadores
                            </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="p-0 space-y-6">
                            <div className="space-y-2 text-left">
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em]">Service ID (Endpoint Header)</p>
                                <div className="flex items-center gap-2 p-4 bg-background rounded-xl border border-border-subtle group hover:border-primary/20 transition-all">
                                    <code className="text-xs font-mono text-primary flex-1 truncate">{service?.id}</code>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => copyToClipboard(service?.id || "")}
                                        className="h-8 w-8 hover:bg-primary/10 text-muted-foreground hover:text-primary"
                                    >
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
        </div>
    );
}
