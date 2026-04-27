"use client";

import { LayoutDashboard, KeyRound, Code, FileText, History, SquareTerminal, CogIcon } from "lucide-react"
import { GrServices } from "react-icons/gr";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LeftPanel() {
    const pathname = usePathname();
    const isActive = (path: string) => {
        return pathname?.startsWith(`/system/${path}`);
    };

    return (
        <div className="fixed left-0 top-0 w-64 bg-surface border-r border-border-subtle text-text-primary p-6 flex flex-col h-screen overflow-y-auto">
            <div className="flex flex-row items-center gap-3 mb-10">
                <div className="bg-primary/10 p-2 rounded-xl">
                    <img className="w-10 h-10" src='/hermes-icon.svg' alt="Hermes Icon" />
                </div>
                <div className="flex flex-col items-start justify-center gap-0">
                    <h1 className="font-bold text-xl tracking-tight">Hermes</h1>
                    <p className="text-[10px] uppercase tracking-wider text-text-secondary font-medium">Mail Engine</p>
                </div>
            </div>

            <div className="flex flex-col justify-between flex-grow">
                <nav className="flex flex-col gap-1.5">
                    <p className="text-[10px] font-bold text-text-secondary uppercase px-3 mb-2 tracking-widest">Geral</p>

                    <Link
                        href="/system/dashboard"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("dashboard")
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                            }`}
                    >
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>

                    <Link
                        href="/system/services"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("services")
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                            }`}
                    >
                        <GrServices size={18} /> Serviços
                    </Link>

                    <p className="text-[10px] font-bold text-text-secondary uppercase px-3 mt-6 mb-2 tracking-widest">Segurança</p>

                    <Link
                        href="/system/credentials"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("credentials")
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                            }`}
                    >
                        <KeyRound size={18} /> Credenciais
                    </Link>

                    <Link
                        href="/system/api-keys"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("api-keys")
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                            }`}
                    >
                        <Code size={18} /> API Keys
                    </Link>

                    <p className="text-[10px] font-bold text-text-secondary uppercase px-3 mt-6 mb-2 tracking-widest">Monitoramento</p>

                    <Link
                        href="/system/templates"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("templates")
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                            }`}
                    >
                        <FileText size={18} /> Templates
                    </Link>

                    <Link
                        href="/system/sandbox"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("sandbox")
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                            }`}
                    >
                        <FileText size={18} /> Sandbox
                    </Link>

                    <Link
                        href="/system/history"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("history")
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                            }`}
                    >
                        <History size={18} /> Histórico
                    </Link>

                    <Link
                        href="/system/logs"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("logs")
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                            }`}
                    >
                        <SquareTerminal size={18} /> Logs
                    </Link>
                </nav>

                <div className="flex flex-col gap-2 mt-auto pt-6 border-t border-border-subtle/50">
                    <Link
                        href="/system/profile"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("profile")
                            ? "bg-primary text-white"
                            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                            }`}
                    >
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10">
                            <img className="w-full h-full object-cover" src="/no-profile-photo.svg" alt="Profile" />
                        </div>
                        Perfil
                    </Link>
                    <Link
                        href="/system/settings"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("settings")
                            ? "bg-primary text-white"
                            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                            }`}
                    >
                        <CogIcon size={18} /> Configurações
                    </Link>
                </div>
            </div>
        </div>
    )
}