"use client";

import LeftPanel from "@/src/components/left-panel";
import { User, Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

export default function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Extrair o nome da página atual para o breadcrumb
  const pageName = pathname?.split("/").pop() || "dashboard";
  const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden">
      {/* Menu Lateral - Adicionado de volta */}
      <LeftPanel />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-border-subtle bg-surface/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <nav className="flex text-sm font-medium">
              <span className="text-text-secondary">Sistema</span>
              <span className="mx-2 text-border-subtle">/</span>
              <span className="text-text-primary font-semibold">{formattedPageName}</span>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
               <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
               <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  className="bg-background border border-border-subtle rounded-full py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 w-64 transition-all"
               />
            </div>

            <button className="text-text-secondary hover:text-text-primary transition-colors relative">
               <Bell size={20} />
               <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full border-2 border-surface"></span>
            </button>

            <div className="h-8 w-px bg-border-subtle/50"></div>

            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="flex flex-col items-end mr-1">
                <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">Admin User</span>
                <span className="text-[10px] text-text-secondary">Pro Plan</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <User size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* Viewport Principal */}
        <main className="flex-1 overflow-y-auto p-8 relative">
           {/* Background decorative elements */}
           <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
           
           <div className="max-w-7xl mx-auto relative z-10">
              {children}
           </div>
        </main>
      </div>
    </div>
  );
}