import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
			<h1 className="text-6xl font-bold mb-4">404</h1>
			<p className="text-xl mb-8">Página não encontrada</p>
			<Link
				href="/system/dashboard"
				className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
			>
				Voltar ao Dashboard
			</Link>
		</div>
	);
}
