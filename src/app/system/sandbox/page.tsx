"use client";

import { 
    Send, 
    Shield, 
    Mail, 
    User, 
    Type, 
    Code, 
    FileText, 
    Key, 
    CheckCircle2, 
    AlertCircle, 
    Loader2,
    ArrowRight,
    Terminal
} from "lucide-react";
import Button from "@/src/components/button";
import { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/api";

interface Service {
    id: string;
    name: string;
}

interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    // O token real não vem no list, mas para o sandbox 
    // assumimos que o usuário colará a chave que copiou ou buscaremos uma forma de testar.
}

interface Template {
    id: string;
    name: string;
}

export default function SandboxPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados do Formulário de Teste
    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [providedApiKey, setProvidedApiKey] = useState("");
    const [recipient, setRecipient] = useState("");
    const [subject, setSubject] = useState("");
    const [contentType, setContentType] = useState<'body' | 'template'>('body');
    const [body, setBody] = useState("<h1>Olá do Hermes Sandbox!</h1><p>Este é um e-mail de teste disparado via dashboard.</p>");
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [variables, setVariables] = useState('{\n  "nome": "Usuário Teste"\n}');

    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ success: boolean, message: string, data?: any } | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const res = await apiFetch("/api/services");
            if (res.ok) {
                const data = await res.json();
                setServices(data.data || []);
            }
        } catch (err) {
            console.error("Erro ao carregar serviços:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleServiceChange = async (serviceId: string) => {
        setSelectedServiceId(serviceId);
        if (!serviceId) {
            setApiKeys([]);
            setTemplates([]);
            return;
        }

        try {
            // Busca keys e templates do serviço selecionado
            const [keysRes, tmplRes] = await Promise.all([
                apiFetch(`/api/services/${serviceId}/api-keys`),
                apiFetch(`/api/services/${serviceId}/templates`)
            ]);

            if (keysRes.ok) {
                const data = await keysRes.json();
                setApiKeys(data.data || []);
            }
            if (tmplRes.ok) {
                const data = await tmplRes.json();
                setTemplates(data.data || []);
            }
        } catch (err) {
            console.error("Erro ao carregar dados do serviço:", err);
        }
    };

    const handleSendTest = async () => {
        if (!selectedServiceId || !providedApiKey || !recipient || !subject) {
            setResult({ success: false, message: "Preencha todos os campos obrigatórios e forneça sua API Key." });
            return;
        }

        setSending(true);
        setResult(null);

        try {
            const payload: any = {
                recipient_to: recipient,
                subject: subject,
            };

            if (contentType === 'body') {
                payload.body = body;
            } else {
                payload.template_id = selectedTemplateId;
                payload.variables = JSON.parse(variables);
            }

            // SIMULAÇÃO DE CHAMADA EXTERNA: Usa a API Key no Header
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${selectedServiceId}/emails`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': providedApiKey
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setResult({ success: true, message: "E-mail enfileirado com sucesso!", data: data.data });
            } else {
                setResult({ success: false, message: data.message || "Erro ao processar envio." });
            }
        } catch (err) {
            setResult({ success: false, message: "Falha de conexão com a API." });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-10 text-left pb-20">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase">Sandbox de Envio</h2>
                <p className="text-text-secondary text-sm font-medium italic">Teste sua integração simulando uma chamada externa à API do Hermes.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Form */}
                <div className="lg:col-span-7 space-y-8">
                    
                    {/* AUTH SECTION */}
                    <div className="bg-surface border border-border-subtle rounded-[32px] p-8 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-primary/10 p-2 rounded-xl text-primary"><Shield size={18} /></div>
                            <h3 className="font-bold uppercase text-[11px] tracking-[0.2em]">Autenticação do Teste</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Projeto (Serviço)</label>
                                <select 
                                    value={selectedServiceId}
                                    onChange={(e) => handleServiceChange(e.target.value)}
                                    className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-xs focus:border-primary outline-none italic font-medium"
                                >
                                    <option value="">Selecione...</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Sua API Key (hm_...)</label>
                                <input 
                                    type="password"
                                    value={providedApiKey}
                                    onChange={(e) => setProvidedApiKey(e.target.value)}
                                    placeholder="hm_v1.xxxxxxxx.xxxx"
                                    className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-xs focus:border-primary outline-none font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* CONTENT SECTION */}
                    <div className="bg-surface border border-border-subtle rounded-[32px] p-8 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-primary/10 p-2 rounded-xl text-primary"><Mail size={18} /></div>
                            <h3 className="font-bold uppercase text-[11px] tracking-[0.2em]">Composição do E-mail</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Destinatário (Para)</label>
                                    <input 
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        placeholder="exemplo@gmail.com"
                                        className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-xs focus:border-primary outline-none font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Assunto</label>
                                    <input 
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Assunto do e-mail"
                                        className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-xs focus:border-primary outline-none font-medium"
                                    />
                                </div>
                            </div>

                            {/* Content Type Tabs */}
                            <div className="flex gap-2 p-1 bg-background rounded-xl border border-border-subtle w-fit">
                                <button 
                                    onClick={() => setContentType('body')}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${contentType === 'body' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                                >
                                    Corpo Direto (HTML)
                                </button>
                                <button 
                                    onClick={() => setContentType('template')}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${contentType === 'template' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                                >
                                    Usar Template MJML
                                </button>
                            </div>

                            {contentType === 'body' ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Código HTML</label>
                                    <textarea 
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        className="w-full h-48 bg-background border border-border-subtle rounded-2xl p-6 text-xs font-mono focus:border-primary outline-none resize-none"
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Selecione o Template</label>
                                        <select 
                                            value={selectedTemplateId}
                                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                                            className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-xs focus:border-primary outline-none italic"
                                        >
                                            <option value="">Escolha...</option>
                                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Variáveis (JSON)</label>
                                        <textarea 
                                            value={variables}
                                            onChange={(e) => setVariables(e.target.value)}
                                            className="w-full h-32 bg-background border border-border-subtle rounded-xl p-4 text-[10px] font-mono focus:border-primary outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={handleSendTest}
                        disabled={sending}
                        className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                    >
                        {sending ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Disparar Agora</>}
                    </button>
                </div>

                {/* Right Column: Console/Result */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
                    <div className="bg-[#0F172A] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-[600px]">
                        <div className="bg-white/5 p-4 px-6 flex items-center justify-between border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <Terminal size={14} className="text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Hermes API Console</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-danger/50"></div>
                                <div className="w-2 h-2 rounded-full bg-warning/50"></div>
                                <div className="w-2 h-2 rounded-full bg-success/50"></div>
                            </div>
                        </div>

                        <div className="flex-1 p-8 font-mono text-[11px] space-y-4 overflow-y-auto scrollbar-hide text-left">
                            <p className="text-text-secondary opacity-40 italic"># Aguardando requisição...</p>
                            
                            {result && (
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-500">
                                    <div className="flex items-start gap-3">
                                        <span className="text-primary font-bold">{">"}</span>
                                        <p className="text-white">POST /api/services/{selectedServiceId || ":id"}/emails</p>
                                    </div>
                                    <div className={`p-4 rounded-xl border ${result.success ? 'bg-success/5 border-success/20 text-success' : 'bg-danger/5 border-danger/20 text-danger'}`}>
                                        <div className="flex items-center gap-2 mb-2 font-black uppercase text-[9px] tracking-widest">
                                            {result.success ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                            Response: {result.success ? "201 Created" : "Error"}
                                        </div>
                                        <p className="font-bold">{result.message}</p>
                                    </div>
                                    {result.data && (
                                        <pre className="p-4 bg-black/40 rounded-xl text-primary/70 border border-white/5 overflow-x-auto">
                                            {JSON.stringify(result.data, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                        <p className="text-[10px] font-bold text-text-secondary leading-relaxed uppercase tracking-wider">
                            Nota: O Sandbox envia e-mails reais. Certifique-se de que a API Key fornecida tenha saldo ou permissão no provedor configurado.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}