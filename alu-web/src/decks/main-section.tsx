import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Row from 'react-bootstrap/Row';
import RenderSubSection, { cleanTitle } from './sub-section';
import { MainSectionButtons, CreateSubSectionButton } from './buttons/section-buttons';
import { MainSection } from './types';

interface MainSectionProps {
  mainSection: MainSection;
  numMainSections: number;
  readOnly?: boolean;
}
export default function RenderMainSection({ mainSection, numMainSections, readOnly }: MainSectionProps) {
  return (<div className='main-section'>
    <div className='main-section-header text-center'>
      <div className='d-flex mx-auto'>
        <hr className='flex-grow-1' />
        <h2 className='px-2 align-self-center mb-0'>
          {mainSection.data.title.toUpperCase()}
        </h2>
        <hr className='flex-grow-1' />
        {!readOnly && <MainSectionButtons mainSection={mainSection} numMainSections={numMainSections} />}
      </div>
      <div className='mt-2'>
        <ButtonGroup>
          {!readOnly && <Button href={`study/${cleanTitle(mainSection.data.title)}/`} style={{ width: '100px' }}>
            Study
          </Button>}
          <Button
            href={`flashcards/sections/${cleanTitle(mainSection.data.title)}/`}
            style={{ width: '100px', marginLeft: '5px' }}
            variant='secondary'
          >
            View
          </Button>
        </ButtonGroup>
      </div>
    </div>
    <div className='mt-2'>
      <Row className='main-section-body'>
        {mainSection.sub_sections.sort((a, b) => a.order_num - b.order_num).map(subSection =>
          <RenderSubSection
            subSection={subSection}
            mainSection={mainSection}
            numSubSections={mainSection.sub_sections.length}
            readOnly={readOnly}
            studyable={!readOnly}
            key={subSection.id}
          />
        )}
      </Row>
    </div>
    {!readOnly && <CreateSubSectionButton mainSection={mainSection} />}
  </div>);
}