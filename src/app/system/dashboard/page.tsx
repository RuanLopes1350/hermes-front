"use client";

import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Activity, 
  TrendingUp, 
  ArrowUpRight 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

export default function DashboardPage() {
  const stats = [
    { 
      label: "Taxa de Sucesso", 
      value: "99.82%", 
      change: "+0.2%", 
      icon: CheckCircle2, 
      color: "text-success", 
      bg: "bg-success/10" 
    },
    { 
      label: "Latência Média", 
      value: "42ms", 
      change: "-5ms", 
      icon: Clock, 
      color: "text-primary", 
      bg: "bg-primary/10" 
    },
    { 
      label: "Erros (24h)", 
      value: "12", 
      change: "-4", 
      icon: AlertCircle, 
      color: "text-danger", 
      bg: "bg-danger/10" 
    },
    { 
      label: "Total Req.", 
      value: "1.2M", 
      change: "+12%", 
      icon: Activity, 
      color: "text-foreground", 
      bg: "bg-white/5" 
    },
  ];

  return (
    <div className="space-y-10 text-left">
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase text-foreground">Visão Geral</h2>
        <p className="text-muted-foreground text-sm italic">
          Acompanhe o desempenho e a saúde do seu motor de e-mails em tempo real.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-surface border-border-subtle rounded-2xl p-6 hover:border-primary/30 transition-all group duration-300 shadow-sm border">
            <div className="flex justify-between items-start mb-4">
              <div className={stat.bg + " p-2.5 rounded-xl " + stat.color + " group-hover:scale-110 transition-transform"}>
                <stat.icon size={20} />
              </div>
              <Badge variant="outline" className={
                "border-none text-[10px] font-bold px-2 py-1 rounded-full " + 
                (stat.change.startsWith('+') ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary')
              }>
                {stat.change}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold italic">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Area (Bento Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity Chart Placeholder */}
        <Card className="lg:col-span-2 bg-surface border-border-subtle rounded-2xl p-8 min-h-[400px] flex flex-col border text-left">
          <div className="flex justify-between items-center mb-8">
            <div>
              <CardTitle className="text-lg font-bold uppercase tracking-tight text-foreground">Volume de Disparos</CardTitle>
              <CardDescription className="text-muted-foreground text-xs italic">Últimos 7 dias de atividade</CardDescription>
            </div>
            <Link href="/system/logs">
                <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-primary gap-1 p-0 h-auto">
                    Relatório completo <ArrowUpRight size={14} />
                </Button>
            </Link>
          </div>
          <div className="flex-1 border border-dashed border-border-subtle rounded-3xl flex items-center justify-center bg-background/50 group cursor-default">
             <div className="text-center">
                <TrendingUp size={48} className="mx-auto mb-4 text-muted-foreground/20 group-hover:text-primary/40 transition-colors duration-500" />
                <p className="text-muted-foreground text-xs italic font-medium">Gráfico de atividade em desenvolvimento...</p>
             </div>
          </div>
        </Card>

        {/* Status / Quick Links Panel */}
        <Card className="bg-surface border-border-subtle rounded-2xl p-8 flex flex-col border text-left">
          <CardTitle className="text-lg font-bold mb-6 uppercase tracking-tight text-foreground">Status do Sistema</CardTitle>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                <span className="text-muted-foreground">Uso de API (Mensal)</span>
                <span className="text-primary">85%</span>
              </div>
              <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border-subtle p-0.5">
                <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
               {[
                 { name: "PostgreSQL", status: "Operacional", color: "bg-success" },
                 { name: "Redis / BullMQ", status: "Operacional", color: "bg-success" },
                 { name: "Worker Nodes", status: "3 Ativos", color: "bg-success" }
               ].map((service, i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-background/40 border border-border-subtle/50">
                    <span className="text-xs font-bold text-foreground uppercase tracking-tight">{service.name}</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{service.status}</span>
                       <span className={"w-2 h-2 rounded-full " + service.color + " animate-pulse"}></span>
                    </div>
                 </div>
               ))}
            </div>

            <Button className="w-full mt-6 py-6 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-hover h-14">
               Monitoramento Real
            </Button>
          </div>
        </Card>

      </div>

      {/* Recent Logs Table Preview */}
      <Card className="bg-surface border-border-subtle rounded-3xl overflow-hidden shadow-sm border text-left">
        <div className="p-8 border-b border-border-subtle flex justify-between items-center bg-background/30">
           <CardTitle className="text-lg font-bold uppercase tracking-tight text-foreground">Logs Recentes</CardTitle>
           <Link href="/system/logs">
              <Button variant="outline" className="px-5 py-2.5 rounded-xl bg-background text-[10px] font-black uppercase text-muted-foreground border-border-subtle hover:text-primary hover:border-primary/50 transition-all tracking-widest">
                Ver Tudo
              </Button>
           </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-background/50">
              <TableRow className="border-b border-border-subtle/30">
                <TableHead className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Data/Hora</TableHead>
                <TableHead className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Serviço</TableHead>
                <TableHead className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Evento</TableHead>
                <TableHead className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Status</TableHead>
                <TableHead className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold text-right">Duração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { time: "Há 2 mins", service: "Store API", event: "auth.welcome_email", status: "Enviado", duration: "1.2s", color: "text-success" },
                { time: "Há 5 mins", service: "Marketing", event: "newsletter.weekly", status: "Enfileirado", duration: "-", color: "text-primary" },
                { time: "Há 12 mins", service: "System", event: "api_key.rotated", status: "Erro", duration: "0.8s", color: "text-danger" },
                { time: "Há 15 mins", service: "Store API", event: "order.confirmation", status: "Enviado", duration: "1.1s", color: "text-success" },
              ].map((log, i) => (
                <TableRow key={i} className="hover:bg-white/5 transition-colors cursor-pointer group border-b border-border-subtle/30">
                  <TableCell className="px-8 py-6 text-muted-foreground text-xs italic font-medium text-left">{log.time}</TableCell>
                  <TableCell className="px-8 py-6 font-bold text-foreground uppercase tracking-tight text-left">{log.service}</TableCell>
                  <TableCell className="px-8 py-6 text-xs font-mono text-primary/80 text-left">{log.event}</TableCell>
                  <TableCell className="px-8 py-6 text-left">
                    <Badge variant="outline" className={"border-none flex items-center gap-1.5 " + log.color + " font-black text-[9px] uppercase tracking-widest bg-transparent p-0"}>
                       <span className={"w-1.5 h-1.5 rounded-full " + log.color.replace('text', 'bg')}></span>
                       {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-muted-foreground text-xs font-mono text-right">{log.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="p-6 bg-background/30 text-center border-t border-border-subtle">
           <Link href="/system/logs">
              <Button variant="link" className="text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.3em]">
                Acessar Histórico Completo
              </Button>
           </Link>
        </div>
      </Card>
    </div>
  );
}
