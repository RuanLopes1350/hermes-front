"use client";

import { 
    Plus, 
    Shield, 
    Settings,
    MoreHorizontal,
    Loader2,
    AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/api";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Card } from "@/src/components/ui/card";

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
                fetchServices(); 
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
        <div className="space-y-12 text-left">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase">Meus Serviços</h2>
                    <p className="text-muted-foreground text-sm font-medium italic">Gerencie as instâncias isoladas de e-mail para suas aplicações.</p>
                </div>
                
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 uppercase font-black tracking-widest text-[10px]">
                            <Plus size={18} /> Novo Serviço
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-surface border-border-subtle rounded-[40px] max-w-lg p-0 overflow-hidden shadow-2xl">
                        <DialogHeader className="p-10 bg-background/30 text-center border-b border-border-subtle">
                            <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                                <Plus size={32} />
                            </div>
                            <DialogTitle className="text-2xl font-bold italic uppercase tracking-tighter text-foreground">Novo Serviço</DialogTitle>
                            <DialogDescription className="text-muted-foreground text-sm mt-2 italic">Dê um nome único para o seu projeto.</DialogDescription>
                        </DialogHeader>
                        
                        <div className="p-10 space-y-6">
                            {error && (
                                <div className="bg-danger/10 border border-danger/20 p-4 rounded-2xl flex gap-3 items-center text-danger text-xs font-bold uppercase">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Nome do Serviço</label>
                                <Input 
                                    autoFocus
                                    value={newServiceName}
                                    onChange={(e) => setNewServiceName(e.target.value)}
                                    className="bg-background border-border-subtle rounded-2xl px-6 py-7 text-base focus:border-primary transition-all font-medium italic h-14" 
                                    placeholder="Ex: API de Pagamentos" 
                                />
                            </div>
                        </div>

                        <DialogFooter className="p-10 bg-background/30 border-t border-border-subtle flex flex-col gap-4 sm:flex-col">
                            <Button 
                                onClick={handleCreateService}
                                disabled={creating || !newServiceName}
                                className="w-full py-7 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-hover disabled:opacity-50"
                            >
                                {creating ? <Loader2 className="animate-spin" size={20} /> : "Finalizar Cadastro"}
                            </Button>
                            <Button 
                                variant="ghost"
                                onClick={() => setShowModal(false)}
                                className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
                            >
                                Voltar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="h-96 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <Loader2 className="animate-spin text-primary" size={40} />
                        <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Sincronizando com a nuvem...</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <Card key={service.id} className="group relative bg-surface border-border-subtle rounded-3xl p-8 hover:border-primary/40 transition-all duration-500 shadow-sm overflow-hidden text-left border">
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                    <Shield size={24} />
                                </div>
                                <Button variant="ghost" size="icon" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <MoreHorizontal size={18} />
                                </Button>
                            </div>

                            <div className="space-y-1 mb-8 relative z-10">
                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{service.name}</h3>
                                <p className="text-muted-foreground text-[10px] font-mono tracking-wider opacity-60 uppercase">ID: {service.id}</p>
                            </div>

                            <div className="mt-auto flex gap-3 relative z-10">
                                <Link 
                                    href={`/system/services/${service.id}`}
                                    className="flex-1"
                                >
                                    <Button variant="outline" className="w-full py-2.5 rounded-xl bg-background border-border-subtle text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all gap-2 text-foreground">
                                        Configurações <Settings size={14} />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}

                    <div 
                        onClick={() => setShowModal(true)}
                        className="group border-2 border-dashed border-border-subtle rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all duration-300 min-h-[260px]"
                    >
                        <div className="p-4 bg-white/5 rounded-full text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-500 scale-110">
                            <Plus size={32} />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-foreground uppercase tracking-tight text-center">Novo Projeto</h4>
                            <p className="text-muted-foreground text-xs mt-1 italic">Configure uma nova aplicação</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
