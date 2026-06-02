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
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<div className="flex items-center gap-4 mb-2">
						<div
							className={cn(
								'flex h-10 w-10 items-center justify-center rounded-full',
								variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary',
							)}
						>
							<AlertTriangle className="h-5 w-5" />
						</div>
						<DialogTitle>{title}</DialogTitle>
					</div>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				<DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
					<Button
						variant="outline"
						onClick={onClose}
						disabled={loading}
						className="cursor-pointer"
					>
						{cancelText}
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={loading}
						variant={variant === 'danger' ? 'destructive' : 'default'}
						className="cursor-pointer"
					>
						{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
						{confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
