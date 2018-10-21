import * as React from "react";

export type Validator<T> = (value: T) => string | null;
export type ChangeHandler<T> = (id: string, value: T) => void;

export interface RPEInputProps<T> {
    id: string;
    label: string;
    value: T;
    validator: Validator<T>;
    onChange: ChangeHandler<T>;

    className?: string;

    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export function RPEInput<T extends string | number | string[]>(props: RPEInputProps<T>) {

    const validationError = props.validator(props.value);

    const handleChange = (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

        const input: HTMLInputElement | HTMLSelectElement = ev.target;

        props.onChange(props.id, input.value as T);
    };

    return <div className={`input-row given-weight ${validationError ? "error" : ""} ${props.className || ""}`}>
        <div className="error">{validationError}</div>
        <div className="input-container">
            <label htmlFor={props.id}> {props.label} </label>
            <input id={props.id}{...props.inputProps} value={props.value} onChange={handleChange}/>
        </div>
    </div>
}