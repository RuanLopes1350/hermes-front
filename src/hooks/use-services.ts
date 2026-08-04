import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/src/lib/api';
import { useToast } from '@/src/hooks/use-toast';
import { Service } from '@/src/types';

export function useServices() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const { data: services = [], isLoading: loading, refetch: fetchServices } = useQuery({
		queryKey: ['services'],
		queryFn: async () => {
			const response = await apiFetch('/api/services');
			const result = await response.json();
			if (!response.ok || result.error) {
				toast({
					variant: 'destructive',
					title: 'Erro',
					description: result.message || 'Falha ao carregar serviços.',
				});
				throw new Error(result.message || 'Falha ao carregar serviços.');
			}
			return (result.data as Service[]) || [];
		},
		staleTime: 30_000,
	});

	const saveMutation = useMutation({
		mutationFn: async ({ serviceName, editingId }: { serviceName: string; editingId?: string }) => {
			if (!serviceName.trim()) throw new Error('Nome inválido');
			const endpoint = editingId ? `/api/services/${editingId}` : '/api/services';
			const method = editingId ? 'PATCH' : 'POST';

			const response = await apiFetch(endpoint, {
				method,
				body: JSON.stringify({ name: serviceName }),
			});
			const result = await response.json();
			if (!response.ok || result.error) {
				throw new Error(result.message || 'Falha ao salvar.');
			}
			return result;
		},
		onSuccess: (data, variables) => {
			toast({ title: variables.editingId ? 'Atualizado' : 'Criado', description: `Serviço salvo.` });
			queryClient.invalidateQueries({ queryKey: ['services'] });
		},
		onError: (error) => {
			toast({ variant: 'destructive', title: 'Erro', description: error.message || 'Erro de rede.' });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const response = await apiFetch(`/api/services/${id}`, { method: 'DELETE' });
			const result = await response.json();
			if (!response.ok || result.error) {
				throw new Error(result.message || 'Falha ao excluir.');
			}
			return id;
		},
		onSuccess: () => {
			toast({ title: 'Excluído', description: `Serviço removido.` });
			queryClient.invalidateQueries({ queryKey: ['services'] });
		},
		onError: (error) => {
			toast({ variant: 'destructive', title: 'Erro', description: error.message || 'Erro de rede.' });
		},
	});

	// Wrapper para manter a mesma assinatura retornada antes
	const saveService = async (serviceName: string, editingId?: string) => {
		if (!serviceName.trim()) return false;
		try {
			await saveMutation.mutateAsync({ serviceName, editingId });
			return true;
		} catch (e) {
			return false;
		}
	};

	const deleteService = async (id: string) => {
		try {
			await deleteMutation.mutateAsync(id);
			return true;
		} catch (e) {
			return false;
		}
	};

	return {
		services,
		loading,
		processing: saveMutation.isPending || deleteMutation.isPending,
		fetchServices,
		saveService,
		deleteService,
	};
}
