import { useState, useCallback } from 'react';
import { apiFetch } from '@/src/lib/api';
import { useToast } from '@/src/hooks/use-toast';
import { Service } from '@/src/types';

export function useServices() {
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState(false);
	const { toast } = useToast();

	const fetchServices = useCallback(async () => {
		setLoading(true);
		try {
			const response = await apiFetch('/api/services');
			const result = await response.json();
			if (response.ok && !result.error) {
				setServices(result.data || []);
			} else {
				toast({ variant: 'destructive', title: 'Erro', description: result.message || 'Falha ao carregar serviços.' });
			}
		} catch (err) {
			toast({ variant: 'destructive', title: 'Erro', description: 'Erro de rede.' });
		} finally {
			setLoading(false);
		}
	}, [toast]);

	const saveService = async (serviceName: string, editingId?: string) => {
		if (!serviceName.trim()) return false;
		setProcessing(true);
		try {
			const endpoint = editingId ? `/api/services/${editingId}` : '/api/services';
			const method = editingId ? 'PATCH' : 'POST';

			const response = await apiFetch(endpoint, {
				method,
				body: JSON.stringify({ name: serviceName }),
			});
			const result = await response.json();

			if (response.ok && !result.error) {
				toast({ title: editingId ? 'Atualizado' : 'Criado', description: `Serviço salvo.` });
				await fetchServices();
				return true;
			} else {
				toast({ variant: 'destructive', title: 'Erro', description: result.message || 'Falha ao salvar.' });
				return false;
			}
		} catch (err) {
			toast({ variant: 'destructive', title: 'Erro', description: 'Erro de rede.' });
			return false;
		} finally {
			setProcessing(false);
		}
	};

	const deleteService = async (id: string) => {
		try {
			const response = await apiFetch(`/api/services/${id}`, { method: 'DELETE' });
			const result = await response.json();

			if (response.ok && !result.error) {
				toast({ title: 'Excluído', description: `Serviço removido.` });
				setServices((prev) => prev.filter((s) => s.id !== id));
				return true;
			} else {
				toast({ variant: 'destructive', title: 'Erro', description: result.message || 'Falha ao excluir.' });
				return false;
			}
		} catch (err) {
			toast({ variant: 'destructive', title: 'Erro', description: 'Erro de rede.' });
			return false;
		}
	};

	return {
		services,
		loading,
		processing,
		fetchServices,
		saveService,
		deleteService,
	};
}
