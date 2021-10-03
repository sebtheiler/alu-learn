import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

interface IconTooltipProps {
  tooltip: string;
  onClick(e): void;
  faClass: string;
  id: string;
}
export default function IconTooltip({ tooltip, onClick, faClass, id }: IconTooltipProps) {
  return (
    <OverlayTrigger
      overlay={
        <Tooltip id={id}>
          {tooltip}
        </Tooltip>
      }
    >
      <i
        className={faClass}
        role='button'
        onClick={onClick}
      />
    </OverlayTrigger>
  );
}