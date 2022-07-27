import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Button, { ButtonProps } from "atoms/Button";
import { useCallback, useMemo, useState } from "react";

interface AsyncButtonProps extends ButtonProps {
  /**
   * Async function to run when the button is clicked
   */
  onClick(event: React.MouseEvent<HTMLButtonElement>): Promise<void>;
}

/**
 * Renders a button that displays a spinner while `onClick` is loading
 */
export default function AsyncButton(props: AsyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onClickWrapper = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading) return;
      setIsLoading(true);
      await props.onClick(e);
      setIsLoading(false);
    },
    [props.onClick, isLoading]
  );

  const faIcon = useMemo(
    () => (isLoading ? faSpinner : props.faIcon),
    [isLoading, props.faIcon]
  );

  return (
    <Button
      {...props}
      onClick={onClickWrapper}
      faIcon={faIcon}
      _spin={isLoading}
    />
  );
}
