import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				// Área autenticada: não há nada pra indexar, e crawlers batendo em
				// rotas que sempre redirecionam pro login só desperdiçam crawl budget.
				disallow: ['/system/', '/auth/'],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
