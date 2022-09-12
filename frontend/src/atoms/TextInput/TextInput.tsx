import classNames from "@/helpers/classNames";
import type { ChangeEvent } from "react";

interface TextInputProps {
  /**
   * Label to display in the text input
   */
  label?: string;
  /**
   * Input type of the text input
   */
  type?: "text" | "number" | "email" | "password";
  /**
   * Should the input be fully rounded?
   */
  pill?: boolean;
  /**
   * Classname to apply to the div
   */
  className?: string;
  /**
   * ID of the input element
   */
  id?: string;
  /**
   * Name of the input element
   */
  name?: string;
  /**
   * Autocomplete property for the input element
   */
  autoComplete?: string;
  /**
   * Is the input required?
   */
  required?: boolean;
  /**
   * Is the input disabled?
   */
  disabled?: boolean;
  /**
   * Value of the text input
   */
  value?: string | number;
  /**
   * Default value of the text input
   */
  defaultValue?: string | number;
  /**
   * Function to call when the input changes
   */
  onChange?(event: ChangeEvent<HTMLInputElement>): void;
  /**
   * Function to call when the input is blurred
   */
  onBlur?(event: ChangeEvent<HTMLInputElement>): void;
  /**
   * Autofocus the input?
   */
  autoFocus?: boolean;
  /**
   * Minimum value (if number type)
   */
  min?: number;
  /**
   * Maximum value (if number type)
   */
  max?: number;
}

/**
 * Display a fancy text input for forms
 * @see https://flowbite.com/docs/forms/floating-label/
 */
export default function TextInput({
  label,
  type = "text",
  pill = true,
  className = "",
  id,
  name,
  autoComplete,
  required,
  disabled,
  value,
  defaultValue,
  onChange,
  onBlur,
  autoFocus = false,
  min,
  max,
}: TextInputProps) {
  return (
    <div
      className={
        className +
        " relative border-2 border-gray-200 " +
        (pill ? "rounded-full" : "rounded")
      }
    >
      <input
        type={type}
        id={id}
        name={name}
        className={classNames(
          `border-1 peer block w-full appearance-none rounded-full border-gray-300 bg-transparent p-3 text-sm text-gray-900
          outline-2 focus:ring-alu-primary-purple focus:border-alu-primary-purple focus:outline-alu-primary-purple`,
          disabled && "cursor-not-allowed bg-slate-100"
        )}
        placeholder=" "
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        min={min}
        max={max}
      />
      {label && (
        <label
          htmlFor={id}
          className={classNames(
            `pointer-events-none absolute top-2 left-1 z-10 origin-[0] -translate-y-4 translate-x-1.5 scale-75
            transform cursor-text rounded bg-white px-1 text-sm text-gray-500 duration-200
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100
            peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-1 peer-focus:text-alu-primary-purple`,
            disabled && "bg-slate-100"
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}
