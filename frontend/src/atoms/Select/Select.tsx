import classNames from "@/helpers/classNames";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Listbox, Transition } from "@headlessui/react";
import { useState } from "react";

interface Option {
  /**
   * Value of the option
   */
  value: string | number;
  /**
   * Label to display for the option
   */
  label: string;
  /**
   * Is the option disabled?
   */
  disabled?: boolean;
}

interface SelectProps {
  /**
   * List of options to display
   */
  options: Option[];
  /**
   * Value of the default option
   */
  defaultValue?: string | number;
  /**
   * Label to display
   */
  label?: string;
  /**
   * ID of the button
   */
  id: string;
  /**
   * Function to call when the value changes
   * @param val Value of the new option
   */
  onChange?(val: string | number): void;
  /**
   * Additional classnames to apply to the Listbox button
   */
  className?: string;
}

/**
 * Displays a dropdown select interface for use in forms
 */
export default function Select({
  options,
  defaultValue,
  label,
  id,
  onChange,
  className,
}: SelectProps) {
  const [selectedOption, setSelectedOption] = useState(
    () =>
      options.filter((option) => option.value === defaultValue)[0] ?? options[0]
  );

  return (
    <Listbox
      value={selectedOption.value}
      onChange={(optionVal) => {
        onChange && onChange(optionVal);
        setSelectedOption(
          options.find((o) => o.value === optionVal) ?? selectedOption
        );
      }}
    >
      <Listbox.Button
        className={classNames(
          `relative w-full bg-white border-2 border-gray-200 rounded-full shadow-sm p-3
          text-left cursor-default focus:outline-none focus:ring-1 group focus:border-1 block
          focus:ring-alu-primary-purple focus:border-alu-primary-purple sm:text-sm z-1`,
          className
        )}
        id={id}
        style={{ zIndex: "0" }}
      >
        {selectedOption.label}
        <span className="absolute right-4">
          <FontAwesomeIcon icon={faSort} />
        </span>
        {label && (
          <label
            htmlFor={id}
            className="pointer-events-none absolute top-2 left-1 z-2 origin-[0] -translate-y-4
                       translate-x-1.5 scale-75 transform cursor-text rounded bg-white px-1
                       text-sm text-gray-500 duration-200 group-placeholder-shown:top-1/2
                       group-placeholder-shown:-translate-y-1/2 group-placeholder-shown:scale-100
                       group-focus:top-2 group-focus:-translate-y-4 group-focus:scale-75 group-focus:px-1
                       group-focus:text-alu-primary-purple"
          >
            {label}
          </label>
        )}
      </Listbox.Button>
      <Transition
        enter="ease-out duration-200"
        enterFrom="-translate-y-8 opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="-translate-y-8 opacity-0"
        className="z-10 absolute mt-1 w-full bg-white max-h-56 rounded-xl py-1
                   text-base overflow-auto shadow-md peer
                   sm:text-sm max-w-sm border-gray-200 border-2"
        style={{ zIndex: "50" }}
      >
        <Listbox.Options className="focus:outline-none">
          {options.map((option, i) => (
            <Listbox.Option
              key={`${id}-${i}`}
              value={option.value}
              disabled={option.disabled}
              className={({ active, disabled }) =>
                classNames(
                  active ? "text-white bg-alu-primary-purple" : "text-gray-900",
                  disabled && "bg-gray-100 text-gray-700 cursor-not-allowed",
                  "cursor-default select-none relative py-2 pl-3 pr-9 z-10"
                )
              }
              style={{ zIndex: "50" }}
            >
              {option.label}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  );
}
