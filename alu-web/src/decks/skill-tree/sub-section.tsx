import React from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { MainSection, SubSection } from './types';

export const cleanTag = (title: string) => title.replaceAll(' ', '-');
export const uncleanTag = (tags: string) => tags.replaceAll('-', ' ').replaceAll('__', ' AND ')

interface SubSectionProps {
  subSection: SubSection;
  mainSection: MainSection;
}
export default function RenderSubSection({ subSection, mainSection }: SubSectionProps) {
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
              {subSection.title ?? subSection.tag}
            </Popover.Title>
            <Popover.Content>
              <p>Description {/* TODO: subSection.description */}</p>
              <div>
                <Button
                  href={`/deck/${mainSection.deck}/study/${cleanTag(mainSection.tag)}__${cleanTag(subSection.tag)}/`}
                  block
                >
                  Study
                </Button>
                <Button
                  href={`/deck/${mainSection.deck}/flashcards/tags/${cleanTag(mainSection.tag)}__${cleanTag(subSection.tag)}/`}
                  variant='secondary'
                  block
                >
                  View
                </Button>
                <Button
                  variant='secondary'
                  block
                >
                  Learning Resources
                </Button>
              </div>
            </Popover.Content>
          </Popover>
        }
        placement='bottom'
        trigger='click'
        rootClose
      >
        <div className='sub-section' role='button'>
          <p className='sub-section-text'>{subSection.title ?? subSection.tag}</p>
        </div>
      </OverlayTrigger>
    </Col>
  );
}
