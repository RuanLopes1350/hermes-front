import Input from "@/src/components/input"
import ButtonInput from "@/src/components/button-input"
import Button from "@/src/components/button"
import { ArrowRight } from "lucide-react"
import { FaGithub, FaGoogle } from "react-icons/fa"
import Link from "next/link"
import { GitHub, Version, Documentacao, Privacidade, Status } from "../../layout"

export default function SignInPage() {
    return (
        // Removido o bg-[#0f0f11] e o min-h-screen. 
        // Agora o elemento pai apenas agrupa o conteúdo com largura total
        <div className="flex flex-col items-center w-full gap-8">
            
            <div className="flex flex-col items-center text-center">
                <img className="border border-[#252428] rounded-2xl w-20 h-20 mb-2 shadow-sm" src="*" alt="Hermes Logo" />
                <h1 className="text-[#f9f5f8] font-bold text-5xl">Hermes</h1>
                <p className="text-[#adaaad] text-xl mt-2">Microsserviço de Envio de E-mails</p>
            </div>

            {/* Substituímos o w-1/3 por w-full max-w-lg para responsividade perfeita */}
            <div className="w-full max-w-lg bg-[#161619] p-8 border border-[#252428] rounded-xl shadow-md">
                <h2 className="text-[#f9f5f8] text-3xl font-bold">Bem-vindo</h2>
                <p className="text-[#adaaad] text-lg mb-6">Informe as suas credenciais de acesso</p>
                
                <div className="flex flex-col gap-4">
                    <Input type="email" label="E-MAIL" labelColor="text-[#a1a1aa]" placeholder="email@exemplo.com" containerClassName="w-full" />
                    
                    <Input type="password" label="SENHA" labelColor="text-[#a1a1aa]" secondaryLabel={<Link href="/auth/recovery" className="text-[#be9dff] hover:underline">Esqueci a minha senha</Link>} secondaryLabelColor="text-[#be9dff]" placeholder="********" containerClassName="w-full" />
                    
                    {/* Ajuste de margem superior no botão para dar espaço visual (mt-2) */}
                    <ButtonInput label="ENTRAR" labelIcon={<ArrowRight />} containerClassName="w-full h-14 mt-2" />
                </div>

                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-[#252428]"></div>
                    <p className="text-xs text-[#71717a] whitespace-nowrap">OU CONTINUAR COM</p>
                    <div className="flex-1 h-px bg-[#252428]"></div>
                </div>

                <div className="w-full flex flex-row gap-4">
                    <Button label="GitHub" labelIcon={<FaGithub />} containerClassName="w-1/2" />
                    <Button label="Google" labelIcon={<FaGoogle />} containerClassName="w-1/2" />
                </div>

                <div className="flex flex-row items-center justify-center pt-6">
                    {/* Correção lógica da mensagem de registo */}
                    <p className="text-[#adaaad]">Ainda não possui uma conta? <Link href="/auth/sign-up" className="text-[#be9dff] hover:underline">Registe-se</Link></p>
                </div>
            </div>

            <div className="flex flex-col items-center gap-4 mt-4 text-sm text-center">
                <div className="flex flex-row gap-8">
                    <a href={Documentacao} target="_blank" rel="noopener noreferrer" className="text-[#71717a] hover:text-[#f9f5f8] transition-colors">DOCUMENTAÇÃO</a>
                    <a href={Status} target="_blank" rel="noopener noreferrer" className="text-[#71717a] hover:text-[#f9f5f8] transition-colors">STATUS</a>
                    <a href={Privacidade} target="_blank" rel="noopener noreferrer" className="text-[#71717a] hover:text-[#f9f5f8] transition-colors">PRIVACIDADE</a>
                </div>
                <p className="text-[#71717a]">2026 Hermes - Versão <span className="text-blue-500">{Version}</span></p>
                <p className="text-[#71717a]">Desenvolvido por <a href={GitHub} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">🔱Ruan Lopes🦈</a></p>
            </div>
        </div>
    )
}