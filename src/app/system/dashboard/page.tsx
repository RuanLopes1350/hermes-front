import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Activity, 
  TrendingUp, 
  ArrowUpRight 
} from "lucide-react";

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
      color: "text-text-primary", 
      bg: "bg-white/5" 
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Visão Geral</h2>
        <p className="text-text-secondary text-sm">
          Acompanhe o desempenho e a saúde do seu motor de e-mails em tempo real.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-surface border border-border-subtle rounded-2xl p-6 hover:border-primary/30 transition-all group duration-300 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} p-2.5 rounded-xl ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                stat.change.startsWith('+') ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area (Bento Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity Chart Placeholder */}
        <div className="lg:col-span-2 bg-surface border border-border-subtle rounded-2xl p-8 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold">Volume de Disparos</h3>
              <p className="text-text-secondary text-xs">Últimos 7 dias de atividade</p>
            </div>
            <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              Ver relatório completo <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="flex-1 border border-dashed border-border-subtle rounded-xl flex items-center justify-center bg-background/50 group cursor-default">
             <div className="text-center">
                <TrendingUp size={48} className="mx-auto mb-4 text-text-secondary/20 group-hover:text-primary/40 transition-colors duration-500" />
                <p className="text-text-secondary text-sm italic">Gráfico de atividade em desenvolvimento...</p>
             </div>
          </div>
        </div>

        {/* Status / Quick Links Panel */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-8 flex flex-col">
          <h3 className="text-lg font-bold mb-6">Status do Sistema</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-secondary font-medium">Uso de API (Cota Mensal)</span>
                <span className="text-text-primary font-bold">85%</span>
              </div>
              <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border-subtle">
                <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
               {[
                 { name: "PostgreSQL", status: "Operacional", color: "bg-success" },
                 { name: "Redis / BullMQ", status: "Operacional", color: "bg-success" },
                 { name: "Worker Nodes", status: "Operacional (3/3)", color: "bg-success" }
               ].map((service, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-border-subtle/50">
                    <span className="text-xs font-medium">{service.name}</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-text-secondary">{service.status}</span>
                       <span className={`w-2 h-2 rounded-full ${service.color} animate-pulse`}></span>
                    </div>
                 </div>
               ))}
            </div>

            <button className="w-full mt-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all duration-300">
               Ver Status Completo
            </button>
          </div>
        </div>

      </div>

      {/* Recent Logs Table Preview */}
      <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center">
           <h3 className="text-lg font-bold">Logs Recentes</h3>
           <div className="flex gap-2">
              <div className="px-3 py-1 rounded-lg bg-background text-[10px] font-bold text-text-secondary border border-border-subtle">FILTRAR</div>
              <div className="px-3 py-1 rounded-lg bg-background text-[10px] font-bold text-text-secondary border border-border-subtle">EXPORTAR</div>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] uppercase tracking-wider text-text-secondary bg-background/50">
              <tr>
                <th className="px-6 py-4 font-bold">Timestamp</th>
                <th className="px-6 py-4 font-bold">Serviço</th>
                <th className="px-6 py-4 font-bold">Evento</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Duração</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/30">
              {[
                { time: "Há 2 mins", service: "Store API", event: "auth.welcome_email", status: "Enviado", duration: "1.2s", color: "text-success" },
                { time: "Há 5 mins", service: "Marketing", event: "newsletter.weekly", status: "Enfileirado", duration: "-", color: "text-primary" },
                { time: "Há 12 mins", service: "System", event: "api_key.rotated", status: "Erro", duration: "0.8s", color: "text-danger" },
                { time: "Há 15 mins", service: "Store API", event: "order.confirmation", status: "Enviado", duration: "1.1s", color: "text-success" },
              ].map((log, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 text-text-secondary text-xs">{log.time}</td>
                  <td className="px-6 py-4 font-semibold text-text-primary">{log.service}</td>
                  <td className="px-6 py-4 text-xs font-mono text-primary/80">{log.event}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 ${log.color} font-bold text-[10px] uppercase`}>
                       <span className={`w-1.5 h-1.5 rounded-full ${log.color.replace('text', 'bg')}`}></span>
                       {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-secondary text-xs group-hover:text-text-primary transition-colors">{log.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-background/30 text-center border-t border-border-subtle">
           <button className="text-xs font-bold text-text-secondary hover:text-primary transition-colors">VER TODOS OS LOGS</button>
        </div>
      </div>
    </div>
  );
}