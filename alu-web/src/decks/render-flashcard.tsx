import Col from 'react-bootstrap/Col';
import IconTooltip from './buttons/IconTooltip';
import Row from 'react-bootstrap/Row';
import { FlashCard } from './types';
import { RenderRichText } from '../utils';
import { apiObjectDelete } from '../lookup/lookup';

// TODO: put this in a separate file
export type FlashCardEvent =
  | { action: 'DELETE', flashcardId: string }

interface RenderFlashcardProps {
  flashcard: FlashCard;
  dispatchFlashcards?: React.Dispatch<FlashCardEvent>;
  deckId?: number;
}
export default function RenderFlashcard({ flashcard, deckId, dispatchFlashcards }: RenderFlashcardProps) {
  const deleteFlashcard = async (e, flashcardId: string) => {
    e.stopPropagation();
    if (!dispatchFlashcards || !window.confirm('Are you sure you want do delete this flashcard?')) return;
    await apiObjectDelete<FlashCard>('decks', 'flashcard', flashcardId).then(() =>
      dispatchFlashcards({ action: 'DELETE', flashcardId: flashcardId }),
    );
  }

  return (
    <div
      role='button'
      onClick={deckId ? () => window.open(`/deck/${deckId}/flashcards/${flashcard.id}/edit/`) : undefined}
      key={flashcard.id}
    >
      <div
        className='flashcard-view'
        key={flashcard.id}
      >
        <Row className='flashcard-head'>
          <Col>
            <span>Flashcard #{flashcard.order_num + 1}</span>
            {deckId && <span>
              <IconTooltip
                tooltip='Delete Flashcard'
                onClick={e => deleteFlashcard(e, flashcard.id)}
                faClass='fas fa-trash-alt'
                className='float-right'
                style={{ transform: 'translateY(4px)'}}
                id={`delete-flashcard-${flashcard.id}`}
              />
            </span>}
            <span className='float-right mr-3'>{flashcard.data?.tags}</span>
          </Col>
        </Row>
        <Row className='flashcard-body'>
          {flashcard.data?.fields?.map((field, i) =>
            <Col
              md={12/(flashcard.data?.fields?.length ?? 2)}
              className={'flashcard-field' + (i !== (flashcard.data?.fields?.length ?? 2) - 1 ? ' divider' : '')}
              key={i}
            >
              <div className='text'>
                <RenderRichText text={field} />
              </div>
              <div className='images'>
                {i === 0 && flashcard.data?.images[0]?.image && <img
                  src={flashcard.data?.images[0]?.image}
                  alt='Flashcard attached front'
                />}
                {i === 1 && flashcard.data?.images[1]?.image && <img
                  src={flashcard.data?.images[1]?.image}
                  alt='Flashcard attached back'
                />}
              </div>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
}