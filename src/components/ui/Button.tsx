import { FC, MouseEventHandler } from 'react';

interface ButtonProps {
    title: string;
    className?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

const Button: FC<ButtonProps> = ({ title, className, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded ${className}`}
        >
            {title}
        </button>
    );
};

export default Button;
