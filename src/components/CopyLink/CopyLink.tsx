import classNames from "@/helpers/classNames";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useId, useState } from "react";

interface CopyLinkProps {
  link: string;
  className?: string;
}

/**
 * Comopnent that displays a link that the user can easily copy
 */
export default function CopyLink({ link, className }: CopyLinkProps) {
  const id = useId();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (el) {
      el.select();
      navigator.clipboard.writeText(el.value);
    }
    setCopied(true);
  };

  return (
    <div className={classNames("relative w-full", className)}>
      <input
        value={`${process.env.NEXT_PUBLIC_SERVER_URL}/${link}`}
        readOnly
        className="px-2 py-1 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-gray-200 w-full"
        id={id}
        onClick={copy}
      />
      <button
        onClick={copy}
        className="absolute top-0 right-2 p-1.5 rounded-full"
      >
        <FontAwesomeIcon
          icon={copied ? faCheck : faCopy}
          className="bg-white text-gray-600"
          title="Copy"
        />
      </button>
    </div>
  );
}
