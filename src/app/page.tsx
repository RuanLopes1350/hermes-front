import Link from 'next/link';
import { Mail, ShieldCheck, FileCode2, Webhook, ArrowRight } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

import LogoPrimarioClaro from '@/public/hermes-primario.svg';
import LogoPrimarioEscuro from '@/public/hermes-escuro.svg';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { ThemeToggle } from '@/src/components/theme-toggle';
import { CodeBlock } from '@/src/components/code-block';

const GITHUB_ORG_URL = 'https://github.com/RuanLopes1350';

const features = [
	{
		icon: ShieldCheck,
		title: 'Multitenant por serviço',
		description:
			'Cada serviço tem suas próprias credenciais, membros e configurações isoladas — ideal para times ou múltiplos produtos.',
	},
	{
		icon: Mail,
		title: 'SMTP e Google OAuth2',
		description:
			'Conecte sua própria conta SMTP ou OAuth2 do Google. Sem vendor lock-in de provedor de e-mail.',
	},
	{
		icon: FileCode2,
		title: 'Templates em MJML',
		description:
			'Editor com preview ao vivo, variáveis dinâmicas e versionamento de histórico para seus templates transacionais.',
	},
	{
		icon: Webhook,
		title: 'Rotação de chaves via Webhook',
		description:
			'API Keys rotacionam automaticamente e notificam sua aplicação via Webhook assinado com HMAC-SHA256.',
	},
];

const quickstartInstall = `npm install @ruanlopes1350/hermes-client`;

const quickstartInit = `import { HermesClient } from '@ruanlopes1350/hermes-client';

const hermes = new HermesClient({
  baseUrl: 'https://sua-instancia-hermes.com',
  initialApiKey: 'hm_sua_chave_aqui',
});`;

const quickstartSend = `await hermes.email()
  .to('cliente@empresa.com')
  .subject('Bem-vindo ao Sistema!')
  .useTemplate('uuid-do-template', { nome: 'João da Silva' })
  .send();`;

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-background flex flex-col">
			<header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur">
				<div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4 sm:px-6">
					<div className="flex items-center">
						<LogoPrimarioClaro className="block dark:hidden w-32 h-16" />
						<LogoPrimarioEscuro className="hidden dark:block w-32 h-16" />
					</div>
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="icon" asChild>
							<a href={GITHUB_ORG_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
								<FaGithub className="h-4 w-4" />
							</a>
						</Button>
						<ThemeToggle />
						<Button asChild>
							<Link href="/auth/sign-in">Entrar</Link>
						</Button>
					</div>
				</div>
			</header>

			<main className="flex-1">
				{/* Hero */}
				<section className="container mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 text-center">
					<span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
						Open-source · SMTP · OAuth2 · Webhooks
					</span>
					<h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
						Gateway de e-mails transacionais, sem dor de cabeça.
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
						Gerencie credenciais SMTP e OAuth2, templates em MJML e audite cada envio em tempo real —
						tudo em um painel multitenant com rotação automática de chaves.
					</p>
					<div className="flex items-center justify-center gap-3 flex-wrap">
						<Button size="lg" asChild>
							<Link href="/auth/sign-in">
								Começar agora
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
						<Button size="lg" variant="outline" asChild>
							<a href={GITHUB_ORG_URL} target="_blank" rel="noopener noreferrer">
								<FaGithub className="h-4 w-4" />
								Ver no GitHub
							</a>
						</Button>
					</div>
				</section>

				{/* Features */}
				<section className="container mx-auto max-w-6xl px-4 sm:px-6 py-12">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{features.map((feature) => (
							<Card key={feature.title} className="p-6">
								<feature.icon className="h-6 w-6 text-primary mb-4" />
								<h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
							</Card>
						))}
					</div>
				</section>

				{/* Quickstart / Tutorial */}
				<section className="container mx-auto max-w-3xl px-4 sm:px-6 py-20">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-foreground mb-3">Comece em 3 passos</h2>
						<p className="text-muted-foreground">
							Envie seu primeiro e-mail transacional em poucos minutos com o SDK oficial.
						</p>
					</div>

					<div className="flex flex-col gap-10">
						<div>
							<h3 className="font-semibold text-foreground mb-3">1. Instale o SDK</h3>
							<CodeBlock code={quickstartInstall} lang="bash" />
						</div>

						<div>
							<h3 className="font-semibold text-foreground mb-3">2. Inicialize o client</h3>
							<p className="text-sm text-muted-foreground mb-3">
								Crie um serviço no painel para gerar sua primeira API Key (formato{' '}
								<code className="rounded bg-muted px-1.5 py-0.5 text-xs">hm_...</code>).
							</p>
							<CodeBlock code={quickstartInit} lang="typescript" filename="hermes.ts" />
						</div>

						<div>
							<h3 className="font-semibold text-foreground mb-3">3. Envie um e-mail</h3>
							<p className="text-sm text-muted-foreground mb-3">
								A interface encadeada (Builder Pattern) cobre templates MJML com variáveis dinâmicas,
								envio agendado e bulk.
							</p>
							<CodeBlock code={quickstartSend} lang="typescript" />
						</div>
					</div>

					<div className="mt-12 text-center">
						<Button asChild>
							<Link href="/tutorial">
								Ver tutorial completo
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
					</div>
				</section>
			</main>

			<footer className="border-t py-8">
				<div className="container mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
					<span>Hermes — Gateway de e-mails transacionais open-source.</span>
					<div className="flex items-center gap-4">
						<a href={`${GITHUB_ORG_URL}/hermes-api`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
							hermes-api
						</a>
						<a href={`${GITHUB_ORG_URL}/hermes-front`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
							hermes-front
						</a>
						<a href={`${GITHUB_ORG_URL}/hermes-client`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
							hermes-client
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
