interface ButtonProps {
    label?: string;
    labelIcon?: string;
    containerClassName?: string;
    onClick?: () => void;
}

export default function Button({ label, labelIcon, containerClassName, onClick }: ButtonProps) {
    return (
        <button
            className={`cursor-pointer h-14 px-4 py-2 bg-[#1f1f22] text-[#f9f5f8] font-medium rounded-2xl hover:bg-[#2a2a2e] border border-[#252428] ${containerClassName}`}
            onClick={onClick}
        >
            {labelIcon && <span className="mr-2">{labelIcon}</span>}
            {label}
        </button>
    );
}