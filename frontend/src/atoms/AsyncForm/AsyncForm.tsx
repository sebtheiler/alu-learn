import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Button from "atoms/Button";
import type { ButtonProps } from "atoms/Button";
import { useCallback, useMemo, useState } from "react";

interface AsyncFormProps {
  /**
   * Elements of the form
   */
  children: React.ReactNode;
  /**
   * Function called when the form is submitted
   */
  onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<any>;
  /**
   * Props to affect the button at the bottom of the form
   */
  buttonProps: ButtonProps;
}

/**
 * Form with a button that displays a loading animation while the form's `onSubmit` function is loading
 */
export default function AsyncForm({
  children,
  onSubmit,
  buttonProps,
}: AsyncFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitWrapper = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isLoading) return;
      setIsLoading(true);
      await onSubmit(e);
      setIsLoading(false);
    },
    [onSubmit, isLoading]
  );

  const faIcon = useMemo(
    () => (isLoading ? faSpinner : buttonProps?.faIcon),
    [isLoading, buttonProps?.faIcon]
  );

  return (
    <form onSubmit={onSubmitWrapper}>
      {children}
      <Button
        {...buttonProps}
        type="submit"
        faIcon={faIcon}
        _spin={isLoading}
      />
    </form>
  );
}
