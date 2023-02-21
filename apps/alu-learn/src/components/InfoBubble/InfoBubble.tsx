import Tooltip from "alu-ui/src/Tooltip";
import {
  faCircleInfo,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface InfoBubbleProps {
  /**
   * Text to display when the bubble is hovered
   */
  text: React.ReactNode;
  /**
   * Whether to display an info bubble or a question bubble
   */
  variant: "info" | "question";
  /**
   * Classname to apply to the bubble
   */
  className?: string;
}

/**
 * Renders a small info/question bubble that provides more information when hovered
 */
export default function InfoBubble({
  text,
  variant = "info",
  className = "",
}: InfoBubbleProps) {
  return (
    <Tooltip tooltip={text} className={className}>
      <FontAwesomeIcon
        icon={variant === "info" ? faCircleInfo : faCircleQuestion}
      />
    </Tooltip>
  );
}
