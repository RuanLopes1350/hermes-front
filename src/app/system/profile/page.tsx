import LeftPanel from "@/src/components/left-panel";
import Button from "@/src/components/button";
import ButtonInput from "@/src/components/button-input";
import Input from "@/src/components/input";
import TickButton from "@/src/components/tick-button";

export default function ProfilePage() {
    return (
        <>
            <h1 className="text-white">CONFIGURAÇÕES DA CONTA</h1>

            <div className="flex flex-col p-16 gap-6">
                <h2 className="text-white">PERFIL</h2>
                <div className="flex flex-col p-6 border border-[#262528] rounded-2xl bg-[#151518]">
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-row gap-7 items-center">
                            <img className="h-20 w-20 rounded-2xl border border-[#262528]" src="../no-profile-photo.svg" alt="User's Profile Picture" />
                            <div>
                                <h3 className="text-white">Nome do Usuário</h3>
                                <p className="text-gray-400">JPG ou PNG. Tamanho máximo: 2MB</p>
                            </div>
                        </div>

                        <div className="flex flex-row gap-6">
                            <Button label="Remover" containerClassName="h-10" />
                            <ButtonInput label="Alterar Foto" containerClassName="h-13.5" />
                        </div>
                    </div>

                    <div className="flex flex-row gap-20">
                        <Input label="Nome" labelColor="text-gray-400" />
                        <Input label="Email" labelColor="text-gray-400" />
                    </div>
                    <div className="flex flex-row gap-4 pt-10 justify-end">
                        <ButtonInput label="Salvar Alterações" containerClassName="h-13.5" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col p-16 gap-6">
                <h2 className="text-white">SEGURANÇA</h2>
                <div className="flex flex-col p-6 border border-[#262528] rounded-2xl bg-[#151518]">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-white">Alterar Senha</h3>
                        <p className="text-gray-400 pb-10">Sua senha deve ter pelo menos 8 caracteres e conter letras maiúsculas, minúsculas, números e símbolos.</p>
                        <Input label="Senha Atual" containerClassName="w-1/3" labelColor="text-gray-400" placeholder="••••••••" type="password" />
                    </div>
                    <div className="flex flex-row gap-10 pt-10 justify-start">
                        <Input label="Nova Senha" containerClassName="w-1/3" labelColor="text-gray-400" placeholder="••••••••" type="password" />
                        <Input label="Confirmar Nova Senha" containerClassName="w-1/3" labelColor="text-gray-400" placeholder="••••••••" type="password" />
                    </div>

                    <div className="flex flex-row justify-end">
                        <Button label="Atualizar Senha" containerClassName="h-13.5 mt-10" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col p-16 gap-6">
                <h2 className="text-white">NOTIFICAÇÕES</h2>
                <div className="flex flex-col gap-6 p-6 border border-[#262528] rounded-2xl bg-[#151518]">
                    <div className="flex flex-row items-center justify-between">
                        <div className="flex flex-col">
                            <h3 className="text-white">Alertas de Segurança</h3>
                            <p className="text-gray-400">Seja notificado sobre atividades suspeitas na sua conta.</p>
                        </div>
                        <TickButton />
                    </div>
                    <div className="flex flex-row items-center justify-between">
                        <div className="flex flex-col">
                            <h3 className="text-white">Alertar de Rotação de Chaves</h3>
                            <p className="text-gray-400">Seja notificado sobre rotações de chaves.</p>
                        </div>
                        <TickButton />
                    </div>
                </div>
            </div>

            <div className="flex flex-col p-16 gap-6">
                <h2 className="text-[#FF6E84]">ZONA DE PERIGO</h2>
                <div className="flex flex-row gap-6 justify-between p-6 border border-[#FF6E84] rounded-2xl bg-[#FF6E84]/30">
                    <div className="flex flex-col">
                        <h3 className="text-white">Excluir Conta</h3>
                        <p className="text-gray-400">Uma vez que você excluir sua conta, não há volta. Por favor, tenha certeza.</p>
                    </div>
                    <div>
                        <Button label="Excluir Conta" containerClassName="h-13.5 border-[#FF6E84] bg-[#CF3A51] hover:bg-red-700" />
                    </div>
                </div>
            </div>
        </>
    )
}