interface ButtonInputProps {
    label?: string;
    labelIcon?: string | React.ReactNode;
    containerClassName?: string;
    onClick?: () => void;
}

export default function ButtonInput({ label, labelIcon, containerClassName, onClick }: ButtonInputProps) {
    return (
        <div>
            <button onClick={onClick} className={`cursor-pointer bg-linear-to-r from-[#BE9DFF] to-[#8B4EF7] text-[#3d0088] font-bold py-2 px-4 rounded-2xl flex items-center justify-center ${containerClassName}`}>
                {label}
                {labelIcon && <span className="ml-2">{labelIcon}</span>}
            </button>
        </div>
    )
}