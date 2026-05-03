"use client";

import { 
    Users, 
    UserPlus, 
    Shield, 
    Search,
    Trash2,
    Settings
} from "lucide-react";
import { useState } from "react";
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
import { Card } from "@/src/components/ui/card";

const mockUsers = [
    {
        id: "usr_1",
        name: "Ruan Lopes",
        email: "admin@hermes.com",
        role: "admin",
        status: "active",
        joinedAt: "2024-03-24"
    },
    {
        id: "usr_2",
        name: "Dev Team",
        email: "dev@hermes.com",
        role: "user",
        status: "active",
        joinedAt: "2024-04-10"
    },
    {
        id: "usr_3",
        name: "QA Specialist",
        email: "qa@hermes.com",
        role: "user",
        status: "inactive",
        joinedAt: "2024-04-15"
    }
];

export default function UsersPage() {
    return (
        <div className="space-y-12 text-left">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase text-foreground">Gestão de Usuários</h2>
                    <p className="text-muted-foreground text-sm font-medium italic">Gerencie permissões e acessos à plataforma Hermes.</p>
                </div>
                
                <Button className="gap-2 uppercase font-black tracking-widest text-[10px]">
                    <UserPlus size={18} /> Convidar Usuário
                </Button>
            </div>

            <Card className="bg-surface border-border-subtle rounded-[32px] overflow-hidden shadow-sm border">
                <div className="p-6 border-b border-border-subtle bg-background/30 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input 
                            placeholder="Buscar usuários..."
                            className="bg-background border-border-subtle rounded-2xl pl-12 pr-6 py-6 italic h-12"
                        />
                    </div>
                </div>

                <Table>
                    <TableHeader className="bg-background/50">
                        <TableRow className="border-b border-border-subtle/30">
                            <TableHead className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Usuário</TableHead>
                            <TableHead className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Nível de Acesso</TableHead>
                            <TableHead className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Status</TableHead>
                            <TableHead className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Data de Entrada</TableHead>
                            <TableHead className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockUsers.map((user) => (
                            <TableRow key={user.id} className="hover:bg-white/5 transition-colors group border-b border-border-subtle/30">
                                <TableCell className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-foreground">{user.name}</p>
                                            <p className="text-[10px] text-muted-foreground italic">{user.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-6 text-left">
                                    {user.role === "admin" ? (
                                        <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase gap-1.5 px-3 py-1">
                                            <Shield size={12} /> Administrador
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-white/5 text-muted-foreground border-border-subtle text-[10px] font-bold uppercase px-3 py-1">
                                            Membro
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="px-8 py-6 text-left">
                                    <div className="flex items-center gap-2">
                                        <div className={"w-2 h-2 rounded-full " + (user.status === "active" ? "bg-success" : "bg-muted-foreground/30")}></div>
                                        <span className={"text-[10px] font-bold uppercase tracking-widest " + (user.status === "active" ? "text-foreground" : "text-muted-foreground")}>
                                            {user.status === "active" ? "Ativo" : "Inativo"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-6 text-left">
                                    <span className="text-xs font-mono text-muted-foreground">{user.joinedAt}</span>
                                </TableCell>
                                <TableCell className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                            <Settings size={18} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-danger">
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
