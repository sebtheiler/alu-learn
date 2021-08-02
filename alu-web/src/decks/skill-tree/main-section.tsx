import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import SubSection from './sub-section';

interface MainSectionProps {
  title: string;
  section: Object[];
  deckId: number;
}
export default function MainSection(props: MainSectionProps) {
  const { title, section, deckId } = props;

  return (<div className='main-section'>
    <Container>
      <div className='main-section-header'>
        <div className='d-flex mx-auto'>
          <hr className='flex-grow-1' />
          <h2 className='px-2 align-self-center mb-0'>
            <a href='/study/TODO:/' >
              {title.toUpperCase()}
            </a>
          </h2>
          <hr className='flex-grow-1' />
        </div>
        <small className='text-secondary'>
          Click the title above to study all flashcards in this group, or choose a section below to study specific topics
        </small>
      </div>
      <div className='mt-2'>
        <Row className='main-section-body'>
          {Object.keys(section).map((subSectionTitle, i) =>
            <SubSection
              title={subSectionTitle}
              mainSectionTitle={title}
              deckId={deckId}
              key={i}
            />
          )}
        </Row>
      </div>
    </Container>
  </div>);
}