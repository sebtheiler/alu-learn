import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Tooltip from 'react-bootstrap/Tooltip';
import { MainSection, SubSection } from './types';
import { SubSectionButtons } from './buttons/section-buttons';

export const cleanTitle = (title: string) => title.toLowerCase().replaceAll(' ', '-');
export const uncleanTag = (tags: string) => tags.replaceAll('-', ' ').replaceAll('__', ' AND ')

interface SubSectionProps {
  subSection: SubSection;
  mainSection: MainSection;
  numSubSections: number;
  readOnly?: boolean;
}
export default function RenderSubSection({ subSection, mainSection, numSubSections, readOnly }: SubSectionProps) {
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
              <p>{subSection.data.description}</p>
              <div>
                {!readOnly && <Button
                  href={
                    `/deck/${mainSection.deck}/study/\
                    ${cleanTitle(mainSection.data.title)}__\
                    ${cleanTitle(subSection.data.title)}/`.replaceAll(' ', '')
                  }
                  block
                >
                  Study
                </Button>}
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
                <Button
                  href={
                    `flashcards/sections/\
                    ${cleanTitle(mainSection.data.title)}__\
                    ${cleanTitle(subSection.data.title)}/`.replaceAll(' ', '')
                  }
                  variant='secondary'
                  block
                >
                  View
                </Button>
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
          style={{ background: `conic-gradient(rgba(42, 157, 244, 1) ${(subSection.percent_complete ?? 0)*100}%, transparent 0%)` }}
        >
          <div className='sub-section-inner'>
            <div className='sub-section-assignment-indicator'>
              <OverlayTrigger
                overlay={
                  <Tooltip id={`sub-section-assigned-tooltip-${subSection.id}`}>
                    This sub section is assigned as work
                  </Tooltip>
                }
              >
                <i className='far fa-star fa-lg' />
              </OverlayTrigger>
            </div>
            <p className='sub-section-text'>{subSection.data.title}</p>
          </div>
        </div>
      </OverlayTrigger>
    </Col>
  );
}
