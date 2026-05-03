"use client";

import { 
    Plus, 
    Trash2, 
    AlertCircle,
    CheckCircle2,
    Settings2,
    Loader2,
    Copy,
    Check,
    Key,
    Shield,
    Eye
} from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/api";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Card } from "@/src/components/ui/card";

interface Service {
    id: string;
    name: string;
}

interface Credential {
    id: string;
    name: string;
    auth_type: 'plain' | 'oauth2';
    login: string;
    smtp_host: string;
    service_id: string;
    refresh_token?: string | null;
}

export default function CredentialsPage() {
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    const [selectedType, setSelectedType] = useState<'plain' | 'oauth2' | null>(null);
    const [selectedServiceId, setSelectedServiceId] = useState("");
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
    const [copied, setCopied] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [srvRes, credRes] = await Promise.all([
                apiFetch("/api/services"),
                apiFetch("/api/credentials") 
            ]);

            if (srvRes.ok) {
                const srvData = await srvRes.json();
                setServices(srvData.data || []);
            }

            if (credRes.ok) {
                const credData = await credRes.json();
                setCredentials(credData.data || []);
            }
        } catch (err) {
            console.error("Erro ao carregar dados:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateConnection = async () => {
        if (!selectedServiceId || !selectedType) return;
        setSubmitting(true);
        setError("");

        try {
            const response = await apiFetch(`/api/services/${selectedServiceId}/credentials`, {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    authType: selectedType
                })
            });

            const result = await response.json();

            if (response.ok) {
                setGeneratedKey(result.data.initial_api_key);
                loadInitialData();
            } else {
                setError(result.message || "Erro ao criar conexão.");
            }
        } catch (err) {
            setError("Falha na comunicação com o servidor.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAuthorizeGoogle = (serviceId: string, credId: string) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1350";
        window.location.href = `${apiUrl}/api/services/${serviceId}/credentials/${credId}/authorize`;
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedType(null);
        setGeneratedKey(null);
        setFormData({
            name: "", login: "", smtpHost: "", smtpPort: "465", 
            smtpSecure: true, passkey: "", clientId: "", clientSecret: ""
        });
    };

    return (
        <div className="space-y-10 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase text-foreground">Conexões de E-mail</h2>
                    <p className="text-muted-foreground text-sm font-medium italic">Configure seus remetentes e obtenha chaves de acesso instantaneamente.</p>
                </div>
                
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 uppercase font-black tracking-widest text-[10px]">
                            <Plus size={18} /> Nova Conexão
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-surface border-border-subtle w-full max-w-2xl rounded-[40px] shadow-2xl p-0 overflow-hidden">
                        {!generatedKey ? (
                            <>
                                <DialogHeader className="p-10 border-b border-border-subtle bg-background/30 text-center">
                                    <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                                        <Shield size={32} />
                                    </div>
                                    <DialogTitle className="text-2xl font-bold italic uppercase tracking-tighter text-foreground">Nova Conexão</DialogTitle>
                                    <DialogDescription className="text-muted-foreground text-sm mt-2 italic">Vincule um provedor de e-mail ao seu projeto.</DialogDescription>
                                </DialogHeader>
                                
                                <div className="p-10 space-y-6 max-h-[500px] overflow-y-auto scrollbar-hide text-left">
                                    {error && <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl text-danger text-[10px] font-bold uppercase">{error}</div>}
                                    
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">1. Selecione o Projeto (Serviço)</label>
                                        <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                                            <SelectTrigger className="w-full bg-background border-border-subtle rounded-2xl px-6 py-7 text-sm focus:border-primary outline-none italic font-medium">
                                                <SelectValue placeholder="Escolha um serviço..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-surface border-border-subtle">
                                                {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {!selectedType ? (
                                        <div className="grid grid-cols-2 gap-4 pt-4 text-left">
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
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Nome da Conexão</label>
                                                    <Input 
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                        className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm focus:border-primary font-medium h-12" 
                                                        placeholder="Ex: Suporte Global" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">E-mail do Remetente</label>
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
                                                            <div className="col-span-2 space-y-2">
                                                                <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Host SMTP</label>
                                                                <Input 
                                                                    value={formData.smtpHost}
                                                                    onChange={(e) => setFormData({...formData, smtpHost: e.target.value})}
                                                                    className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm focus:border-primary font-medium h-12" 
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Porta</label>
                                                                <Input 
                                                                    value={formData.smtpPort}
                                                                    onChange={(e) => setFormData({...formData, smtpPort: e.target.value})}
                                                                    className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm focus:border-primary font-medium h-12" 
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Senha/App Password</label>
                                                            <Input 
                                                                type="password"
                                                                value={formData.passkey}
                                                                onChange={(e) => setFormData({...formData, passkey: e.target.value})}
                                                                className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm focus:border-primary font-medium h-12" 
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6 text-left">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase px-1 font-mono tracking-tighter">Google Client ID</label>
                                                            <Input 
                                                                value={formData.clientId}
                                                                onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                                                                className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm font-mono focus:border-primary h-12" 
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase px-1 font-mono tracking-tighter">Google Client Secret</label>
                                                            <Input 
                                                                type="password"
                                                                value={formData.clientSecret}
                                                                onChange={(e) => setFormData({...formData, clientSecret: e.target.value})}
                                                                className="bg-background border-border-subtle rounded-xl px-4 py-6 text-sm font-mono focus:border-primary h-12" 
                                                            />
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
                                        disabled={submitting || !selectedServiceId || !selectedType}
                                        className="w-full py-7 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 h-14"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" /> : "Salvar e Criar Acesso"}
                                    </Button>
                                </DialogFooter>
                            </>
                        ) : (
                            <div className="p-12 text-center animate-in zoom-in duration-500">
                                <div className="bg-success/10 w-20 h-20 rounded-[30px] flex items-center justify-center text-success mx-auto mb-8">
                                </div>
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-success mb-2 text-center">Conexão Criada!</h3>
                                <p className="text-muted-foreground text-sm italic mb-10 text-center">O Hermes gerou uma <span className="text-foreground font-bold">API Key exclusiva</span> para este remetente.</p>
                                
                                <div className="bg-background border-2 border-dashed border-success/30 rounded-3xl p-8 mb-8 relative group">
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
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center bg-surface border border-border-subtle rounded-3xl">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            ) : (
                <Card className="bg-surface border-border-subtle rounded-3xl overflow-hidden shadow-sm border">
                    <Table>
                        <TableHeader className="bg-background/50">
                            <TableRow className="border-b border-border-subtle/30">
                                <TableHead className="px-8 py-5 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Identificação</TableHead>
                                <TableHead className="px-8 py-5 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">E-mail</TableHead>
                                <TableHead className="px-8 py-5 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Tipo</TableHead>
                                <TableHead className="px-8 py-5 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Status</TableHead>
                                <TableHead className="px-8 py-5 text-[11px] uppercase tracking-wider text-muted-foreground font-bold text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-border-subtle/30">
                            {credentials.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="px-8 py-20 text-center text-muted-foreground italic border-none">
                                        Nenhuma conexão configurada.
                                    </TableCell>
                                </TableRow>
                            ) : credentials.map((cred) => (
                                <TableRow key={cred.id} className="hover:bg-white/5 transition-colors group border-b border-border-subtle/30">
                                    <TableCell className="px-8 py-6">
                                        <div className="flex flex-col text-left">
                                            <span className="font-bold text-foreground">{cred.name}</span>
                                            <span className="text-[9px] text-muted-foreground font-mono opacity-50 uppercase mt-1 italic">Service ID: {cred.service_id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 font-medium text-foreground/80 text-left">{cred.login}</TableCell>
                                    <TableCell className="px-8 py-6 text-left">
                                        {cred.auth_type === 'oauth2' ? (
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold text-[10px] uppercase gap-2 px-3 py-1">
                                                <FaGoogle size={12} /> Google
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-white/5 text-muted-foreground border-border-subtle font-bold text-[10px] uppercase gap-2 px-3 py-1">
                                                <Settings2 size={12} /> SMTP
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-8 py-6 text-left">
                                        {cred.auth_type === 'oauth2' && !cred.refresh_token ? (
                                            <button 
                                                onClick={() => handleAuthorizeGoogle(cred.service_id, cred.id)}
                                                className="flex items-center gap-2 text-danger hover:underline font-bold text-[10px] uppercase"
                                            >
                                                <AlertCircle size={14} /> Pendente
                                            </button>
                                        ) : (
                                            <Badge className="bg-success/10 text-success border-none font-bold text-[10px] uppercase gap-2 px-3 py-1">
                                                <CheckCircle2 size={14} /> Ativa
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={"/system/credentials/" + cred.id}>
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                                    <Eye size={18} />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-danger">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    );
}
