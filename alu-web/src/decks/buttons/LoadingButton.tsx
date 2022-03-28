import Button, { ButtonProps } from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { useState } from 'react';

interface LoadingButtonProps extends ButtonProps {
  clickFunc(event): Promise<any>;
  ref?: React.LegacyRef<HTMLDivElement>;
}
export default function LoadingButton(props: LoadingButtonProps) {
  const { clickFunc, ref } = props;
  let defaultProps = {...props as any};
  delete defaultProps.clickFunc;

  const [loading, setLoading] = useState(false);

  const onClick = event => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);

    clickFunc(event).finally(() => setLoading(false));
  }

  return (
    <Button {...defaultProps} onClick={onClick} ref={ref}>
      {props.children}
      {loading && <Spinner
        animation='border'
        size='sm'
        className='ml-3'
      />}
    </Button>
  )
}