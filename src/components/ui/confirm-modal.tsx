'use client';

import * as React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void> | void;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	variant?: 'danger' | 'primary';
}

export function ConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmText = 'Confirmar',
	cancelText = 'Cancelar',
	variant = 'primary',
}: ConfirmModalProps) {
	const [loading, setLoading] = React.useState(false);

	const handleConfirm = async () => {
		try {
			setLoading(true);
			await onConfirm();
			onClose();
		} catch (error) {
			console.error('Erro na confirmação:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
			<DialogContent className="bg-surface border-border-subtle rounded-4xl max-w-md p-0 overflow-hidden shadow-2xl">
				<DialogHeader className="p-8 bg-background/30 text-center border-b border-border-subtle">
					<div
						className={cn(
							'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4',
							variant === 'danger' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary',
						)}
					>
						<AlertTriangle size={32} />
					</div>
					<DialogTitle className="text-xl font-bold italic uppercase tracking-tight text-foreground">
						{title}
					</DialogTitle>
					<DialogDescription className="text-muted-foreground text-sm mt-2 italic px-4">
						{description}
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className="p-8 bg-background/30 flex flex-col gap-3 sm:flex-col">
					<Button
						onClick={handleConfirm}
						disabled={loading}
						className={cn(
							'w-full py-6 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg transition-all cursor-pointer',
							variant === 'danger'
								? 'bg-danger text-white hover:bg-danger/90 shadow-danger/20'
								: 'bg-primary text-white hover:bg-primary-hover shadow-primary/20',
						)}
					>
						{loading ? <Loader2 className="animate-spin" size={18} /> : confirmText}
					</Button>
					<Button
						variant="ghost"
						onClick={onClose}
						disabled={loading}
						className="cursor-pointer w-full py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
					>
						{cancelText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
