"use client";

import { 
    Plus, 
    ArrowUpRight, 
    Shield, 
    Activity, 
    Clock, 
    Settings,
    MoreHorizontal,
    Search,
    Loader2,
    AlertCircle
} from "lucide-react";
import Button from "@/src/components/button";
import { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/api";

interface Service {
    id: string;
    name: string;
    createdAt: string;
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newServiceName, setNewServiceName] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await apiFetch("/api/services");
            if (response.ok) {
                const result = await response.json();
                // O backend retorna os serviços no campo 'data' (padrão CommonResponse)
                setServices(result.data || []);
            }
        } catch (err) {
            console.error("Erro ao buscar serviços:", err);
            setError("Não foi possível carregar os serviços.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateService = async () => {
        if (!newServiceName) return;
        setCreating(true);
        setError("");
        try {
            const response = await apiFetch("/api/services", {
                method: 'POST',
                body: JSON.stringify({ name: newServiceName })
            });

            if (response.ok) {
                setNewServiceName("");
                setShowModal(false);
                fetchServices(); // Recarrega a lista
            } else {
                const data = await response.json();
                setError(data.message || "Erro ao criar serviço.");
            }
        } catch (err) {
            setError("Erro de conexão com o servidor.");
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    return (
        <div className="space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase">Meus Serviços</h2>
                    <p className="text-text-secondary text-sm font-medium italic">Gerencie as instâncias isoladas de e-mail para suas aplicações.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        label="Novo Serviço" 
                        variant="primary" 
                        labelIcon={<Plus size={18} />} 
                        onClick={() => setShowModal(true)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="h-96 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-text-secondary">
                        <Loader2 className="animate-spin text-primary" size={40} />
                        <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Sincronizando com a nuvem...</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <div key={service.id} className="group relative bg-surface border border-border-subtle rounded-3xl p-8 hover:border-primary/40 transition-all duration-500 shadow-sm overflow-hidden">
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                    <Shield size={24} />
                                </div>
                                <button className="p-2 hover:bg-white/5 rounded-lg text-text-secondary transition-colors">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>

                            <div className="space-y-1 mb-8 relative z-10 text-left">
                                <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">{service.name}</h3>
                                <p className="text-text-secondary text-[10px] font-mono tracking-wider opacity-60 uppercase">ID: {service.id}</p>
                            </div>

                            <div className="mt-auto flex gap-3 relative z-10">
                                <button className="flex-1 py-2.5 rounded-xl bg-background border border-border-subtle text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                                    Configurações <Settings size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <div 
                        onClick={() => setShowModal(true)}
                        className="group border-2 border-dashed border-border-subtle rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all duration-300 min-h-[260px]"
                    >
                        <div className="p-4 bg-white/5 rounded-full text-text-secondary group-hover:bg-primary group-hover:text-white transition-all duration-500 scale-110">
                            <Plus size={32} />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-text-primary uppercase tracking-tight">Novo Projeto</h4>
                            <p className="text-text-secondary text-xs mt-1 italic">Configure uma nova aplicação</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Criação Real */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => !creating && setShowModal(false)}></div>
                    <div className="bg-surface border border-border-subtle w-full max-w-lg rounded-[40px] shadow-2xl relative z-10">
                        <div className="p-10 border-b border-border-subtle bg-background/30 text-center">
                            <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                                <Plus size={32} />
                            </div>
                            <h3 className="text-2xl font-bold italic uppercase tracking-tighter text-text-primary">Novo Serviço</h3>
                            <p className="text-text-secondary text-sm mt-2 italic">Dê um nome único para o seu projeto.</p>
                        </div>
                        
                        <div className="p-10 space-y-6">
                            {error && (
                                <div className="bg-danger/10 border border-danger/20 p-4 rounded-2xl flex gap-3 items-center text-danger text-xs font-bold uppercase">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] px-1">Nome do Serviço</label>
                                <input 
                                    autoFocus
                                    value={newServiceName}
                                    onChange={(e) => setNewServiceName(e.target.value)}
                                    className="w-full bg-background border border-border-subtle rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-primary transition-all font-medium italic" 
                                    placeholder="Ex: API de Pagamentos" 
                                />
                            </div>
                        </div>

                        <div className="p-10 bg-background/30 border-t border-border-subtle flex flex-col gap-4">
                            <button 
                                onClick={handleCreateService}
                                disabled={creating || !newServiceName}
                                className="w-full py-5 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {creating ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Finalizar Cadastro"}
                            </button>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
                            >
                                Voltar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}