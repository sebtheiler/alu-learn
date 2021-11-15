import Col from 'react-bootstrap/Col';
import IconTooltip from './buttons/IconTooltip';
import Row from 'react-bootstrap/Row';
import { FlashCard, FlashCardData } from './types';
import { RenderRichText } from '../utils';
import { apiObjectDelete } from '../lookup/lookup';
import { useMemo } from 'react';

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
                {i === 0 && <RenderFlashcardImage data={flashcard.data} fieldNumber={0} />}
                {i === 1 && <RenderFlashcardImage data={flashcard.data} fieldNumber={1} />}
              </div>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
}

export function RenderFlashcardImage({ data, fieldNumber }: { data?: FlashCardData, fieldNumber: number }) {
  const img = useMemo(
    () => data?.images.filter(img => img.field_number === fieldNumber)[0],
    [data, fieldNumber],
  );

  if (!img) return null;
  return (<div className='image mb-2'>
    <img
      src={img.image}
      alt={`Flashcard attached ${fieldNumber}`}
    />
    <p className='w-100 text-center'>
      <small className='text-secondary'>
        {img.original_url
          ? <a
              href={img.original_url}
              target='_blank' rel='noreferrer'
              onClick={e => e.stopPropagation()}
            >
              {img.description}
            </a>
          : img.description
        }
      </small>
    </p>
  </div>);
}
