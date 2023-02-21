/**
 * Option for use in UI elements (e.g., Dropdown)
 */
export interface Option {
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