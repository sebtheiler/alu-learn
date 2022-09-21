import classNames from "@/helpers/classNames";
import type { Option } from "@/types";
import { Combobox as HeadlessUICombobox, Transition } from "@headlessui/react";
import { useState } from "react";

interface ComboBoxProps {
  /**
   * Options to select from
   */
  options: Option[];
  /**
   * Default selected option
   */
  defaultValue?: string | number;
  /**
   * Called when the value (not query!) changes
   */
  onChange?(val: string | number | undefined): void;
  /**
   * Clear the selected value after selecting?
   */
  clearOnChange?: boolean;
  /**
   * Called when the query (user input) changes
   */
  onQueryChange(event: React.ChangeEvent<HTMLInputElement>): void;
  /**
   * Placeholder for input
   */
  placeholder?: string;
  /**
   * If true, display "loading" instead of the options. Can be used while loading data
   */
  loading?: boolean;
  /**
   * Apply additional classes
   */
  className?: string;
}

/**
 * Creates a combobox from some options
 */
export default function ComboBox({
  options,
  defaultValue,
  onChange,
  clearOnChange,
  onQueryChange,
  placeholder,
  loading,
  className,
}: ComboBoxProps) {
  const [selected, setSelected] = useState(defaultValue);

  return (
    <HeadlessUICombobox
      value={selected}
      onChange={(v) => {
        !clearOnChange && setSelected(v);
        onChange && onChange(v);
      }}
    >
      <HeadlessUICombobox.Input
        onChange={onQueryChange}
        className={classNames(
          `relative w-full bg-white border-2 border-gray-200 rounded-full shadow-sm p-3
          text-left cursor-default focus:outline-none focus:ring-1 group focus:border-1 block
          focus:ring-alu-primary-purple focus:border-alu-primary-purple sm:text-sm z-1 hover:cursor-text`,
          className
        )}
        placeholder={placeholder}
      />
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
        {loading ? (
          <p className="py-2 px-3">Loading...</p>
        ) : options.length > 0 ? (
          <HeadlessUICombobox.Options>
            {options.map((option, i) => (
              <HeadlessUICombobox.Option
                key={i}
                value={option.value}
                disabled={option.disabled}
                className={({ active, disabled }) =>
                  classNames(
                    active
                      ? "text-white bg-alu-primary-purple"
                      : "text-gray-900",
                    (disabled || option.disabled) &&
                      "bg-gray-100 text-gray-700 cursor-not-allowed",
                    "cursor-default select-none relative py-2 px-3 pr-9 z-10"
                  )
                }
                style={{ zIndex: "50" }}
              >
                {option.label}
              </HeadlessUICombobox.Option>
            ))}
          </HeadlessUICombobox.Options>
        ) : (
          <p className="py-2 px-3">No results found</p>
        )}
      </Transition>
    </HeadlessUICombobox>
  );
}
