import React from 'react';
import classNames from 'classnames';

type ButtonProps = {
    title?: string;
    onClick: (event: any) => void;
    className?: typeof classNames.arguments;
    naked?: boolean;
    icon?: React.ReactNode;
}

function Button({title, className, onClick, naked=false, icon, ...rest}: ButtonProps) {
    return (
        <button
            className={
                classNames(
                    "text-sm font-light text-white rounded px-4 py-2 transition transform ease-in-out duration-500 flex flex-1 items-center justify-center",
                    !naked && "hover:ring-2 hover:ring-indigo-600 hover:outline-none bg-[#1c2943] border-[1px] border-indigo-600",
                    naked && "hover:opacity-70",
                    className
                )
            }
            onClick={onClick}
            {...rest}
        >
            {icon}
            {title}
        </button>
    );
}

export default Button;