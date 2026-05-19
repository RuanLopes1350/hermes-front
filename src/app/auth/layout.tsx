import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Hermes | Autenticação',
};

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<main className="flex flex-1 flex-col items-center justify-center p-6 w-full">{children}</main>
	);
}
