import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import LoadingButton from './buttons/LoadingButton';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { MainSection, SubSection } from './types';
import { SubSectionButtons } from './buttons/section-buttons';
import { useState } from 'react';
import TutorialPopup from '../pages/tutorial';

const currentlyStudiedColor = '#5ed149';
const previouslyStudiedColor = '#FDCE29';

export const cleanTitle = (title: string) => encodeURIComponent(title.toLowerCase().replaceAll('-', '.d.').replaceAll(' ', '-'));
export const uncleanTag = (tags: string) => tags.replaceAll('-', ' ').replaceAll('__', ' AND ').replace('.d.', '-')

interface SubSectionProps {
  subSection: SubSection;
  mainSection: MainSection;
  numSubSections?: number;
  readOnly?: boolean;
  studyable?: boolean;
  essentialOnly?: boolean;
}
export default function RenderSubSection({ subSection, mainSection, numSubSections, readOnly, studyable, essentialOnly }: SubSectionProps) {
  const [subSectionDiv, setSubSectionDiv] = useState<Element | null>(null);

  return (
    <Col
      xl={3}
      lg={4}
      md={6}
      xs={6}
      className='mx-auto'
    >
      <OverlayTrigger
        overlay={
          <Popover id='study-section-popover' style={{ minWidth: '240px' }}>
            <Popover.Title as='h3' className='text-center'>
              {subSection.data.title}
              {!readOnly && <SubSectionButtons
                subSection={subSection}
                numSubSections={numSubSections}
                mainSectionId={mainSection.id}
                deckId={mainSection.deck}
              />}
            </Popover.Title>
            <Popover.Content>
              {/* <p>{subSection.data.description}</p> */}
              <div>
                {studyable && <>
                  <LoadingButton
                    clickFunc={async () => {window.location.href = (
                      `study/\
                      ${cleanTitle(mainSection.data.title)}__\
                      ${cleanTitle(subSection.data.title)}/\
                      ${essentialOnly ? '?essentialOnly=true' : ''}\
                      `.replaceAll(' ', '')
                    ); await new Promise(r => setTimeout(r, 100000))}}
                    block
                  >
                    Study
                  </LoadingButton>
                </>}

                {!readOnly && <Button
                  href={
                    `/deck/${mainSection.deck}/flashcards/create/\
                    ${cleanTitle(mainSection.data.title)}__\
                    ${cleanTitle(subSection.data.title)}/`.replaceAll(' ', '')
                  }
                  block
                >
                  Add Flashcards
                </Button>}
                <LoadingButton
                  clickFunc={async () => {window.location.href = (
                    `flashcards/sections/\
                    ${cleanTitle(mainSection.data.title)}__\
                    ${cleanTitle(subSection.data.title)}/`.replaceAll(' ', '')
                  ); await new Promise(r => setTimeout(r, 100000))}}
                  variant='secondary'
                  block
                >
                  View
                </LoadingButton>
              </div>
            </Popover.Content>
          </Popover>
        }
        placement='bottom'
        trigger='click'
        rootClose
      >
        <div
          className='sub-section'
          role='button'
          style={{ background: `conic-gradient(${previouslyStudiedColor} ${(subSection.total_percent_complete ?? 0)*100}%, transparent 0%)` }}
          ref={setSubSectionDiv}
        >
          <div
            className='sub-section-percent-complete'
            style={{ background: `conic-gradient(${currentlyStudiedColor} ${(subSection.percent_complete ?? 0)*100}%, transparent 0%)` }}
          >
            <div className='sub-section-inner'>
              <p className='sub-section-text'>{subSection.data.title}</p>
            </div>
          </div>
        </div>
      </OverlayTrigger>
      {subSection.order_num === 0 && mainSection.order_num === 0 && <TutorialPopup
        referenceElement={subSectionDiv}
        tutorialAttr='clicked_sub_section'
      >
        Click here to add flashcards or study your deck
      </TutorialPopup>}
    </Col>
  );
}
