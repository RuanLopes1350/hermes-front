interface InputProps {
	type?: string;
	label?: string;
	labelColor?: string;
	secondaryLabel?: string | React.ReactNode;
	secondaryLabelColor?: string;
	placeholder?: string;
	value?: string;
	containerClassName?: string;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
	type = 'text',
	label,
	labelColor = 'text-text-secondary',
	secondaryLabel,
	secondaryLabelColor = 'text-primary',
	placeholder,
	value,
	onChange,
	containerClassName = 'w-full',
}: InputProps) {
	return (
		<div className={`flex flex-col gap-2 ${containerClassName}`}>
			<div className="flex flex-row justify-between items-center px-1">
				{label && (
					<p className={`text-[10px] font-bold uppercase tracking-widest ${labelColor}`}>{label}</p>
				)}
				{secondaryLabel && (
					<div className={`text-[10px] font-bold uppercase tracking-widest ${secondaryLabelColor}`}>
						{secondaryLabel}
					</div>
				)}
			</div>
			<input
				type={type}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				className="bg-background text-text-primary w-full h-12 px-4 py-2 border border-border-subtle rounded-xl placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
			/>
		</div>
	);
}
