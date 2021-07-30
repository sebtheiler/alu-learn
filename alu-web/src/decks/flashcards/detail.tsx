import React, { useState, useMemo, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { QuestionBubble, FormCheckbox, has } from '../../utils';
import { createFullEditor, FullEditor } from '../../notes/editor-components';
import { Slate } from 'slate-react';
import './detail.css';
import { ReviewInstance, FlashCard } from '../types';
import { apiObjectDelete, apiObjectEdit } from '../../lookup/lookup';


interface RenderFlashCardTextProps {
  flashcard: FlashCard;
  fixSlateLazy: boolean;
};
export function RenderFlashCardText(props: RenderFlashCardTextProps) {
  const { flashcard, fixSlateLazy } = props;

  const [frontValue, setFrontValue] = useState(flashcard.fields[0]);
  const frontEditor = useMemo(
    () => createFullEditor(),
    []
  );
  const [backValue, setBackValue] = useState(flashcard.fields.length > 1 && flashcard.fields[1]);
  const backEditor = useMemo(
    () => createFullEditor(),
    []
  );
 
  useEffect(() => {
    try {
      if (fixSlateLazy) {
        // Slate is lazy and won't automatically update the editor when the flashcard
        // prop is changed, so we manually have to check if it has changed
        // The frontValue dependency is excluded on purpose - including it causes infinite loop
        if (
          flashcard.fields[0] !== frontValue ||
          (
            flashcard.fields.length > 1 &&
            flashcard.fields[1] !== backValue
          )
        ) {
          setFrontValue(flashcard.fields[0]);
          setBackValue(flashcard.fields.length > 1 ? flashcard.fields[1] : []);
        }
      }
    } catch (e) {
      console.log(e);
    }
    // eslint-disable-next-line
  }, [flashcard]);

  try {
      switch (flashcard.flashcard_type) {
      case 'basic': case 'reversed': // two-sided
        return (<>
          <div className='col-md-6 text-center'>
            <Slate
              editor={frontEditor}
              value={frontValue}
              onChange={newValue => {
                setFrontValue(newValue);
              }}
            >
              <FullEditor
                editor={frontEditor}
                readOnly={true}
                styleOptions={{ showBorder: false, minHeight: '0px' }}
              />
            </Slate>
          </div>
          <div className='col-md-6 text-center'>
            {/*
            This check that `backValue` is available is essential.
            Without it, when `fixSlateLazy` is active and the flashcard changes
            from cloze to basic/reversed, `backValue` isn't created yet (it has to wait a render-cycle)
            so Slate throws an error.
            This took a long time to understand.
            */}
            {backValue && <Slate
              editor={backEditor}
              value={backValue}
              onChange={newValue => {
                setBackValue(newValue);
              }}
            >
              <FullEditor
                editor={backEditor}
                readOnly={true}
                styleOptions={{ showBorder: false, minHeight: '0px' }}
              />
            </Slate>}
          </div>
        </>);
      case 'cloze': // one-sided
        return (
          <div className='col-md-12 text-center'>
            <Slate
              editor={frontEditor}
              value={frontValue}
              onChange={newValue => {
                setFrontValue(newValue);
              }}
            >
              <FullEditor
                editor={frontEditor}
                readOnly={true}
                styleOptions={{ showBorder: false, minHeight: '0px' }}
              />
            </Slate>
          </div>
        );
      default:
        return (
          <div className='col-md-12 text-center'>
            <strong>Invalid flashcard type "{flashcard.flashcard_type}". Please report this issue.</strong>
          </div>
        );
    }
  } catch (e) {
    console.log(e);
    return <p>An error occured.  Please report this.</p>
  }
}


// Display an individual flashcard
// TODO: redo this function completely
// interface FlashCardProps {
//   flashcard: ReviewInstance | FlashCard;
//   number: number;
//   showParentDeckTitle?: boolean;
//   suspendCallback(): void;
//   deleteCallback(): void;
//   foreignUser?: boolean;
//   hideSuspend: boolean;
//   fixSlateLazy: boolean;
//   moveUp?(event): void;
//   moveDown?(event): void;
//   onChecked?(event): void;
//   showButtons?: boolean;
// }
// export function RenderFlashCard(props: FlashCardProps) {
//   const {flashcard, number, showParentDeckTitle, suspendCallback, deleteCallback, foreignUser, hideSuspend, fixSlateLazy, moveUp, moveDown, onChecked, showButtons} = props;

//   const [deleteIsLoading, setDeleteIsLoading] = useState(false);
//   const [suspendIsLoading, setSuspendIsLoading] = useState(false);

//   const handleSuspend = event => {
//     event.preventDefault();

//     if (suspendIsLoading === false && has(flashcard, 'is_suspended')) {
//       setSuspendIsLoading(true);
//       apiObjectEdit('decks', 'reviewinstance', flashcard.id, {
//         is_suspended: !flashcard.is_suspended
//       }).then(() => {
//         flashcard.is_suspended = !flashcard.is_suspended;
//         suspendCallback();
//         setSuspendIsLoading(false);
//       });
//     }
//   }

//   const handleDelete = (event) => {
//     event.preventDefault();

//     if (deleteIsLoading === false) {
//       setDeleteIsLoading(true);
//       apiObjectDelete('decks', 'flashcard', flashcard.id)
//         .then(() => {
//           deleteCallback();
//           setDeleteIsLoading(false);
//         });
//     }
//   }

//   const flashcardSuspendedLeechClassName = () => {
//     if (foreignUser) return '';

//     let className = '';
//     if (has(flashcard, 'is_suspended') && flashcard.is_suspended) {
//       className += ' suspended';
//     } else if (has(flashcard, 'is_leech') && flashcard.is_leech) {
//       className += ' leech';
//     }

//     return className;
//   }

//   if (!flashcard) return null;
//   return (
//     <div
//       className={'container-fluid border my-3' + flashcardSuspendedLeechClassName()}
//     >
//       {onChecked &&
//         <div
//           className='float-left mt-3'
//           style={{ position: 'absolute', zIndex: 1000 }}
//         >
//           <FormCheckbox onChange={onChecked} />
//         </div>
//       }
//       <div className='row mt-3 text-center'>
//         <div className='col-md-12'>
//           <ButtonGroup style={{ right: '10px', display: 'inline-block', position: 'absolute' }}>
//             {moveUp && <Button
//               style={{
//                 background: 'none',
//                 border: 'none',
//                 float: 'right'
//               }}
//               tabIndex={-1}
//               onClick={moveUp}
//             >
//               <i className='fas fa-caret-up' style={{ padding: '0', color: '#001100' }} />
//             </Button>}
//             {moveDown && <Button
//               style={{
//                 background: 'none',
//                 border: 'none',
//                 float: 'right',
//               }}
//               tabIndex={-1}
//               onClick={moveDown}
//             >
//               <i className='fas fa-caret-down' style={{ padding: '0', color: '#001100' }} />
//             </Button>}
//           </ButtonGroup>
//           <p className='mb-0'>
//             <strong>Flashcard - #{number}</strong>
//             {has(flashcard, 'flashcard_type') && ` | Type: "${flashcard.flashcard_type}`}
//           </p>
//           {showParentDeckTitle && has(flashcard, 'parent_deck_title') && 
//             <small className='text-secondary'>
//               {has(flashcard, 'parent_deck_id') && <>
//                 From <a href={`/decks/${flashcard.parent_deck_id}/flashcards/`}>
//                     "{flashcard.parent_deck_title}"
//                 </a>
//               </>}
//             </small>
//           }
//           <p className={foreignUser ? 'd-none' : ''}>
//             <em className={(has(flashcard, 'is_leech') && flashcard.is_leech) ? '' : 'd-none'}>
//               This flashcard is a leech{' '}
//               <QuestionBubble>
//                 A leech is a card that you've repeatedly struggled to learn.
//                 You should give this card special attention, such as rewording the question, or reviewing the material.
//                 You can learn more [here](/help/leeches/).
//               </QuestionBubble>
//               <br />
//             </em>
//             <em className={(has(flashcard, 'is_suspended') && flashcard.is_suspended) ? '' : 'd-none'}>
//               This flashcard is suspended{' '}
//               <QuestionBubble>
//                 A suspended card will not be shown to you when you study this deck. Learn more [here](/help/suspended/).
//               </QuestionBubble>
//               <br />
//             </em>
//           </p>
//         </div>
//       </div>
//       <div className='row'>
//         <RenderFlashCardText flashcard={flashcard} fixSlateLazy={fixSlateLazy} />
//       </div>
//       <div className='text-center mx-auto w-50' style={{ wordWrap: 'break-word' }}>
//         {flashcard.tags &&
//           <p>
//             Tags: <br />
//             {flashcard.tags}
//           </p>
//         }
//       </div>
//       {!foreignUser && showButtons &&
//         <div className='col-md-12 mb-3 text-center'>
//           <div className='btn-group'>
//             <Button
//               href={
//                 `/decks/${flashcard.parent_deck_id}/flashcards/${flashcard.flashcard_num}/edit/`
//               }
//               variant='primary'
//             >
//               Edit
//             </Button>
//             {!hideSuspend &&
//               <Button
//                 onClick={handleSuspend}
//                 variant='primary'
//                 className='ml-1'
//               >
//                 {(suspendIsLoading) ?
//                   (has(flashcard, 'is_suspended') && flashcard.is_suspended ? 'Unsuspending...' : 'Suspending...')
//                   :
//                   (has(flashcard, 'is_suspended') && flashcard.is_suspended ? 'Unsuspend' : 'Suspend')
//                 }
//               </Button>
//             }
//             <Button onClick={handleDelete} variant='danger' className='ml-1'>
//               {deleteIsLoading ? 'Deleting...' : 'Delete'}
//             </Button>
//           </div>
//         </div>
//       }
//     </div>
//   );
// }
