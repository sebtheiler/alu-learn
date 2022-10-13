import { useId } from "react";

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
   * Triggers when the state of the checkbox is changed
   */
  onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
  /**
   * Is the checkbox checked by default?
   */
  defaultChecked?: boolean;
  /**
   * Value
   */
  value?: string;
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
  onChange,
  defaultChecked,
  value,
  className = "",
}: CheckboxProps) {
  const componentId = useId();

  return (
    <div className={"flex items-start " + className}>
      <div className="flex h-5 items-center">
        <input
          id={id ?? componentId}
          value={value}
          name={name}
          type="checkbox"
          className="h-4 w-4 rounded-full accent-alu-primary-purple ring-indigo-500 focus:outline-none focus:ring focus:ring-violet-400/20"
          onChange={onChange}
          required={required}
          defaultChecked={defaultChecked}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={id ?? componentId}>{label}</label>
        {description && <p className="text-gray-500">{description}</p>}
      </div>
    </div>
  );
}
