import Input from '@/src/components/input';
import ButtonInput from '@/src/components/button-input';
import Button from '@/src/components/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import { GitHub, Version, Documentacao, Privacidade, Status } from '@/src/constants/links';

export default function RecoveryPage() {
	return (
		<>
			<div className="flex flex-col items-center w-full gap-8">
				<div className="flex flex-col items-center mt-4">
					<img className="border border-[#252428] rounded-2xl w-20 h-20" src="*" alt="*" />
					<h1 className="text-[#f9f5f8] font-bold text-5xl">Hermes</h1>
					<p className="text-[#adaaad] text-xl">Microsserviço de Envio de E-mails</p>
				</div>
				<div className="w-full max-w-lg bg-[#161619] p-8 border border-[#252428] rounded-xl shadow-md">
					<h2 className="text-[#f9f5f8] text-3xl font-bold">Recuperar Senha</h2>
					<p className="text-[#adaaad] text-xl">
						Enviaremos um link de redefinição de senha para o seu e-mail.
					</p>
					<div className="flex flex-col mt-4">
						<Input
							type="email"
							label="E-MAIL"
							labelColor="text-[#a1a1aa]"
							placeholder="email@exemplo.com"
							containerClassName="w-full"
						/>
					</div>
					<div className="flex flex-col mt-4">
						<ButtonInput
							label="Enviar Link de Recuperação"
							labelIcon={<ArrowRight />}
							containerClassName="w-full h-14 mt-2"
						/>
					</div>

					<div className="pt-6">
						<Link
							href="/auth/sign-in"
							className="flex flex-row items-center justify-center text-[#adaaad] hover:underline"
						>
							<ArrowLeft /> Voltar para{' '}
							<span className="text-[#be9dff] hover:underline">Login</span>
						</Link>
					</div>
				</div>
				<div className="flex flex-col items-center gap-4">
					<div className="flex flex-row gap-8">
						<a
							href={Documentacao}
							target="_blank"
							rel="noopener noreferrer"
							className="text-[#71717a]"
						>
							DOCUMENTAÇÃO
						</a>
						<a href={Status} target="_blank" rel="noopener noreferrer" className="text-[#71717a]">
							STATUS
						</a>
						<a
							href={Privacidade}
							target="_blank"
							rel="noopener noreferrer"
							className="text-[#71717a]"
						>
							PRIVACIDADE
						</a>
					</div>
					<p className="text-[#71717a]">
						2026 Hermes - Versão <a className="text-blue-500">{Version}</a>
					</p>
					<p className="text-[#71717a]">
						Desenvolvido por{' '}
						<a href={GitHub} target="_blank" rel="noopener noreferrer" className="text-blue-500">
							🔱Ruan Lopes🦈
						</a>
					</p>
				</div>
			</div>
		</>
	);
}
