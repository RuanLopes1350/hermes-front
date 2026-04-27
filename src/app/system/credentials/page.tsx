"use client";

import { 
    Plus, 
    Mail, 
    ShieldCheck, 
    Trash2, 
    RefreshCcw,
    AlertCircle,
    CheckCircle2,
    Settings2,
    Loader2,
    Copy,
    Check,
    Key,
    Shield
} from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import Button from "@/src/components/button";
import { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/api";

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
                apiFetch("/api/credentials") // ROTA GLOBAL AGORA REAL
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
                    <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase text-text-primary">Conexões de E-mail</h2>
                    <p className="text-text-secondary text-sm font-medium italic">Configure seus remetentes e obtenha chaves de acesso instantaneamente.</p>
                </div>
                <Button 
                    label="Nova Conexão" 
                    variant="primary" 
                    labelIcon={<Plus size={18} />} 
                    onClick={() => setShowModal(true)}
                />
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center bg-surface border border-border-subtle rounded-3xl">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            ) : (
                <div className="bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-[11px] uppercase tracking-wider text-text-secondary bg-background/50">
                            <tr>
                                <th className="px-8 py-5 font-bold">Identificação</th>
                                <th className="px-8 py-5 font-bold">E-mail</th>
                                <th className="px-8 py-5 font-bold">Tipo</th>
                                <th className="px-8 py-5 font-bold">Status</th>
                                <th className="px-8 py-5 font-bold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle/30">
                            {credentials.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-text-secondary italic">
                                        Nenhuma conexão configurada.
                                    </td>
                                </tr>
                            ) : credentials.map((cred) => (
                                <tr key={cred.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-text-primary">{cred.name}</span>
                                            <span className="text-[9px] text-text-secondary font-mono opacity-50 uppercase mt-1 italic">Service ID: {cred.service_id}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 font-medium text-text-primary/80">{cred.login}</td>
                                    <td className="px-8 py-6">
                                        {cred.auth_type === 'oauth2' ? (
                                            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase">
                                                <FaGoogle size={12} /> Google OAuth2
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-text-secondary font-bold text-[10px] uppercase">
                                                <Settings2 size={12} /> SMTP
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        {cred.auth_type === 'oauth2' && !cred.refresh_token ? (
                                            <button 
                                                onClick={() => handleAuthorizeGoogle(cred.service_id, cred.id)}
                                                className="flex items-center gap-2 text-danger hover:underline font-bold text-[10px] uppercase"
                                            >
                                                <AlertCircle size={14} /> Pendente Autenticação
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2 text-success font-bold text-[10px] uppercase">
                                                <CheckCircle2 size={14} /> Ativa
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 hover:bg-danger/10 text-text-secondary hover:text-danger rounded-lg transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Conexão */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={() => !submitting && closeModal()}></div>
                    <div className="bg-surface border border-border-subtle w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden">
                        
                        {!generatedKey ? (
                            <>
                                <div className="p-10 border-b border-border-subtle bg-background/30 text-center">
                                    <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                                        <Shield size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold italic uppercase tracking-tighter text-text-primary">Nova Conexão</h3>
                                    <p className="text-text-secondary text-sm mt-2 italic">Vincule um provedor de e-mail ao seu projeto.</p>
                                </div>
                                
                                <div className="p-10 space-y-6 max-h-[500px] overflow-y-auto scrollbar-hide">
                                    {error && <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl text-danger text-[10px] font-bold uppercase">{error}</div>}
                                    
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest px-1">1. Selecione o Projeto (Serviço)</label>
                                        <select 
                                            value={selectedServiceId}
                                            onChange={(e) => setSelectedServiceId(e.target.value)}
                                            className="w-full bg-background border border-border-subtle rounded-2xl px-6 py-4 text-sm focus:border-primary outline-none italic font-medium appearance-none cursor-pointer"
                                        >
                                            <option value="">Escolha um serviço...</option>
                                            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>

                                    {!selectedType ? (
                                        <div className="grid grid-cols-2 gap-4 pt-4 text-left">
                                            <div onClick={() => setSelectedType('plain')} className="p-6 border-2 border-border-subtle rounded-3xl hover:border-primary/50 cursor-pointer transition-all">
                                                <Settings2 className="text-text-secondary mb-3" />
                                                <h4 className="font-bold text-sm text-text-primary">SMTP Padrão</h4>
                                                <p className="text-[10px] text-text-secondary mt-1 italic">Outlook, SendGrid, SES...</p>
                                            </div>
                                            <div onClick={() => setSelectedType('oauth2')} className="p-6 border-2 border-border-subtle rounded-3xl hover:border-primary/50 cursor-pointer transition-all">
                                                <FaGoogle className="text-primary mb-3" />
                                                <h4 className="font-bold text-sm text-text-primary">Google OAuth2</h4>
                                                <p className="text-[10px] text-text-secondary mt-1 italic">Workspace, Gmail seguro...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <button onClick={() => setSelectedType(null)} className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">← Mudar Provedor</button>
                                            
                                            <div className="grid grid-cols-1 gap-6 text-left">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Nome da Conexão</label>
                                                    <input 
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                        className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm focus:border-primary outline-none font-medium" 
                                                        placeholder="Ex: Suporte Global" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-text-secondary uppercase px-1">E-mail do Remetente</label>
                                                    <input 
                                                        value={formData.login}
                                                        onChange={(e) => setFormData({...formData, login: e.target.value})}
                                                        className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm focus:border-primary outline-none font-medium" 
                                                        placeholder="contato@empresa.com" 
                                                    />
                                                </div>

                                                {selectedType === 'plain' ? (
                                                    <div className="space-y-6">
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div className="col-span-2 space-y-2">
                                                                <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Host SMTP</label>
                                                                <input 
                                                                    value={formData.smtpHost}
                                                                    onChange={(e) => setFormData({...formData, smtpHost: e.target.value})}
                                                                    className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm focus:border-primary outline-none font-medium" 
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Porta</label>
                                                                <input 
                                                                    value={formData.smtpPort}
                                                                    onChange={(e) => setFormData({...formData, smtpPort: e.target.value})}
                                                                    className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm focus:border-primary outline-none font-medium" 
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Senha/App Password</label>
                                                            <input 
                                                                type="password"
                                                                value={formData.passkey}
                                                                onChange={(e) => setFormData({...formData, passkey: e.target.value})}
                                                                className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm focus:border-primary outline-none font-medium" 
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-text-secondary uppercase px-1 font-mono tracking-tighter">Google Client ID</label>
                                                            <input 
                                                                value={formData.clientId}
                                                                onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                                                                className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm font-mono focus:border-primary outline-none" 
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-text-secondary uppercase px-1 font-mono tracking-tighter">Google Client Secret</label>
                                                            <input 
                                                                type="password"
                                                                value={formData.clientSecret}
                                                                onChange={(e) => setFormData({...formData, clientSecret: e.target.value})}
                                                                className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm font-mono focus:border-primary outline-none" 
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-10 bg-background/30 border-t border-border-subtle">
                                    <button 
                                        onClick={handleCreateConnection}
                                        disabled={submitting || !selectedServiceId || !selectedType}
                                        className="w-full py-5 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" /> : "Salvar e Criar Acesso"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="p-12 text-center animate-in zoom-in duration-500">
                                <div className="bg-success/10 w-20 h-20 rounded-[30px] flex items-center justify-center text-success mx-auto mb-8">
                                    <ShieldCheck size={40} />
                                </div>
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-success mb-2 text-center">Conexão Criada!</h3>
                                <p className="text-text-secondary text-sm italic mb-10 text-center">O Hermes gerou uma <span className="text-text-primary font-bold">API Key exclusiva</span> para este remetente.</p>
                                
                                <div className="bg-background border-2 border-dashed border-success/30 rounded-3xl p-8 mb-8 relative group">
                                    <div className="flex items-center gap-2 mb-4 text-success font-bold text-[9px] uppercase tracking-widest">
                                        <Key size={12} /> Seu Token de Acesso
                                    </div>
                                    <p className="text-xs font-mono text-text-primary break-all leading-relaxed select-all text-left">
                                        {generatedKey.token}
                                    </p>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedKey.token);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className={`absolute -top-4 right-6 px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                            copied ? 'bg-success text-white' : 'bg-primary text-white shadow-lg'
                                        }`}
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                        {copied ? 'Copiado!' : 'Copiar'}
                                    </button>
                                </div>

                                <button 
                                    onClick={closeModal}
                                    className="w-full py-5 rounded-2xl bg-surface border-2 border-border-subtle text-text-primary text-xs font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
                                >
                                    Concluído
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}