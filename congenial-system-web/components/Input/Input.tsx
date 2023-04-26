import React from 'react';
import classNames from 'classnames';

type InputProps = {
    label?: string
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    className?: string;
}

function Input(props: InputProps) {
    return (
        <div className="flex flex-col space-y-1" >
            {props.label && (
                <h3 className='text-xs font-medium text-white'>{props.label}</h3>
            )}
            <input
                value={props.value}
                onChange={props.onChange}
                type="text"
                placeholder={props.placeholder}
                className={
                    classNames(
                        "flex-1 block text-sm rounded px-4 py-3 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition transform ease-in-out duration-500 bg-[#1c2943] text-white border-[1px] border-indigo-600",
                        props.className
                    )
                }
            />
        </div>
    );
}

export default Input;