import React from 'react';
import Col from 'react-bootstrap/Col';

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
        <div className='sub-section'>
          <p className='sub-section-text'>{title}</p>
        </div>
      </a>
    </Col>
  );
}
