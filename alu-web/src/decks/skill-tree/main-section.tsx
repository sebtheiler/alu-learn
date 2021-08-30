import Row from 'react-bootstrap/Row';
import RenderSubSection, { cleanTitle } from './sub-section';
import { MainSectionButtons, CreateSubSectionButton } from './buttons/section-buttons';
import { MainSection } from './types';

interface MainSectionProps {
  mainSection: MainSection;
  readOnly?: boolean;
}
export default function RenderMainSection({ mainSection, readOnly }: MainSectionProps) {
  return (<div className='main-section'>
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
        {!readOnly && <MainSectionButtons mainSection={mainSection} />}
      </div>
      <small className='text-secondary'>
        {/* {mainSection.description} */}
        Click the title above to study all flashcards in this main-section, or choose a sub-section below to study specific topics
      </small>
    </div>
    <div className='mt-2'>
      <Row className='main-section-body'>
        {mainSection.sub_sections.map(subSection =>
          <RenderSubSection
            subSection={subSection}
            mainSection={mainSection}
            readOnly={readOnly}
            key={subSection.id}
          />
        )}
      </Row>
    </div>
    {!readOnly && <CreateSubSectionButton mainSection={mainSection} />}
  </div>);
}