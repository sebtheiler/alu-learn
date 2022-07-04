interface CheckboxProps {
  /**
   * Label to display next to the checkbox
   */
  label: React.ReactNode;
  /**
   * Extended description to display beneat the label and checkbox
   */
  description?: React.ReactNode;
  /**
   * ID of the checkbox input element
   */
  id?: string;
  /**
   * Label of the checkbox input element
   */
  name?: string;
  /**
   * Class to apply to the outer div element
   */
  className?: string;
  /**
   * Is the checkbox required?
   */
  required?: boolean;
}

/**
 * Renders a fancy checkbox for forms
 */
export default function Checkbox({
  label,
  description,
  id,
  name,
  required,
  className='',
}: CheckboxProps) {
  return (
    <div className={'flex items-start ' + className}>
      <div className='flex items-center h-5'>
        <input
          id={id}
          name={name}
          type='checkbox'
          className='focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded'
          required={required}
        />
      </div>
      <div className='ml-3 text-sm'>
        <label htmlFor={id} className='font-medium text-gray-700'>
          {label}
        </label>
        {description && <p className='text-gray-500'>{description}</p>}
      </div>
    </div>
  );
}
