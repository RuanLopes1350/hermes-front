'use client';

import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';

export type SSEStatus = 'connecting' | 'connected' | 'disconnected';

interface UseSSEOptions<T> {
	enabled?: boolean;
	onMessage: (data: T) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1350';

// Hook genérico de consumo de SSE (EventSource) com reconexão via backoff exponencial
// (máx. 30s) e validação de payload via Zod. `path` é relativo à API (ex.: '/api/dashboard/stream').
export function useSSE<T>(
	path: string | null,
	schema: z.ZodType<T>,
	options: UseSSEOptions<T>,
): SSEStatus {
	const { enabled = true, onMessage } = options;
	const [status, setStatus] = useState<SSEStatus>('connecting');

	// Ref evita reabrir a conexão a cada render quando o caller passa um onMessage inline.
	const onMessageRef = useRef(onMessage);
	onMessageRef.current = onMessage;

	useEffect(() => {
		if (!enabled || !path) return;

		let currentEventSource: EventSource | undefined;
		let reconnectTimeout: NodeJS.Timeout;
		let retryDelay = 1000;

		const connect = () => {
			setStatus('connecting');
			currentEventSource = new EventSource(`${API_URL}${path}`, { withCredentials: true });

			currentEventSource.onopen = () => {
				setStatus('connected');
				retryDelay = 1000; // Reseta o delay ao conectar com sucesso
			};

			currentEventSource.onmessage = (event) => {
				try {
					const rawData = JSON.parse(event.data);
					const parsed = schema.parse(rawData);
					onMessageRef.current(parsed);
				} catch (e) {
					console.warn('[SSE] Evento malformado recebido, ignorando...', e);
				}
			};

			currentEventSource.onerror = () => {
				currentEventSource?.close();
				setStatus('disconnected');

				// Reconexão com backoff exponencial (máx 30s)
				clearTimeout(reconnectTimeout);
				reconnectTimeout = setTimeout(() => {
					retryDelay = Math.min(retryDelay * 2, 30000);
					connect();
				}, retryDelay);
			};
		};

		connect();

		return () => {
			currentEventSource?.close();
			clearTimeout(reconnectTimeout);
		};
	}, [enabled, path]);

	return status;
}
