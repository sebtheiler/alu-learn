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
  const { faIcon, onClick } = props;
  const [isLoading, setIsLoading] = useState(false);

  const onClickWrapper = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading) return;
      setIsLoading(true);
      await onClick(e);
      setIsLoading(false);
    },
    [onClick, isLoading]
  );

  const faIconToRender = useMemo(
    () => (isLoading ? faSpinner : faIcon),
    [isLoading, faIcon]
  );

  return (
    <Button
      {...props}
      onClick={onClickWrapper}
      faIcon={faIconToRender}
      _spin={isLoading}
    />
  );
}
