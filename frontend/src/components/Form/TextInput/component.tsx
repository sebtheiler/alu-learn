import classNames from '@helpers/classNames';

import type { ChangeEvent } from 'react';

interface TextInputProps {
  /**
   * Label to display in the text input
   */
  label?: string;
  /**
   * Input type of the text input
   */
  type?: 'text' | 'number' | 'email' | 'password';
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
   * Function to call when the input changes
   */
  onChange?(event: ChangeEvent<HTMLInputElement>): void;
  /**
   * Function to call when the input is blurred
   */
  onBlur?(event: ChangeEvent<HTMLInputElement>): void;
}

/**
 * Display a fancy text input for forms
 * @see https://flowbite.com/docs/forms/floating-label/
 */
export default function TextInput({
  label,
  type='text',
  pill=true,
  className='',
  id,
  name,
  autoComplete,
  required,
  disabled,
  onChange,
  onBlur,
}: TextInputProps) {
  return (
    <div className={className + ' relative border-2 border-gray-200 ' + (pill ? 'rounded-full' : 'rounded')}>
      <input
        type={type}
        id={id}
        name={name}
        className={classNames('block p-3 w-full text-sm text-gray-900 bg-transparent\
                   rounded-full border-1 border-gray-300 appearance-none focus:outline-none\
                   focus:ring-0 focus:border-alu-primary-purple peer',
                   disabled && 'bg-slate-100 cursor-not-allowed')}
        placeholder=' '
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
      />
      {label && <label
        htmlFor={id}
        className={classNames('absolute text-sm text-gray-500 duration-200 pointer-events-none cursor-text rounded\
                   transform -translate-y-4 translate-x-1.5 scale-75 top-2 z-10 origin-[0] bg-white\
                   px-1 peer-focus:px-1 peer-focus:text-alu-primary-purple peer-placeholder-shown:scale-100\
                   peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2\
                   peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1', disabled && 'bg-slate-100')}
      >
        {label}
      </label>}
    </div>
  );
}