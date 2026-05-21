interface ButtonProps {
	label?: string;
	labelIcon?: string | React.ReactNode;
	containerClassName?: string;
	variant?: 'primary' | 'secondary' | 'outline' | 'danger';
	onClick?: () => void;
	disabled?: boolean;
}

export default function Button({
	label,
	labelIcon,
	containerClassName = '',
	variant = 'secondary',
	onClick,
	disabled = false,
}: ButtonProps) {
	const variants = {
		primary: 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20',
		secondary: 'bg-surface text-text-primary border border-border-subtle hover:bg-white/5',
		outline: 'bg-transparent text-text-primary border border-border-subtle hover:bg-white/5',
		danger: 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger hover:text-white',
	};

	return (
		<button
			className={`flex flex-row items-center gap-2.5 justify-center cursor-pointer h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 ${variants[variant]} ${containerClassName} ${
				disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
			}`}
			onClick={onClick}
			disabled={disabled}
		>
			{labelIcon && (
				<span className="opacity-80 group-hover:scale-110 transition-transform">{labelIcon}</span>
			)}
			{label}
		</button>
	);
}
