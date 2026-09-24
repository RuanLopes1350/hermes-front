'use server';

import { HermesClient, MemoryAdapter } from '@ruanlopes1350/hermes-client';
import dns from 'node:dns/promises';

export async function sendHermesEmailAction(params: {
	baseUrl: string;
	apiKey: string;
	recipientTo: string;
	subject: string;
	selectedTemplateId: string;
	body: string;
	templateVars: Record<string, string>;
}) {
	try {
		// Inicializa o cliente Hermes com a chave inserida pelo usuário
		const hermes = new HermesClient({
			baseUrl: params.baseUrl,
			storageAdapter: new MemoryAdapter(params.apiKey),
		});

		const emailBuilder = hermes.email().to(params.recipientTo).subject(params.subject);

		if (params.selectedTemplateId !== 'none') {
			emailBuilder.useTemplate(
				params.selectedTemplateId,
				Object.keys(params.templateVars).length > 0 ? params.templateVars : undefined,
			);
		} else {
			emailBuilder.body(params.body);
		}

		// Executa o envio através do SDK no servidor
		const result = await emailBuilder.send();

		return { success: true, data: result };
	} catch (error: any) {
		return {
			success: false,
			error: error.response?.data || error.message || String(error),
		};
	}
}

/** Resolve MX usando a API de DNS nativa do Node.js. Distingue os dois casos de falha. */
async function resolveMxDomain(domain: string): Promise<{ valid: boolean; reason?: string }> {
	try {
		const records = await dns.resolveMx(domain);
		if (!records || records.length === 0) {
			return {
				valid: false,
				reason: `O domínio "${domain}" existe, mas não possui servidores de e-mail (registros MX) configurados.`,
			};
		}
		return { valid: true };
	} catch (err: any) {
		if (err.code === 'ENOTFOUND') {
			return {
				valid: false,
				reason: `O domínio "${domain}" não existe no DNS (servidor de e-mail inexistente).`,
			};
		}
		if (err.code === 'ENODATA') {
			return {
				valid: false,
				reason: `O domínio "${domain}" existe, mas não possui registros MX (servidores de e-mail).`,
			};
		}
		if (err.code === 'ETIMEOUT') {
			return {
				valid: false,
				reason: `Tempo limite esgotado ao consultar o DNS do domínio "${domain}".`,
			};
		}
		return { valid: false, reason: `Não foi possível verificar o domínio "${domain}".` };
	}
}

/**
 * Server Action: Verifica se o domínio do e-mail informado possui registros MX válidos.
 * Chamada pelo frontend enquanto o usuário digita, para feedback visual imediato.
 */
export async function checkEmailDomainAction(email: string): Promise<{
	valid: boolean;
	reason?: string;
}> {
	if (!email || !email.includes('@')) {
		return { valid: false, reason: 'Formato de e-mail incompleto.' };
	}

	const domain = email.split('@')[1]?.toLowerCase().trim();
	if (!domain) {
		return { valid: false, reason: 'Domínio inválido.' };
	}

	return await resolveMxDomain(domain);
}
