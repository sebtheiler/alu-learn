import React from 'react';
import Row from 'react-bootstrap/Row';
import SubSection from './sub-section';

interface MainSectionProps {
  title: string;
  section: Object[];
}
export default function MainSection(props: MainSectionProps) {
  const { title, section } = props;

  return (<>
    <div className='d-flex'>
      <hr className='flex-grow-1' />
      <h2 className='px-2 align-self-center mb-0'>
        <a href='/study/TODO:/' >
          {title.toUpperCase()}
        </a>
      </h2>
      <hr className='flex-grow-1' />
    </div>
    <small className='text-secondary'>
      Click the title above to study all flashcards, or choose a section below to study specific parts
    </small>
    <Row className='main-section mt-1'>
      {Object.keys(section).map((subSectionTitle, i) =>
        <SubSection
          title={subSectionTitle}
          key={i}
        />
      )}
    </Row>
  </>);
}