import React from 'react';
import classNames from 'classnames';

type ButtonProps = {
    title: string;
    onClick: () => void;
    className?: typeof classNames.arguments;
}

function Button({title, className, onClick, ...rest}: ButtonProps) {
    return (
        <button
            className={
                classNames(
                    "text-sm font-light text-white rounded px-4 py-2 hover:ring-2 hover:ring-indigo-600 hover:outline-none transition transform ease-in-out duration-500 bg-[#1c2943] border-[1px] border-indigo-600",
                    className
                )
            }
            onClick={onClick}
            {...rest}
        >
            {title}
        </button>
    );
}

export default Button;