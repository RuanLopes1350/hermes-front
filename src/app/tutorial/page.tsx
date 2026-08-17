import Link from 'next/link';
import type { Metadata } from 'next';
import { AlertTriangle, ArrowRight } from 'lucide-react';

import LogoPrimarioClaro from '@/public/hermes-primario.svg';
import LogoPrimarioEscuro from '@/public/hermes-escuro.svg';
import { Button } from '@/src/components/ui/button';
import { ThemeToggle } from '@/src/components/theme-toggle';
import { CodeBlock } from '@/src/components/code-block';

export const metadata: Metadata = {
	title: 'Tutorial',
	description:
		'Guia passo a passo: do cadastro no Hermes ao primeiro e-mail transacional enviado pela sua aplicação.',
};

const toc = [
	{ id: 'conta', label: '1. Crie sua conta' },
	{ id: 'servico', label: '2. Crie um serviço' },
	{ id: 'conexao', label: '3. Conexão e API Key' },
	{ id: 'sdk', label: '4. Instale o SDK' },
	{ id: 'env', label: '5. Variáveis de ambiente' },
	{ id: 'cliente', label: '6. Crie o client' },
	{ id: 'gatilhos', label: '7. Onde disparar e-mails' },
	{ id: 'webhook', label: '8. Rotação de chaves (opcional)' },
	{ id: 'templates', label: '9. Crie seus templates' },
	{ id: 'uso-templates', label: '10. Use os templates' },
	{ id: 'envio', label: '11. Envie de verdade' },
	{ id: 'limites', label: '12. Limites de envio' },
];

function Step({
	number,
	id,
	title,
	children,
}: {
	number: number;
	id: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section id={id} className="scroll-mt-24 py-10 border-b last:border-b-0">
			<div className="flex items-center gap-3 mb-5">
				<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
					{number}
				</span>
				<h2 className="text-2xl font-bold text-foreground text-balance">{title}</h2>
			</div>
			<div className="pl-11 flex flex-col gap-4 text-muted-foreground [&_strong]:text-foreground">
				{children}
			</div>
		</section>
	);
}

const envExample = `HERMES_API_URL=https://sua-instancia-hermes.com
HERMES_API_KEY=hm_sua_chave_gerada_no_passo_3`;

const manualHttpExample = `// Alternativa sem o SDK: chamando a API REST diretamente
await fetch(\`\${process.env.HERMES_API_URL}/api/emails\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.HERMES_API_KEY!,
  },
  body: JSON.stringify({
    to: 'cliente@empresa.com',
    subject: 'Bem-vindo!',
    template_id: 'uuid-do-template',
    variables: { nome: 'João da Silva' },
  }),
});`;

const clientEnvAdapter = `import { HermesClient } from '@ruanlopes1350/hermes-client';
import { EnvAdapter } from '@ruanlopes1350/hermes-client/node';

export const hermes = new HermesClient({
  baseUrl: process.env.HERMES_API_URL!,
  // Lê e mantém HERMES_API_KEY sincronizada no .env quando a rotação acontecer
  storageAdapter: new EnvAdapter('.env', 'HERMES_API_KEY'),
});`;

const triggerSignup = `// src/routes/auth/signup.ts
import { hermes } from '../lib/hermes';

export async function onUserSignUp(user: { name: string; email: string }) {
  await hermes.email()
    .to(user.email)
    .subject('Bem-vindo!')
    .useTemplate('boas-vindas-tpl', { nome: user.name })
    .send();
}`;

const triggerPasswordReset = `// src/routes/auth/forgot-password.ts
await hermes.email()
  .to(user.email)
  .subject('Redefinição de senha')
  .useTemplate('recuperacao-senha-tpl', { resetLink })
  .priority('high')
  .send();`;

const webhookRoute = `// src/routes/webhook-hermes.ts (Express)
import express from 'express';
import { expressWebhookHandler } from '@ruanlopes1350/hermes-client/express';
import { hermes } from '../lib/hermes';

app.post(
  '/webhook/hermes',
  express.raw({ type: 'application/json' }),
  expressWebhookHandler(hermes, process.env.HERMES_WEBHOOK_SECRET!),
);`;

const templateUsage = `import { templateHelpers } from '@ruanlopes1350/hermes-client';

await hermes.email()
  .to('cliente@empresa.com')
  .subject('Pedido confirmado')
  .useTemplate('order-confirmation', {
    greeting:  templateHelpers.greeting('João'),
    orderDate: templateHelpers.formatDate(new Date()),
    total:     templateHelpers.formatCurrency(149.90),
  })
  .send();`;

const sendExamples = `// Envio simples
await hermes.email().to('a@b.com').subject('Oi').body('<p>Olá!</p>').send();

// Agendado
await hermes.email()
  .to('a@b.com').subject('Lembrete')
  .useTemplate('lembrete-tpl')
  .schedule(new Date('2026-09-01T09:00:00Z'))
  .send();

// Em massa (até 100 por chamada)
await hermes.bulk()
  .email().to('a@b.com').subject('Oi').useTemplate('tpl', { nome: 'A' }).done()
  .email().to('c@d.com').subject('Oi').useTemplate('tpl', { nome: 'C' }).done()
  .send();`;

export default function TutorialPage() {
	return (
		<div className="min-h-screen bg-background flex flex-col">
			<header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur">
				<div className="container mx-auto max-w-5xl flex h-16 items-center justify-between px-4 sm:px-6">
					<Link href="/" className="flex items-center">
						<LogoPrimarioClaro className="block dark:hidden w-32 h-16" />
						<LogoPrimarioEscuro className="hidden dark:block w-32 h-16" />
					</Link>
					<div className="flex items-center gap-2">
						<ThemeToggle />
						<Button asChild>
							<Link href="/auth/sign-in">Entrar</Link>
						</Button>
					</div>
				</div>
			</header>

			<main className="flex-1">
				<div className="container mx-auto max-w-5xl px-4 sm:px-6 py-14">
					<div className="mb-14 text-center max-w-2xl mx-auto">
						<h1 className="text-4xl font-bold text-foreground mb-4 text-balance">
							Do cadastro ao primeiro envio
						</h1>
						<p className="text-lg text-muted-foreground text-balance">
							Guia completo: crie sua conta, configure um serviço, gere uma API Key, monte seus
							templates e dispare seus primeiros e-mails transacionais.
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
						<nav className="hidden lg:block">
							<div className="sticky top-24 flex flex-col gap-1 text-sm">
								{toc.map((item) => (
									<a
										key={item.id}
										href={`#${item.id}`}
										className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
									>
										{item.label}
									</a>
								))}
							</div>
						</nav>

						<div className="min-w-0">
							<Step number={1} id="conta" title="Crie sua conta">
								<p>
									Acesse{' '}
									<Link href="/auth/sign-up" className="text-primary hover:underline">
										/auth/sign-up
									</Link>{' '}
									e crie sua conta com e-mail e senha, ou entre direto com{' '}
									<strong>Google</strong> ou <strong>GitHub</strong>. Essa conta é para você (ou seu
									time) acessar o painel do Hermes — não tem relação com os usuários da sua
									aplicação.
								</p>
							</Step>

							<Step number={2} id="servico" title="Crie um serviço">
								<p>
									Um <strong>serviço</strong> é um namespace isolado: cada aplicação/produto seu
									deve ter o seu próprio, com credenciais, templates e configurações separadas. Em{' '}
									<strong>Serviços → Novo Serviço</strong>, dê um nome (ex: &quot;App Principal&quot;,
									&quot;Landing de Marketing&quot;) e confirme.
								</p>
							</Step>

							<Step number={3} id="conexao" title="Cadastre uma conexão e gere sua API Key">
								<p>
									Dentro do serviço, vá em <strong>Credenciais de Disparo → Nova Conexão</strong> e
									escolha como o Hermes vai enviar os e-mails de fato:
								</p>
								<ul className="list-disc pl-5 space-y-1">
									<li>
										<strong>SMTP Padrão</strong> — host, porta e SSL/TLS de qualquer provedor
										(Gmail, SES, SendGrid, seu próprio servidor de e-mail, etc).
									</li>
									<li>
										<strong>Google OAuth2</strong> — autorização segura via conta Google, sem
										expor senha/app password.
									</li>
								</ul>
								<p>
									Ao salvar, a <strong>API Key</strong> (formato <code className="rounded bg-muted px-1.5 py-0.5 text-xs">hm_...</code>)
									aparece <strong>uma única vez</strong>. Copie e guarde agora — o Hermes armazena só
									o hash dela e não consegue mostrá-la de novo (só rotacionar e gerar uma nova).
								</p>
							</Step>

							<Step number={4} id="sdk" title="Instale o SDK (opcional, mas recomendado)">
								<p>
									O SDK cuida de retry, streaming de status e rotação automática de chave pra
									você. Se preferir não adicionar a dependência, dá pra chamar a API REST direto.
								</p>
								<CodeBlock code="npm install @ruanlopes1350/hermes-client" lang="bash" />
								<p className="text-sm">Sem o SDK, o mesmo envio fica assim:</p>
								<CodeBlock code={manualHttpExample} lang="typescript" />
							</Step>

							<Step number={5} id="env" title="Configure as variáveis de ambiente">
								<p>
									Guarde a URL da sua instância do Hermes e a API Key gerada no passo 3 como
									variáveis de ambiente — nunca direto no código:
								</p>
								<CodeBlock code={envExample} lang="bash" filename=".env" />
							</Step>

							<Step number={6} id="cliente" title="Crie o client na sua aplicação">
								<p>
									Instancie o <code className="rounded bg-muted px-1.5 py-0.5 text-xs">HermesClient</code>{' '}
									uma única vez e reexporte. Em produção (VPS/servidor com processo persistente),
									use o <strong>EnvAdapter</strong>: se a chave rotacionar via webhook (passo 8), ele
									atualiza o <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.env</code> sozinho.
								</p>
								<CodeBlock code={clientEnvAdapter} lang="typescript" filename="lib/hermes.ts" />
							</Step>

							<Step number={7} id="gatilhos" title="Decida onde disparar os e-mails">
								<p>
									Chame <code className="rounded bg-muted px-1.5 py-0.5 text-xs">hermes.email()</code>{' '}
									nos pontos de negócio da sua aplicação onde um e-mail deve sair — cadastro de
									usuário, recuperação de senha, confirmação de pedido, alertas, etc:
								</p>
								<CodeBlock code={triggerSignup} lang="typescript" filename="signup.ts" />
								<CodeBlock code={triggerPasswordReset} lang="typescript" filename="forgot-password.ts" />
							</Step>

							<Step number={8} id="webhook" title="(Opcional) Ative a rotação automática de chaves">
								<p>
									Se você configurou <strong>Intervalo de Validade da Chave</strong>, a API Key
									expira e precisa ser trocada periodicamente. Pra sua aplicação não quebrar
									quando isso acontecer, receba o aviso via webhook:
								</p>
								<p className="text-sm font-medium text-foreground">a) Crie a rota que recebe o aviso</p>
								<CodeBlock code={webhookRoute} lang="typescript" />
								<p className="text-sm font-medium text-foreground">
									b) Cadastre o endpoint no Hermes
								</p>
								<p>
									Em <strong>Serviço → Configurações → Rotação de Chaves e Webhooks</strong>,
									preencha:
								</p>
								<ul className="list-disc pl-5 space-y-1">
									<li>
										<strong>URL do Webhook</strong> — a rota pública que você acabou de criar.
									</li>
									<li>
										<strong>Segredo do Webhook</strong> — usado pra assinar o header{' '}
										<code className="rounded bg-muted px-1.5 py-0.5 text-xs">X-Hermes-Signature</code>{' '}
										(mesmo valor de <code className="rounded bg-muted px-1.5 py-0.5 text-xs">HERMES_WEBHOOK_SECRET</code>{' '}
										acima).
									</li>
									<li>
										<strong>Ativar Rotação Automática de API Keys</strong> — liga o processo.
									</li>
									<li>
										<strong>Dias de antecedência para rotacionar (Threshold)</strong> — quantos
										dias antes do vencimento a nova chave é gerada e o webhook disparado.
									</li>
								</ul>
							</Step>

							<Step number={9} id="templates" title="Crie seus templates MJML">
								<p>
									Em <strong>Templates → Novo Template</strong>, escolha um{' '}
									<strong>Escopo de Uso</strong>: <em>🌍 Global</em> (disponível pra todos os
									serviços) ou vinculado a um serviço específico. No editor, escreva o layout em
									MJML — toda variável no formato{' '}
									<code className="rounded bg-muted px-1.5 py-0.5 text-xs">{'{{assim}}'}</code> é
									detectada automaticamente e listada em <strong>Variáveis Detectadas</strong>, sem
									precisar declarar nada à parte. O preview ao vivo mostra o resultado enquanto
									você edita.
								</p>
							</Step>

							<Step number={10} id="uso-templates" title="Use os templates na sua aplicação">
								<p>
									Passe o <code className="rounded bg-muted px-1.5 py-0.5 text-xs">id</code> do
									template e um objeto com os valores de cada variável detectada. O SDK também traz
									helpers prontos pra formatação comum (saudação, data, moeda):
								</p>
								<CodeBlock code={templateUsage} lang="typescript" />
							</Step>

							<Step number={11} id="envio" title="Realize os envios">
								<p>Com tudo configurado, os três padrões de envio do dia a dia:</p>
								<CodeBlock code={sendExamples} lang="typescript" />
							</Step>

							<Step number={12} id="limites" title="Atenção aos limites de envio dos provedores">
								<div className="rounded-lg border border-warning/30 bg-warning/10 p-5 flex gap-3">
									<AlertTriangle className="h-5 w-5 shrink-0 text-warning mt-0.5" />
									<div className="space-y-3 text-sm">
										<p>
											O Hermes <strong>não contorna</strong> os limites de envio do provedor por
											trás da sua conexão (passo 3) — ele só repassa a requisição. Os tetos são
											impostos pelo próprio Gmail/Google Workspace/SMTP e valem por{' '}
											<strong>conta ou domínio remetente</strong>, não por aplicação:
										</p>
										<ul className="list-disc pl-5 space-y-1">
											<li>
												<strong>Conta Gmail pessoal</strong> (SMTP ou OAuth2): ~500 e-mails/dia e
												~100 destinatários por mensagem.
											</li>
											<li>
												<strong>Google Workspace</strong>: ~2.000 e-mails/dia por usuário (varia
												conforme o plano contratado).
											</li>
											<li>
												Ultrapassar o limite costuma resultar em bloqueio temporário de envio ou
												marcação como spam pelo provedor — não é um erro do Hermes.
											</li>
											<li>
												Para volumes maiores ou transacionais críticos, prefira um provedor SMTP
												dedicado (Amazon SES, SendGrid, Mailgun, Postmark, etc.) em vez de uma
												conta Gmail pessoal como conexão.
											</li>
										</ul>
										<p className="text-xs text-muted-foreground">
											Esses números são os publicados pelo Google e podem mudar — confirme sempre
											na documentação oficial do provedor escolhido antes de dimensionar volume.
										</p>
									</div>
								</div>
							</Step>
						</div>
					</div>

					<div className="mt-16 text-center">
						<Button size="lg" asChild>
							<Link href="/auth/sign-up">
								Criar minha conta e começar
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
					</div>
				</div>
			</main>
		</div>
	);
}
