import Button from 'react-bootstrap/Button';
import { Placement } from '@popperjs/core';
import { backendFetch, useAsyncState } from '../lookup/lookup';
import { useCallback, useMemo, useState } from 'react';
import { usePopper } from 'react-popper';
import './tutorial.scss';

type TutorialAttr = 'created_first_deck';

interface TutorialPopupProps {
  referenceElement: Element | null;
  tutorialAttr: TutorialAttr;
  children: React.ReactNode | React.ReactNodeArray;
  placement?: Placement;
}
export default function TutorialPopup(props: TutorialPopupProps) {
  const { referenceElement, children, placement='right', tutorialAttr } = props;

  const [eventListenersEnabled, setEventListenersEnabled] = useState(false);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);
  const popperInstance = usePopper(referenceElement, popperElement, {
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } },
      { name: 'offset', options: { offset: [0, 8] } },
      { name: 'eventListeners', enabled: eventListenersEnabled },
    ],
    placement: placement,
  });
  useAsyncState<{ value: boolean }>(
    getProfileTutorialProgress, [tutorialAttr],
    attr => !attr.value && show(),
    !!popperElement,
  );

  // Show and hide the element
  const show = useCallback(() => {
    if (!popperElement) return;
    popperElement.setAttribute('data-show', '');
    setEventListenersEnabled(true);

    // We need to tell Popper to update the tooltip position
    // after we show the tooltip, otherwise it will be incorrect
    if (!popperInstance.update) return;
    popperInstance.update();
  }, [popperElement, popperInstance]);

  const hide = useCallback(() => {
    if (!popperElement) return;
    popperElement.removeAttribute('data-show');
    setProfileTutorialProgress(tutorialAttr, true);
    setEventListenersEnabled(false);
  }, [popperElement, tutorialAttr]);


  // Hide the popover when the specified element is clicked
  useMemo(() => {
    if (!referenceElement) return;
    (referenceElement as HTMLElement).onclick = hide;
  }, [referenceElement, hide]);

  return (
    <>
      <div
        ref={setPopperElement}
        style={popperInstance.styles.popper}
        {...popperInstance.attributes.popper}
        className='tutorial-popper'
      >
        {children}
        <Button className='mt-2' onClick={hide} variant='outline-light' block>
          Got it
        </Button>
        <div ref={setArrowElement} style={popperInstance.styles.arrow} className='tutorial-popper-arrow' />
      </div>
    </>
  );
}

const setProfileTutorialProgress = async (attr: string, value: boolean) => {
  return backendFetch('POST', `profiles/tutorials/set/${attr}/`, { value: value });
}

const getProfileTutorialProgress = async (attr: string) => {
  return backendFetch('GET', `profiles/tutorials/get/${attr}/`);
}
