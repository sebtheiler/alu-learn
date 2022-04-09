import Button from 'react-bootstrap/Button';
import { Placement } from '@popperjs/core';
import { backendFetch, useAsyncState } from '../lookup/lookup';
import { useCallback, useMemo, useState } from 'react';
import { usePopper } from 'react-popper';
import './tutorial.scss';

type TutorialAttr =
  | 'clicked_study'
  | 'clicked_sub_section'
  | 'copied_shared_deck'
  | 'created_first_deck'
  | 'created_sub_section'
  | 'explored_shared_decks'
  | 'studied_flashcard';

const requirements = {
  'created_first_classroom': ['created_first_deck'],
  'created_sub_section': ['studied_flashcard'],
  'clicked_study': ['created_sub_section'],
}

interface TutorialPopupProps {
  referenceElement: Element | null;
  tutorialAttr: TutorialAttr;
  children: React.ReactNode | React.ReactNodeArray;
  placement?: Placement;
}
export default function TutorialPopup(props: TutorialPopupProps) {
  const { referenceElement, children, placement='right', tutorialAttr } = props;

  const [requirementsMet, setRequirementsMet] = useState(false);
  const [tutorialProgress, setTutorialProgress] = useState(() => {
    const raw = localStorage.getItem('tutorialProgress');
    const val = raw ? JSON.parse(raw) : {};

    const attrRequirements = requirements[tutorialAttr] ?? [];
    var passed = true;
    for (const requirement of attrRequirements) {
      if (!val[requirement]) {
        passed = false;
        break;
      }
    }
    setRequirementsMet(passed)

    return val;
  });
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
  useAsyncState<{ value: boolean, detail?: string }>(
    getProfileTutorialProgress, [tutorialAttr],
    attr => {
      if (attr.detail) return;
      if (!attr.value) show();
      let tutorialProgressCopy = tutorialProgress;
      tutorialProgressCopy[tutorialAttr] = attr.value;
      localStorage.setItem(
        'tutorialProgress',
        JSON.stringify(tutorialProgressCopy),
      );
    },
    !!popperElement && !tutorialProgress[tutorialAttr] && requirementsMet,
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
    setEventListenersEnabled(false);

    // Cache this in local storage so that no more requests are sent
    let tutorialProgressCopy = JSON.parse(
      localStorage.getItem('tutorialProgress') ?? '{}'
    );  // refetch because it may have changed by now
    if (tutorialProgressCopy[tutorialAttr]) return;

    setProfileTutorialProgress(tutorialAttr, true);
    tutorialProgressCopy[tutorialAttr] = true;
    setTutorialProgress(tutorialProgressCopy);
    localStorage.setItem(
      'tutorialProgress',
      JSON.stringify(tutorialProgressCopy),
    );
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
        className='tutorial-popper text-center'
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
