import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/src/components/ui/toaster';
import { ThemeProvider } from '@/src/components/theme-provider';
import { QueryProvider } from '@/src/components/query-provider';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: {
		template: '%s | Hermes',
		default: 'Hermes | Transactional Email Gateway',
	},
	description:
		'Gateway de e-mails transacionais open-source. Gerencie credenciais SMTP, Google OAuth2, templates em MJML e audite envios em tempo real.',
	keywords: [
		'transactional email',
		'email gateway',
		'microservices',
		'mjml',
		'smtp',
		'oauth2',
		'hermes',
	],
	authors: [{ name: 'Ruan Lopes' }],
	openGraph: {
		title: 'Hermes | Transactional Email Gateway',
		description:
			'Plataforma multitenant para o envio, gerenciamento e auditoria de e-mails transacionais.',
		type: 'website',
		siteName: 'Hermes Gateway',
	},
	icons: '/hermes-icon.svg',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="pt-BR"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<body className="min-h-full flex flex-col bg-background selection:bg-primary/30">
				<QueryProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{children}
						<Toaster />
					</ThemeProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
