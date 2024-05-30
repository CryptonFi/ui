import { FC, MouseEventHandler } from 'react';

interface ButtonProps {
    title: string;
    className?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
}

const Button: FC<ButtonProps> = ({ title, className, onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded ${className} disabled:bg-gray-300 disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed`}
            disabled={disabled}
        >
            {title}
        </button>
    );
};

export default Button;
