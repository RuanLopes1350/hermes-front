"use client";

import { 
    Search, 
    Download, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Eye,
    Filter
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

const mockLogs = [
    {
        id: "log_1",
        email: "usuario@exemplo.com",
        template: "Boas-vindas",
        service: "Plataforma Principal",
        status: "success",
        date: "2024-04-27 18:30:00",
        subject: "Bem-vindo ao Hermes!"
    },
    {
        id: "log_2",
        email: "cliente@teste.com",
        template: "Recuperação de Senha",
        service: "App Mobile",
        status: "failed",
        date: "2024-04-27 18:25:00",
        subject: "Sua nova senha",
        error: "SMTP Timeout"
    },
    {
        id: "log_3",
        email: "suporte@empresa.com",
        template: "Notificação de Sistema",
        service: "Plataforma Principal",
        status: "success",
        date: "2024-04-27 18:15:00",
        subject: "Alerta de Segurança"
    }
];

export default function LogsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="text-left">
                    <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase">Logs de Auditoria</h2>
                    <p className="text-muted-foreground text-sm font-medium italic">Monitore o histórico completo de envios e falhas de e-mail.</p>
                </div>
                
                <Button variant="outline" className="gap-2 uppercase tracking-widest font-bold text-[10px]">
                    <Download size={16} /> Exportar CSV
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-3 bg-surface border-border-subtle rounded-[32px] overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border-subtle bg-background/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input 
                                placeholder="Buscar por e-mail, assunto ou ID..."
                                className="pl-12 bg-background border-border-subtle rounded-2xl italic"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[180px] bg-background border-border-subtle rounded-xl font-bold uppercase text-[10px] tracking-wider">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-surface border-border-subtle">
                                <SelectItem value="all">Todos Status</SelectItem>
                                <SelectItem value="success">Sucesso</SelectItem>
                                <SelectItem value="failed">Falha</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border-subtle bg-background/50 hover:bg-background/50">
                                <TableHead className="px-8 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Status</TableHead>
                                <TableHead className="px-8 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Destinatário</TableHead>
                                <TableHead className="px-8 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Template / Serviço</TableHead>
                                <TableHead className="px-8 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Data / Hora</TableHead>
                                <TableHead className="px-8 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockLogs.map((log) => (
                                <TableRow key={log.id} className="border-b border-border-subtle/50 hover:bg-white/5 transition-colors group">
                                    <TableCell className="px-8 py-6">
                                        {log.status === "success" ? (
                                            <Badge className="bg-success/10 text-success hover:bg-success/20 border-none text-[10px] font-bold uppercase gap-1.5 px-3 py-1">
                                                <CheckCircle2 size={12} /> Sucesso
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-danger/10 text-danger hover:bg-danger/20 border-none text-[10px] font-bold uppercase gap-1.5 px-3 py-1">
                                                <XCircle size={12} /> Falha
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-8 py-6 text-left">
                                        <p className="text-sm font-bold text-foreground">{log.email}</p>
                                        <p className="text-[10px] text-muted-foreground italic">{log.subject}</p>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 text-left">
                                        <p className="text-[10px] font-bold uppercase tracking-wider">{log.template}</p>
                                        <p className="text-[10px] text-primary italic font-medium">{log.service}</p>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 text-left">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock size={14} />
                                            <span className="text-xs font-mono">{log.date}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 text-right">
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                            <Eye size={18} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <div className="space-y-6 text-left">
                    <Card className="bg-surface border-border-subtle rounded-3xl p-6">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <Filter size={14} className="text-primary" /> Filtros Rápidos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-4">
                            <div className="p-4 bg-background/50 rounded-2xl border border-border-subtle hover:border-primary/30 transition-all cursor-pointer group">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 group-hover:text-primary">Erros Recentes</p>
                                <p className="text-2xl font-bold text-danger">12</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
