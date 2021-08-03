import React from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { capitalize } from '../../utils';

interface SubSectionProps {
  title: string;
  mainSectionTitle: string;
  deckId: number;
}
export default function SubSection({ title, mainSectionTitle, deckId }: SubSectionProps) {
  const cleanTitle = (title: string) => title.replace(' ', '-');

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
            <Popover.Title as='h3'>
              Study "{capitalize(title, true)}"
            </Popover.Title>
            <Popover.Content>
              <Button
                href={`/decks/${deckId}/study/${cleanTitle(mainSectionTitle)}__${cleanTitle(title)}/`}
                block
              >
                Study
              </Button>
            </Popover.Content>
          </Popover>
        }
        placement='bottom'
        trigger='click'
        rootClose
      >
        <div className='sub-section' role='button'>
          <p className='sub-section-text'>{capitalize(title, true)}</p>
        </div>
      </OverlayTrigger>
    </Col>
  );
}
