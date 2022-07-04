import { useState } from 'react';
import { usePopper } from 'react-popper';

interface TooltipProps {
  children;
}

/**
 * 
 */
export default function Tooltip({
  children,
}: TooltipProps) {
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const { styles, attributes, update } = usePopper(referenceElement, popperElement);

  function show() {
    popperElement.setAttribute('data-show', '');
    setShowTooltip(true);
    update();
  }

  function hide() {
    popperElement.removeAttribute('data-show');
    setShowTooltip(false);
  }

  const showEvents = ['mouseenter', 'focus'];
  const hideEvents = ['mouseleave', 'blur'];

  showEvents.forEach((event) => {
    if (referenceElement) referenceElement.addEventListener(event, show);
  });

  hideEvents.forEach((event) => {
    if (referenceElement) referenceElement.addEventListener(event, hide);
  });

  return (
    <div className='inline group'>
      <span ref={setReferenceElement}>
        {children}
      </span>
      <div
        ref={setPopperElement}
        style={styles.popper}
        className={'bg-gray-800 bg-opacity-80 text-white font-bold py-1 px-2 rounded hidden' + (showTooltip ? ' block' : '')}
        {...attributes.popper}
      >
        Popper element
      </div>
    </div>
  );
}