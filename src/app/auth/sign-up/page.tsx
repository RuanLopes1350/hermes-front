import Input from "@/src/components/input"
import ButtonInput from "@/src/components/button-input"
import Button from "@/src/components/button"
import { ArrowRight } from "lucide-react"
import { FaGithub, FaGoogle } from "react-icons/fa"
import Link from "next/link"
import { GitHub, Version, Documentacao, Privacidade, Status } from "../../layout"

export default function SignUpPage() {
    return (
        <>
            <div className="flex flex-col items-center w-full gap-8">
                <div className="flex flex-col items-center mt-4">
                    <img className="border border-[#252428] rounded-2xl w-20 h-20" src="*" alt="*" />
                    <h1 className="text-[#f9f5f8] font-bold text-5xl">Hermes</h1>
                    <p className="text-[#adaaad] text-xl">Microsserviço de Envio de E-mails</p>
                </div>
                <div className="w-full max-w-lg bg-[#161619] p-8 border border-[#252428] rounded-xl shadow-md">
                    <h2 className="text-[#f9f5f8] text-3xl font-bold">Criar uma nova conta</h2>
                    <p className="text-[#adaaad] text-xl">Informe suas credenciais de acesso</p>
                    <div className="flex flex-col mt-4">
                        <Input type="text" label="NOME" labelColor="text-[#a1a1aa]" placeholder="Seu nome completo" containerClassName="w-full" />
                    </div>
                    <div className="flex flex-col mt-4">
                        <Input type="email" label="E-MAIL" labelColor="text-[#a1a1aa]" placeholder="email@exemplo.com" containerClassName="w-full" />
                    </div>
                    <div className="flex flex-col mt-4">
                        <Input type="password" label="SENHA" labelColor="text-[#a1a1aa]" placeholder="********" containerClassName="w-full" />
                    </div>
                    <div className="flex flex-col mt-4">
                        <Input type="password" label="CONFIRMAR SENHA" labelColor="text-[#a1a1aa]" placeholder="********" containerClassName="w-full" />
                    </div>
                    <div className="flex flex-col mt-4">
                        <ButtonInput label="Criar Conta" labelIcon={<ArrowRight />} containerClassName="w-full h-14 mt-2" />
                    </div>
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-[#252428]"></div>
                        <p className="text-xs text-[#71717a] whitespace-nowrap">OU CONTINUAR COM</p>
                        <div className="flex-1 h-px bg-[#252428]"></div>
                    </div>
                    <div className="w-full flex flex-row gap-8">
                        <Button label="GitHub" labelIcon={<FaGithub />} containerClassName="w-1/2" />
                        <Button label="Google" labelIcon={<FaGoogle />} containerClassName="w-1/2" />
                    </div>

                    <div className="flex flex-row items-center justify-center pt-6">
                        <p className="text-[#adaaad]">Já possui uma conta? <Link href="/auth/sign-in" className="text-[#be9dff] hover:underline">Faça login</Link></p>
                    </div>

                </div>
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-row gap-8">
                        <a href={Documentacao} target="_blank" rel="noopener noreferrer" className="text-[#71717a]">DOCUMENTAÇÃO</a>
                        <a href={Status} target="_blank" rel="noopener noreferrer" className="text-[#71717a]">STATUS</a>
                        <a href={Privacidade} target="_blank" rel="noopener noreferrer" className="text-[#71717a]">PRIVACIDADE</a>
                    </div>
                    <p className="text-[#71717a]">2026 Hermes - Versão <a className="text-blue-500">{Version}</a></p>
                    <p className="text-[#71717a]">Desenvolvido por <a href={GitHub} target="_blank" rel="noopener noreferrer" className="text-blue-500">🔱Ruan Lopes🦈</a></p>
                </div>
            </div>
        </>
    )
}