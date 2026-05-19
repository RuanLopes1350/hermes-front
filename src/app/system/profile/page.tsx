import Button from '@/src/components/button';
import ButtonInput from '@/src/components/button-input';
import Input from '@/src/components/input';
import TickButton from '@/src/components/tick-button';
import { User, Shield, Bell, Trash2, Camera, Mail } from 'lucide-react';

export default function ProfilePage() {
	return (
		<div className="space-y-12 pb-20">
			{/* Page Header */}
			<div>
				<h2 className="text-3xl font-bold tracking-tight mb-2 uppercase">Configurações da Conta</h2>
				<p className="text-text-secondary text-sm">
					Gerencie suas informações pessoais e preferências de segurança.
				</p>
			</div>

			{/* Perfil Section */}
			<section className="space-y-6">
				<div className="flex items-center gap-2 px-1">
					<User size={18} className="text-primary" />
					<h3 className="text-lg font-bold">Perfil do Usuário</h3>
				</div>

				<div className="bg-surface border border-border-subtle rounded-3xl p-8 shadow-sm">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10 pb-8 border-b border-border-subtle/50">
						<div className="flex items-center gap-6">
							<div className="relative group cursor-pointer">
								<div className="h-24 w-24 rounded-2xl border-2 border-border-subtle overflow-hidden bg-background flex items-center justify-center transition-all group-hover:border-primary/50">
									<img
										className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
										src="/no-profile-photo.svg"
										alt="User"
									/>
								</div>
								<div className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-lg text-white shadow-lg group-hover:scale-110 transition-transform">
									<Camera size={14} />
								</div>
							</div>
							<div>
								<h4 className="text-xl font-bold text-text-primary">Nome do Usuário</h4>
								<p className="text-text-secondary text-xs font-medium uppercase tracking-wider mt-1">
									Admin da Organização
								</p>
								<p className="text-text-secondary/60 text-[10px] mt-2 italic">
									Formatos: JPG, PNG. Máx: 2MB
								</p>
							</div>
						</div>

						<div className="flex gap-3">
							<Button label="Remover" variant="outline" containerClassName="h-10 text-[10px]" />
							<Button
								label="Alterar Foto"
								variant="primary"
								containerClassName="h-10 text-[10px]"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<Input label="Seu nome" placeholder="Ruan Lopes" />
						<Input label="E-mail de acesso" placeholder="ruan@exemplo.com" />
					</div>

					<div className="mt-10 flex justify-end">
						<ButtonInput label="Salvar Alterações" containerClassName="md:w-auto px-10" />
					</div>
				</div>
			</section>

			{/* Segurança Section */}
			<section className="space-y-6">
				<div className="flex items-center gap-2 px-1">
					<Shield size={18} className="text-primary" />
					<h3 className="text-lg font-bold">Segurança & Autenticação</h3>
				</div>

				<div className="bg-surface border border-border-subtle rounded-3xl p-8 shadow-sm">
					<div className="mb-10">
						<h4 className="font-bold text-text-primary mb-1">Atualizar Senha</h4>
						<p className="text-text-secondary text-sm">
							Mínimo de 8 caracteres com letras, números e símbolos.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<Input label="Senha Atual" placeholder="••••••••" type="password" />
						<Input label="Nova Senha" placeholder="••••••••" type="password" />
						<Input label="Confirmar Nova" placeholder="••••••••" type="password" />
					</div>

					<div className="mt-10 flex justify-end">
						<Button
							label="Atualizar Credenciais de Acesso"
							variant="secondary"
							containerClassName="md:w-auto px-8"
						/>
					</div>
				</div>
			</section>

			{/* Notificações Section */}
			<section className="space-y-6">
				<div className="flex items-center gap-2 px-1">
					<Bell size={18} className="text-primary" />
					<h3 className="text-lg font-bold">Preferências de Alerta</h3>
				</div>

				<div className="bg-surface border border-border-subtle rounded-3xl p-2 overflow-hidden">
					<div className="flex flex-row items-center justify-between p-6 hover:bg-white/5 transition-colors rounded-2xl group">
						<div className="flex flex-col">
							<h4 className="font-bold text-text-primary group-hover:text-primary transition-colors">
								Alertas de Segurança
							</h4>
							<p className="text-text-secondary text-sm">
								Notificar sobre logins em novos dispositivos ou falhas de auth.
							</p>
						</div>
						<TickButton />
					</div>
					<div className="h-px bg-border-subtle/30 mx-6"></div>
					<div className="flex flex-row items-center justify-between p-6 hover:bg-white/5 transition-colors rounded-2xl group">
						<div className="flex flex-col">
							<h4 className="font-bold text-text-primary group-hover:text-primary transition-colors">
								Rotação de Chaves
							</h4>
							<p className="text-text-secondary text-sm">
								Avisar quando uma API Key estiver próxima do vencimento.
							</p>
						</div>
						<TickButton />
					</div>
				</div>
			</section>

			{/* Perigo Section */}
			<section className="space-y-6">
				<div className="flex items-center gap-2 px-1 text-danger">
					<Trash2 size={18} />
					<h3 className="text-lg font-bold">Zona de Perigo</h3>
				</div>

				<div className="bg-danger/5 border border-danger/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
					<div className="text-center md:text-left">
						<h4 className="font-bold text-text-primary">Excluir minha conta permanentemente</h4>
						<p className="text-text-secondary text-sm mt-1">
							Todos os seus serviços, templates e logs serão apagados. Esta ação é irreversível.
						</p>
					</div>
					<Button
						label="Excluir Conta"
						variant="danger"
						containerClassName="w-full md:w-auto px-10"
					/>
				</div>
			</section>
		</div>
	);
}
