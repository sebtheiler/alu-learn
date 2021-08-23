import React from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { MainSection, SubSection } from './types';

export const cleanTitle = (title: string) => title.toLowerCase().replaceAll(' ', '-');
export const uncleanTag = (tags: string) => tags.replaceAll('-', ' ').replaceAll('__', ' AND ')

interface SubSectionProps {
  subSection: SubSection;
  mainSection: MainSection;
  readOnly?: boolean;
}
export default function RenderSubSection({ subSection, mainSection, readOnly }: SubSectionProps) {
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
          <Popover id='study-section-popover'>
            <Popover.Title as='h3' className='text-center'>
              {subSection.title}
            </Popover.Title>
            <Popover.Content>
              <p>{subSection.description}</p>
              <div>
                {!readOnly && <Button
                  href={`/deck/${mainSection.deck}/study/${cleanTitle(mainSection.title)}__${cleanTitle(subSection.title)}/`}
                  block
                >
                  Study
                </Button>}
                {!readOnly && <Button
                  href={`/deck/${mainSection.deck}/flashcards/create/${cleanTitle(mainSection.title)}__${cleanTitle(subSection.title)}/`}
                  block
                >
                  Add Flashcards
                </Button>}
                <Button
                  href={`/deck/${mainSection.deck}/flashcards/sections/${cleanTitle(mainSection.title)}__${cleanTitle(subSection.title)}/`}
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
            <p className='sub-section-text'>{subSection.title}</p>
          </div>
        </div>
      </OverlayTrigger>
    </Col>
  );
}
