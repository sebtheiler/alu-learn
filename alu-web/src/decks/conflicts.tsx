import Col from 'react-bootstrap/Col';
import LoadingButton from './buttons/LoadingButton';
import RenderFlashcard from './render-flashcard';
import Row from 'react-bootstrap/Row';
import { FlashCard } from './types';
import { MainSection, SubSection } from './types';
import { backendFetch } from '../lookup/lookup';

export interface Conflicts {
  main_sections: [MainSection, MainSection][];
  sub_sections: [SubSection, SubSection][];
  flashcards: [FlashCard, FlashCard][];
}

interface RenderConflictsProps {
  conflicts: Conflicts;
  setConflicts: React.Dispatch<React.SetStateAction<Conflicts | undefined>>
}
export default function RenderConflicts({ conflicts, setConflicts }: RenderConflictsProps) {
  const resolveConflict = async (
    action: 'ACCEPT' | 'KEEP',
    data:
      | { type: 'MAIN_SECTION', mainSections: [MainSection, MainSection] }
      | { type: 'SUB_SECTION', subSections: [SubSection, SubSection] }
      | { type: 'FLASHCARD', flashcards: [FlashCard, FlashCard] }
  ) => {
    if (!conflicts) return;
    let newConflicts: Conflicts;

    switch (data.type) {
      case 'MAIN_SECTION':
        if (action === 'ACCEPT')
          await backendFetch('POST', 'sharing_system/resolve/', {
            model_type: 'MAIN_SECTION',
            main_section_origin_id: data.mainSections[0].id,
            main_section_destination_id: data.mainSections[1].id,
          });

        // Remove main section from conflict
        newConflicts = conflicts;
        newConflicts.main_sections = newConflicts.main_sections.filter(
          ([, dest]) => dest.id !== data.mainSections[1].id
        );
        setConflicts({...newConflicts});
        break;
      case 'SUB_SECTION':
        if (action === 'ACCEPT')
          await backendFetch('POST', 'sharing_system/resolve/', {
            model_type: 'SUB_SECTION',
            sub_section_origin_id: data.subSections[0].id,
            sub_section_destination_id: data.subSections[1].id,
          });


        // Remove sub section from conflict
        newConflicts = conflicts;
        newConflicts.sub_sections = newConflicts.sub_sections.filter(
          ([, dest]) => dest.id !== data.subSections[1].id
        );
        setConflicts({...newConflicts});
        break;
      case 'FLASHCARD':
        if (action === 'ACCEPT')
          await backendFetch('POST', 'sharing_system/resolve/', {
            model_type: 'FLASHCARD',
            flashcard_origin_id: data.flashcards[0].id,
            flashcard_destination_id: data.flashcards[1].id,
          });


        // Remove flashcard from conflict
        newConflicts = conflicts;
        newConflicts.flashcards = newConflicts.flashcards.filter(
          ([, dest]) => dest.id !== data.flashcards[1].id
        );
        setConflicts({...newConflicts});
    }

    // Reload when all conflicts have been resolved
    if (
      newConflicts.main_sections.length === 0 &&
      newConflicts.sub_sections.length === 0 &&
      newConflicts.flashcards.length === 0
    ) window.location.reload();
  }

  return (<>
    <p>Since you've made local edits to your deck, there was a conflict when pulling the new updates.</p>
    <p>Please manually decide whether to override or keep your local changes.</p>
    {conflicts.main_sections.length > 0 && <div>
      <h3>Main Sections</h3>
      <hr />
      {conflicts.main_sections.map(([mainSectionOrigin, mainSectionDestination]) => <Row key={mainSectionOrigin.id}>
        <Col md={6} xs={12} className='right-separator'>
          <p className='text-center'><strong>Incoming Updated Main Section</strong></p>
          <p>Title: {mainSectionOrigin.data.title}</p>
          <p>Description: {mainSectionOrigin.data.description}</p>
          <div className='text-center'>
            <LoadingButton
              clickFunc={() => resolveConflict(
                'ACCEPT',
                {
                  type: 'MAIN_SECTION',
                  mainSections: [mainSectionOrigin, mainSectionDestination],
                },
              )}
            >
              Accept Incoming Update
            </LoadingButton>
          </div>
        </Col>
        <Col md={6} xs={12}>
          <p className='text-center'><strong>Your Current Main Section</strong></p>
          <p>Title: {mainSectionDestination.data.title}</p>
          <p>Description: {mainSectionDestination.data.description}</p>
          <div className='text-center'>
            <LoadingButton
              clickFunc={() => resolveConflict(
                'KEEP',
                {
                  type: 'MAIN_SECTION',
                  mainSections: [mainSectionOrigin, mainSectionDestination],
                },
              )}
            >
              Keep Local Changes
            </LoadingButton>
          </div>
        </Col>
      </Row>)}
    </div>}
    {conflicts.sub_sections.length > 0 && <div>
      <h3 className='mt-5'>Sub Sections</h3>
      <hr />
      {conflicts.sub_sections.map(([subSectionOrigin, subSectionDestination]) => <Row key={subSectionOrigin.id}>
        <Col md={6} xs={12} className='right-separator'>
          <p className='text-center'><strong>Incoming Updated Sub Section</strong></p>
          <p>Title: {subSectionOrigin.data.title}</p>
          <p>Description: {subSectionOrigin.data.description}</p>
          <div className='text-center'>
            <LoadingButton
              clickFunc={() => resolveConflict(
                'ACCEPT',
                {
                  type: 'SUB_SECTION',
                  subSections: [subSectionOrigin, subSectionDestination],
                },
              )}
            >
              Accept Incoming Update
            </LoadingButton>
          </div>
        </Col>
        <Col md={6} xs={12}>
          <p className='text-center'><strong>Your Current Sub Section</strong></p>
          <p>Title: {subSectionDestination.data.title}</p>
          <p>Description: {subSectionDestination.data.description}</p>
          <div className='text-center'>
            <LoadingButton
              clickFunc={() => resolveConflict(
                'KEEP',
                {
                  type: 'SUB_SECTION',
                  subSections: [subSectionOrigin, subSectionDestination],
                },
              )}
            >
              Keep Local Changes
            </LoadingButton>
          </div>
        </Col>
      </Row>)}
    </div>}
    {conflicts.flashcards.length > 0 && <div>
      <h3 className='mt-5'>Flashcards</h3>
      <hr />
      {conflicts.flashcards.map(([flashcardOrigin, flashcardDestination], i) => <Row key={flashcardOrigin.id}>
        <Col md={6} xs={12} className='right-separator'>
          <p className='text-center'><strong>Incoming Updated Flashcard</strong></p>
          <RenderFlashcard flashcard={flashcardOrigin} orderNum={i} />
          <div className='text-center'>
            <LoadingButton
              clickFunc={() => resolveConflict(
                'ACCEPT',
                {
                  type: 'FLASHCARD',
                  flashcards: [flashcardOrigin, flashcardDestination],
                },
              )}
            >
              Accept Incoming Update
            </LoadingButton>
          </div>
        </Col>
        <Col md={6} xs={12}>
          <p className='text-center'><strong>Your Current Flashcard</strong></p>
          <RenderFlashcard flashcard={flashcardDestination} orderNum={i} />
          <div className='text-center'>
            <LoadingButton
              clickFunc={() => resolveConflict(
                'KEEP',
                {
                  type: 'FLASHCARD',
                  flashcards: [flashcardOrigin, flashcardDestination],
                },
              )}
            >
              Keep Local Changes
            </LoadingButton>
          </div>
        </Col>
      </Row>)}
    </div>}
  </>);
}
