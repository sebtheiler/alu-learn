import styles from "./FileUpload.module.scss";
import classNames from "helpers/classNames";

interface FileUploadProps {
  /**
   * Label to appear above the file upload
   */
  label: string;
  /**
   * File types to accept
   */
  accept?: string;
  /**
   * Additional classes for the div surrounding the file input element
   */
  className?: string;
  /**
   * Name of the file input element
   */
  name?: string;
  /**
   * Function to call when the selected file changes
   * TODO: change the type of `e
   */
  onChange(e: any): void;
}

/**
 * A simple, styled input for uploading files
 */
export default function FileUpload({
  label,
  accept,
  className,
  name,
  onChange,
}: FileUploadProps) {
  return (
    <div className={className}>
      {label && (
        <label className="text-gray-500" htmlFor="file_input">
          {label}
        </label>
      )}
      <input
        className={classNames(
          styles.fileUpload,
          `block border-2 rounded-full border-gray-200 bg-transparent text-sm
           text-gray-900 outline-2 focus:ring-alu-primary-purple
           focus:border-alu-primary-purple focus:outline-alu-primary-purple
           text-center w-full hover:cursor-pointer`
        )}
        aria-describedby="file_input_help"
        id="file_input"
        type="file"
        name={name}
        accept={accept}
        onChange={onChange}
      />
    </div>
  );
}
