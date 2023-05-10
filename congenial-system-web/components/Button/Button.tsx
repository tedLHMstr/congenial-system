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
                    "text-sm font-normal text-white rounded px-4 py-2 transition transform ease-in-out duration-500 flex flex-1 items-center justify-center hover:scale-[1.03]",
                    !naked && "bg-gradient-to-r from-[#b84cc3] via-[#5932a6] to-[#4621db] border-[1px] border-indigo-600",
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