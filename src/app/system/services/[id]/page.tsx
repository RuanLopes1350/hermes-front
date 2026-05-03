"use client";

import { 
    ArrowLeft, 
    Activity, 
    Code, 
    Settings, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    Copy,
    Save,
    Trash2,
    RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

export default function ServiceDetailsPage() {
    const [name, setName] = useState("Plataforma Principal");

    return (
        <div className="space-y-12 text-left">
            <div className="flex items-center gap-4">
                <Link href="/system/services">
                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-surface border-border-subtle text-muted-foreground hover:text-primary group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-3xl font-bold tracking-tight uppercase text-foreground">{name}</h2>
                        <span className="px-3 py-1 bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest rounded-full">Ativo</span>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium italic">Configurações e métricas isoladas deste serviço.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Estatísticas Rápidas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-surface border-border-subtle rounded-3xl p-6 flex flex-col gap-4 border">
                            <div className="p-3 bg-primary/10 text-primary w-fit rounded-2xl">
                                <Activity size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Envios Totais</p>
                                <p className="text-3xl font-bold text-foreground italic tracking-tighter">45,280</p>
                            </div>
                        </Card>
                        <Card className="bg-surface border-border-subtle rounded-3xl p-6 flex flex-col gap-4 border">
                            <div className="p-3 bg-success/10 text-success w-fit rounded-2xl">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Taxa de Entrega</p>
                                <p className="text-3xl font-bold text-foreground italic tracking-tighter">99.2%</p>
                            </div>
                        </Card>
                        <Card className="bg-surface border-border-subtle rounded-3xl p-6 flex flex-col gap-4 border">
                            <div className="p-3 bg-danger/10 text-danger w-fit rounded-2xl">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Falhas (24h)</p>
                                <p className="text-3xl font-bold text-foreground italic tracking-tighter">12</p>
                            </div>
                        </Card>
                    </div>

                    {/* Configurações Gerais */}
                    <Card className="bg-surface border-border-subtle rounded-[40px] p-10 border">
                        <CardHeader className="p-0 mb-8 flex flex-row items-center gap-3">
                            <Settings size={24} className="text-primary" />
                            <CardTitle className="text-xl font-bold italic uppercase tracking-tighter text-foreground">Configurações Gerais</CardTitle>
                        </CardHeader>
                        
                        <CardContent className="p-0 space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Nome do Serviço</label>
                                <Input 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-background border-border-subtle rounded-2xl px-6 py-7 text-base focus:border-primary transition-all font-medium italic h-14" 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Limite Global (Mês)</label>
                                    <Input 
                                        type="number"
                                        placeholder="Ilimitado"
                                        className="bg-background border-border-subtle rounded-2xl px-6 py-7 text-base focus:border-primary transition-all font-medium italic h-14" 
                                    />
                                </div>
                                <div className="space-y-3 text-left">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Timezone do Serviço</label>
                                    <Select defaultValue="America/Sao_Paulo">
                                        <SelectTrigger className="bg-background border-border-subtle rounded-2xl px-6 py-7 text-base focus:border-primary font-medium italic h-14">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-surface border-border-subtle">
                                            <SelectItem value="America/Sao_Paulo">America/Sao_Paulo</SelectItem>
                                            <SelectItem value="UTC">UTC</SelectItem>
                                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border-subtle/50 flex flex-col md:flex-row gap-4">
                                <Button className="flex-1 py-7 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-hover h-14 gap-2">
                                    Salvar Alterações <Save size={18} />
                                </Button>
                                <Button variant="outline" className="px-8 py-7 rounded-2xl bg-danger/10 text-danger border-none text-xs font-black uppercase tracking-[0.2em] hover:bg-danger/20 h-14 gap-2">
                                    Excluir Serviço <Trash2 size={18} />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Identificadores */}
                    <Card className="bg-surface border-border-subtle rounded-3xl p-8 space-y-6 border text-left">
                        <CardHeader className="p-0">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Code size={14} className="text-primary" /> Identificadores
                            </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="p-0 space-y-4">
                            <div className="space-y-2 text-left">
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em]">Service ID</p>
                                <div className="flex items-center gap-2 p-3 bg-background rounded-xl border border-border-subtle">
                                    <code className="text-xs font-mono text-primary flex-1 truncate">srv_987654321</code>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 text-muted-foreground">
                                        <Copy size={14} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status da Fila */}
                    <Card className="bg-surface border-border-subtle rounded-3xl p-8 space-y-6 border text-left">
                        <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <RefreshCw size={14} className="text-primary" /> Status da Fila
                            </CardTitle>
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                        </CardHeader>
                        
                        <CardContent className="p-0 space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-muted-foreground italic font-medium">Processando</p>
                                <p className="text-sm font-bold text-foreground">0</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-muted-foreground italic font-medium">Aguardando</p>
                                <p className="text-sm font-bold text-foreground">0</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-muted-foreground italic font-medium">Falhas (Fila)</p>
                                <p className="text-sm font-bold text-danger">0</p>
                            </div>
                            <Button variant="outline" className="w-full py-2.5 rounded-xl bg-background border-border-subtle text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all h-10 mt-2">
                                Limpar Fila de Falhas
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Atividade */}
                    <Card className="bg-surface border-border-subtle rounded-3xl p-8 space-y-6 border text-left">
                         <CardHeader className="p-0">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Clock size={14} className="text-primary" /> Atividade Recente
                            </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="p-0 space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border-subtle">
                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-[22px] h-[22px] rounded-full bg-success/20 flex items-center justify-center border border-success/30">
                                    <div className="w-2 h-2 rounded-full bg-success"></div>
                                </div>
                                <p className="text-xs font-bold text-foreground">Configuração salva</p>
                                <p className="text-[10px] text-muted-foreground italic">há 2 horas</p>
                            </div>
                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-[22px] h-[22px] rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                </div>
                                <p className="text-xs font-bold text-foreground">API Key rotacionada</p>
                                <p className="text-[10px] text-muted-foreground italic">há 5 horas</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
