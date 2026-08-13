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
	metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
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
		'email marketing',
		'webhook',
	],
	authors: [{ name: 'Ruan Lopes' }],
	creator: 'Ruan Lopes',
	publisher: 'Hermes',
	openGraph: {
		title: 'Hermes | Transactional Email Gateway',
		description:
			'Plataforma multitenant para o envio, gerenciamento e auditoria de e-mails transacionais.',
		type: 'website',
		siteName: 'Hermes Gateway',
		url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
		locale: 'pt_BR',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Hermes | Transactional Email Gateway',
		description: 'O Gateway open-source definitivo para gerenciar seus e-mails transacionais com SMTP e OAuth2.',
		creator: '@ruanlopes1350',
	},
	icons: {
		icon: [
			{ url: '/favicon.ico', sizes: 'any' },
			{ url: '/hermes-icone-app.svg?v=2', type: 'image/svg+xml' },
			{ url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
			{ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
		],
		shortcut: '/favicon.ico',
		apple: '/apple-touch-icon.png',
	},
	manifest: '/site.webmanifest',
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
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
