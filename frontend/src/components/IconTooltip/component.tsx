import OverlayTrigger from '@components/OverlayTrigger';
import Spinner from '@components/Spinner';
import Tooltip from '@components/Tooltip';
import { useState } from 'react';

interface IconTooltipProps {
  tooltip: string;
  onClick(e: MouseEvent): Promise<void>;
  faClass: string;
  className?: string;
  style?: React.CSSProperties;
  id: string;
}
export default function IconTooltip({ tooltip, onClick, faClass, className, style, id }: IconTooltipProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: MouseEvent) => {
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
            // @ts-ignore
            onClick={handleClick}
            style={style}
          />
        )
      }
    </OverlayTrigger>
  );
}
