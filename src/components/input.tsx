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

export default function Input({ type = "text", label, labelColor, secondaryLabel, secondaryLabelColor, placeholder, value, onChange, containerClassName = "w-full" }: InputProps) {
    return (
        <div className={`flex flex-col gap-2 ${containerClassName}`}>
            <div className="flex flex-row justify-between">
                {label && <p className={`font-medium ${labelColor}`}>{label}</p>}
                {secondaryLabel && <p className={`text-ls ${secondaryLabelColor}`}>{secondaryLabel}</p>}
            </div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="text-[#a1a1aa] w-full h-14 px-4 py-2 border border-[#252428] rounded-2xl placeholder:text-[#52525B] focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent"
            />
        </div>
    );
}