"use client";

import { 
    Key, 
    Plus, 
    Copy, 
    Check, 
    Trash2, 
    AlertCircle, 
    Clock, 
    Activity, 
    ShieldCheck, 
    ShieldAlert,
    Loader2,
    Calendar,
    ArrowRight,
    Shield
} from "lucide-react";
import Button from "@/src/components/button";
import { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/api";

interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    is_active: boolean;
    credential_id: string;
    service_id: string;
    last_used_at: string | null;
    expiresAt: string | null;
    createdAt: string;
}

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fetchApiKeys = async () => {
        setLoading(true);
        try {
            const response = await apiFetch("/api/api-keys");
            if (response.ok) {
                const data = await response.json();
                setKeys(data.data || []);
            }
        } catch (err) {
            console.error("Erro ao buscar API Keys:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleRevoke = async (id: string, serviceId: string) => {
        if (!confirm("Tem certeza que deseja revogar esta chave? Esta ação é irreversível.")) return;
        
        try {
            const response = await apiFetch(`/api/services/${serviceId}/api-keys/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchApiKeys();
            }
        } catch (err) {
            console.error("Erro ao revogar chave:", err);
        }
    };

    return (
        <div className="space-y-10 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase text-text-primary">Chaves de API</h2>
                    <p className="text-text-secondary text-sm font-medium italic">Gerencie os tokens de acesso vinculados às suas conexões.</p>
                </div>
                {/* 
                  Nesta nova lógica, não criamos chave solta. 
                  O usuário é orientado a criar uma "Conexão" para obter uma chave.
                */}
                <div className="bg-primary/5 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-3">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">As chaves são geradas ao criar novas conexões</p>
                    <ArrowRight size={14} className="text-primary" />
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center bg-surface border border-border-subtle rounded-3xl">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {keys.length === 0 ? (
                        <div className="bg-surface border border-border-subtle rounded-3xl p-20 text-center text-text-secondary italic">
                            Nenhuma chave de API encontrada.
                        </div>
                    ) : keys.map((key) => (
                        <div key={key.id} className="group bg-surface border border-border-subtle rounded-3xl p-8 hover:border-primary/30 transition-all shadow-sm relative overflow-hidden">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                
                                {/* Info Principal */}
                                <div className="flex items-start gap-6">
                                    <div className={`p-4 rounded-2xl ${key.is_active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                        <Key size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-text-primary uppercase tracking-tight">{key.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                                key.is_active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                                            }`}>
                                                {key.is_active ? 'Ativa' : 'Revogada'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] text-text-secondary font-medium uppercase tracking-wider italic">
                                            <span className="flex items-center gap-1.5"><Shield size={12} className="opacity-50" /> Service: {key.service_id}</span>
                                            <span className="flex items-center gap-1.5"><Calendar size={12} className="opacity-50" /> Criada em {new Date(key.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status de Uso */}
                                <div className="flex gap-12 lg:px-12 border-l border-border-subtle/50">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em]">Último Uso</p>
                                        <p className="text-xs font-mono text-text-primary">
                                            {key.last_used_at ? new Date(key.last_used_at).toLocaleString() : 'Nunca utilizada'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em]">Expiração</p>
                                        <p className="text-xs font-mono text-text-primary">
                                            {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'Sem expiração'}
                                        </p>
                                    </div>
                                </div>

                                {/* Token Mascarado e Ações */}
                                <div className="flex items-center gap-4 bg-background/50 p-2 pl-6 rounded-2xl border border-border-subtle group-hover:border-primary/20 transition-all">
                                    <code className="text-xs font-mono text-text-secondary opacity-60 tracking-widest uppercase">
                                        {key.prefix}••••••••••••
                                    </code>
                                    <div className="flex gap-2 border-l border-border-subtle/50 pl-4 py-2 pr-2">
                                        <button 
                                            onClick={() => handleRevoke(key.id, key.service_id)}
                                            className="p-2 hover:bg-danger/10 text-text-secondary hover:text-danger rounded-lg transition-all" 
                                            title="Revogar Chave"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Dica de Segurança */}
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl flex items-start gap-4">
                <ShieldCheck className="text-primary mt-1" size={20} />
                <div className="space-y-1">
                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest">Protocolo de Segurança</h4>
                    <p className="text-xs text-text-secondary italic leading-relaxed">
                        O Hermes nunca armazena o token original da sua API Key. Apenas um hash criptográfico irreversível é salvo no banco de dados. 
                        Se você perder sua chave, precisará gerar uma nova conexão.
                    </p>
                </div>
            </div>
        </div>
    );
}