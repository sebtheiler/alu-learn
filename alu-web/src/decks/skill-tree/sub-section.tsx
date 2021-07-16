import React from 'react';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { generateTooltip } from '../../utils';

interface SubSectionProps {
  title: string;
}
export default function SubSection(props: SubSectionProps) {
  const { title } = props;

  return (
    <Col
      md={3}
      xs={4}
      className='mx-auto'
    >
      <a href='/study/TODO:/' className='no-underline'>
      <OverlayTrigger
        overlay={generateTooltip(title[0].toUpperCase() + title.slice(1))}
        placement='right'
        delay={{ show: 800, hide: 300 }}
      >
        <div className='sub-section'>
          <p className='sub-section-text'>{title}</p>
        </div>
      </OverlayTrigger>
      </a>
    </Col>
  );
}
