interface ButtonInputProps {
    label?: string;
    labelIcon?: string | React.ReactNode;
    containerClassName?: string;
    onClick?: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

export default function ButtonInput({ label, labelIcon, containerClassName, onClick, onKeyDown }: ButtonInputProps) {
    return (
        <button
            onClick={onClick}
            onKeyDown={onKeyDown}
            className={`w-full cursor-pointer bg-primary text-white font-bold h-12 px-6 rounded-xl flex items-center justify-center gap-2 uppercase text-xs tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all duration-300 ${containerClassName}`}
        >
            {label}
            {labelIcon && <span className="opacity-90">{labelIcon}</span>}
        </button>
    )
}