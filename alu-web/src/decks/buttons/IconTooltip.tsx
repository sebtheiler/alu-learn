import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Tooltip from 'react-bootstrap/Tooltip';
import { useState } from 'react';

interface IconTooltipProps {
  tooltip: string;
  onClick(e): Promise<void>;
  faClass: string;
  className?: string;
  style?: React.CSSProperties;
  id: string;
}
export default function IconTooltip({ tooltip, onClick, faClass, className, style, id }: IconTooltipProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e) => {
    setIsLoading(true);
    await onClick(e);
    setIsLoading(false);
  }

  return (
    <OverlayTrigger
      overlay={
        <Tooltip id={id}>
          {tooltip}
        </Tooltip>
      }
    >
      {isLoading
        ? (
          <Spinner
            animation='border'
            size='sm'
            className={className}
            variant='primary'
          />
        )
        : (
          <i
            className={faClass + ` ${className}`}
            role='button'
            onClick={handleClick}
            style={style}
          />
        )
      }
    </OverlayTrigger>
  );
}