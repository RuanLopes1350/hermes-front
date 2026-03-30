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
        <div className="fixed left-0 top-0 w-64 bg-[#262528] text-white p-4 flex flex-col h-screen overflow-y-auto">
            <div className="flex flex-row items-center gap-2 mb-8">
                <img className="w-12 h-12" src='/hermes-icon.svg' alt="Hermes Icon" />
                <div className="flex flex-col items-start justify-center gap-0">
                    <h1 className="font-bold text-lg">Hermes</h1>
                    <p className="text-xs text-gray-400">Microsserviço de E-mails</p>
                </div>
            </div>

            <div className="flex flex-col justify-between flex-grow">
                <div className="flex flex-col gap-2">
                    <Link
                        href="/system/dashboard"
                        className={`flex flex-row gap-2.5 cursor-pointer px-2 py-1 rounded transition-colors ${
                            isActive("dashboard") ? "bg-blue-600" : "hover:bg-gray-700"
                        }`}
                    >
                        <LayoutDashboard /> Dashboard
                    </Link>
                    <Link
                        href="/system/services"
                        className={`flex flex-row gap-2.5 cursor-pointer px-2 py-1 rounded transition-colors ${
                            isActive("services") ? "bg-blue-600" : "hover:bg-gray-700"
                        }`}
                    >
                        <GrServices /> Serviços
                    </Link>
                    <Link
                        href="/system/credentials"
                        className={`flex flex-row gap-2.5 cursor-pointer px-2 py-1 rounded transition-colors ${
                            isActive("credentials") ? "bg-blue-600" : "hover:bg-gray-700"
                        }`}
                    >
                        <KeyRound /> Credenciais
                    </Link>
                    <Link
                        href="/system/api-keys"
                        className={`flex flex-row gap-2.5 cursor-pointer px-2 py-1 rounded transition-colors ${
                            isActive("api-keys") ? "bg-blue-600" : "hover:bg-gray-700"
                        }`}
                    >
                        <Code /> API Keys
                    </Link>
                    <Link
                        href="/system/templates"
                        className={`flex flex-row gap-2.5 cursor-pointer px-2 py-1 rounded transition-colors ${
                            isActive("templates") ? "bg-blue-600" : "hover:bg-gray-700"
                        }`}
                    >
                        <FileText /> Templates
                    </Link>
                    <Link
                        href="/system/history"
                        className={`flex flex-row gap-2.5 cursor-pointer px-2 py-1 rounded transition-colors ${
                            isActive("history") ? "bg-blue-600" : "hover:bg-gray-700"
                        }`}
                    >
                        <History /> Histórico
                    </Link>
                    <Link
                        href="/system/logs"
                        className={`flex flex-row gap-2.5 cursor-pointer px-2 py-1 rounded transition-colors ${
                            isActive("logs") ? "bg-blue-600" : "hover:bg-gray-700"
                        }`}
                    >
                        <SquareTerminal /> Logs
                    </Link>
                </div>

                <div className="flex flex-col gap-2">
                    <Link
                        href="/system/profile"
                        className={`flex flex-row gap-2.5 cursor-pointer px-2 py-1 rounded transition-colors ${
                            isActive("profile") ? "bg-blue-600" : "hover:bg-gray-700"
                        }`}
                    >
                        <img className="w-6 h-6" src="/no-profile-photo.svg" alt="User's Profile Picture" />Perfil
                    </Link>
                    <Link
                        href="/system/settings"
                        className={`flex flex-row gap-2.5 cursor-pointer px-2 py-1 rounded transition-colors ${
                            isActive("settings") ? "bg-blue-600" : "hover:bg-gray-700"
                        }`}
                    >
                        <CogIcon /> Configurações
                    </Link>
                </div>
            </div>
        </div>
    )
}