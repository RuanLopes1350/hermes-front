'use client';

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Option {
	value: string;
	label: string | React.ReactNode;
}

interface CustomSelectProps {
	value: string;
	onValueChange: (value: string) => void;
	options: Option[];
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export function CustomSelect({
	value,
	onValueChange,
	options,
	placeholder = 'Selecione uma opção...',
	className,
	disabled = false,
}: CustomSelectProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const containerRef = React.useRef<HTMLDivElement>(null);

	const selectedOption = options.find((opt) => opt.value === value);

	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<div className={cn('relative w-full', className)} ref={containerRef}>
			<button
				type="button"
				disabled={disabled}
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					'flex h-14 w-full items-center justify-between rounded-2xl border border-border-subtle bg-background px-6 py-4 text-base font-medium italic transition-all focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
					isOpen && 'border-primary ring-1 ring-primary',
				)}
			>
				<span className={cn('truncate', !selectedOption && 'text-muted-foreground')}>
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<ChevronDown
					className={cn(
						'h-4 w-4 text-muted-foreground transition-transform duration-200',
						isOpen && 'rotate-180',
					)}
				/>
			</button>

			{isOpen && (
				<div className="absolute z-[100] mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-border-subtle bg-surface p-2 shadow-2xl animate-in fade-in zoom-in duration-200">
					<div className="space-y-1">
						{options.length === 0 ? (
							<div className="px-4 py-3 text-sm italic text-muted-foreground">
								Nenhuma opção disponível.
							</div>
						) : (
							options.map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() => {
										onValueChange(option.value);
										setIsOpen(false);
									}}
									className={cn(
										'flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5',
										value === option.value ? 'bg-primary/10 text-primary' : 'text-foreground',
									)}
								>
									<span className="truncate">{option.label}</span>
									{value === option.value && <Check className="h-4 w-4" />}
								</button>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}
