import { authClient } from "./auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1350";

// Utilitário de fetch customizado para a Hermes API.
// Resolve automaticamente a URL base e anexa os headers de autenticação/cookies.

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    // Garante que o endpoint comece com /
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_URL}${path}`;

    const defaultOptions: RequestInit = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        // 'include' é vital para que os cookies de sessão do better-auth sejam enviados
        credentials: "include", 
    };

    const response = await fetch(url, defaultOptions);

    if (response.status === 401) {
        // Se houver erro de auth, poderíamos redirecionar para o login aqui
        console.warn("Sessão expirada ou inválida.");
    }

    return response;
}
