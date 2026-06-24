'use server';

import { HermesClient, MemoryAdapter } from '@ruanlopes1350/hermes-client';

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
				Object.keys(params.templateVars).length > 0 ? params.templateVars : undefined
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
