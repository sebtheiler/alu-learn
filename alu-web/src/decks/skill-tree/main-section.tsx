import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import RenderSubSection, { cleanTitle } from './sub-section';
import { MainSection } from './types';

interface MainSectionProps {
  mainSection: MainSection;
  readOnly?: boolean;
}
export default function RenderMainSection({ mainSection, readOnly }: MainSectionProps) {
  return (<div className='main-section'>
    <Container>
      <div className='main-section-header text-center'>
        <div className='d-flex mx-auto'>
          <hr className='flex-grow-1' />
          <h2 className='px-2 align-self-center mb-0'>
            {readOnly ?
              mainSection.title.toUpperCase()
              :
              <a href={`/deck/${mainSection.deck}/study/${cleanTitle(mainSection.title)}/`}>
                {mainSection.title.toUpperCase()}
                {!!mainSection.percent_complete && ` - ${mainSection.percent_complete*100}%`}
              </a>
            }
          </h2>
          <hr className='flex-grow-1' />
        </div>
        <small className='text-secondary'>
          {/* {mainSection.description} */}
          Click the title above to study all flashcards in this group, or choose a section below to study specific topics
        </small>
      </div>
      <div className='mt-2'>
        <Row className='main-section-body'>
          {mainSection.children.map(subSection =>
            <RenderSubSection
              subSection={subSection}
              mainSection={mainSection}
              readOnly={readOnly}
              key={subSection.id}
            />
          )}
        </Row>
      </div>
    </Container>
  </div>);
}