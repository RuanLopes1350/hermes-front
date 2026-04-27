"use client";

import { 
    Plus, 
    FileText, 
    Search, 
    MoreHorizontal, 
    Trash2, 
    Edit3, 
    Eye,
    Code,
    Loader2,
    Calendar
} from "lucide-react";
import Button from "@/src/components/button";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Template {
    id: string;
    name: string;
    createdAt: string;
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulando integração com API
        setTimeout(() => {
            setTemplates([
                { id: "tmpl_001", name: "Bem-vindo - Boas-vindas ao App", createdAt: "2026-04-10" },
                { id: "tmpl_002", name: "Recuperação de Senha", createdAt: "2026-04-12" },
                { id: "tmpl_003", name: "Newsletter Semanal", createdAt: "2026-04-15" },
                { id: "tmpl_004", name: "Confirmação de Pedido", createdAt: "2026-04-20" },
            ]);
            setLoading(false);
        }, 800);
    }, []);

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase">Templates</h2>
                    <p className="text-text-secondary text-sm font-medium">Crie e gerencie seus templates MJML e Handlebars.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Buscar template..." 
                            className="bg-surface border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary w-64 transition-all"
                        />
                    </div>
                    <Link href="/system/templates/new">
                        <Button 
                            label="Novo Template" 
                            variant="primary" 
                            labelIcon={<Plus size={18} />} 
                        />
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center bg-surface border border-border-subtle rounded-3xl">
                    <div className="flex flex-col items-center gap-4 text-text-secondary">
                        <Loader2 className="animate-spin text-primary" size={32} />
                        <p className="text-xs font-bold uppercase tracking-widest">Sincronizando templates...</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {templates.map((tmpl) => (
                        <div key={tmpl.id} className="group bg-surface border border-border-subtle rounded-2xl p-6 hover:border-primary/40 transition-all duration-300 flex flex-col shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 hover:bg-danger/10 text-text-secondary hover:text-danger rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="bg-background w-12 h-12 rounded-xl flex items-center justify-center text-text-secondary group-hover:text-primary group-hover:bg-primary/5 transition-all mb-6 border border-border-subtle group-hover:border-primary/20">
                                <FileText size={24} />
                            </div>

                            <div className="flex-1 space-y-1 mb-8">
                                <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">{tmpl.name}</h3>
                                <p className="text-[10px] font-mono text-text-secondary uppercase opacity-60">{tmpl.id}</p>
                            </div>

                            <div className="flex items-center justify-between border-t border-border-subtle/30 pt-6">
                                <div className="flex items-center gap-1.5 text-text-secondary">
                                    <Calendar size={12} />
                                    <span className="text-[10px] font-medium uppercase tracking-tight">{tmpl.createdAt}</span>
                                </div>
                                
                                <div className="flex gap-1">
                                    <Link href={`/system/templates/${tmpl.id}`}>
                                        <button className="p-2 hover:bg-primary/10 rounded-lg text-text-secondary hover:text-primary transition-all" title="Editar MJML">
                                            <Code size={16} />
                                        </button>
                                    </Link>
                                    <button className="p-2 hover:bg-white/5 rounded-lg text-text-secondary transition-all" title="Visualizar">
                                        <Eye size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* New Template Card Placeholder */}
                    <Link href="/system/templates/new" className="group border-2 border-dashed border-border-subtle rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white transition-all">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-text-primary">Criar MJML</h4>
                            <p className="text-[10px] text-text-secondary mt-1 uppercase tracking-widest font-bold">Novo Design</p>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
}