import Col from 'react-bootstrap/Col';
import IconTooltip from './buttons/IconTooltip';
import Row from 'react-bootstrap/Row';
import { FlashCard, FlashCardData } from './types';
import { RenderRichText } from '../utils';
import { apiObjectDelete, apiObjectRearrange } from '../lookup/lookup';
import { useCallback, useMemo } from 'react';

export type FlashCardEvent =
  | { action: 'DELETE', flashcardId: string }
  | { action: 'MOVE_UP', flashcardId: string, orderNum: number }
  | { action: 'MOVE_DOWN', flashcardId: string, orderNum: number }

interface RenderFlashcardProps {
  flashcard: FlashCard;
  dispatchFlashcards?: React.Dispatch<FlashCardEvent>;
  deckId?: number;
  orderNum?: number;
  numFlashcards?: number;
}
export default function RenderFlashcard({ flashcard, deckId, dispatchFlashcards, orderNum, numFlashcards }: RenderFlashcardProps) {
  const deleteFlashcard = useCallback(async (e, flashcardId: string) => {
    e.stopPropagation();
    if (!dispatchFlashcards || !window.confirm('Are you sure you want do delete this flashcard?')) return;
    await apiObjectDelete<FlashCard>('decks', 'flashcard', flashcardId).then(() =>
      dispatchFlashcards({ action: 'DELETE', flashcardId }),
    );
  }, [dispatchFlashcards]);

  const rearrangeFlashcard = useCallback(async (e, direction: 'UP' | 'DOWN', flashcardId: string, orderNum: number) => {
    e.stopPropagation();
    if (!dispatchFlashcards) return;
    await apiObjectRearrange('decks', 'flashcard', flashcard.id, direction).then(() =>
      dispatchFlashcards({ action: `MOVE_${direction}`, flashcardId, orderNum }),
    );
  }, [dispatchFlashcards, flashcard]);

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
            {(!isNaN(orderNum as number) || flashcard.order_num) && <span>
              Flashcard #{(orderNum ?? flashcard.order_num) + 1}{' '}
            </span>}
            {/* @ts-expect-error */}
            {flashcard.ease && <span>Ease: {flashcard.ease}</span>}
            {deckId && <span>
              <IconTooltip
                tooltip='Delete Flashcard'
                onClick={e => deleteFlashcard(e, flashcard.id)}
                faClass='fas fa-trash-alt'
                className='float-right'
                style={{ transform: 'translateY(4px)'}}
                id={`delete-flashcard-${flashcard.id}`}
              />
              {flashcard.order_num !== numFlashcards && <IconTooltip
                tooltip='Move Down'
                onClick={e => rearrangeFlashcard(e, 'DOWN', flashcard.id, flashcard.order_num)}
                faClass='fas fa-caret-down'
                className='float-right mr-2'
                style={{ transform: 'translateY(4px)'}}
                id={`move-down-flashcard-${flashcard.id}`}
              />}
              {flashcard.order_num !== 0 && <IconTooltip
                tooltip='Move Up'
                onClick={e => rearrangeFlashcard(e, 'UP', flashcard.id, flashcard.order_num)}
                faClass='fas fa-caret-up'
                className='float-right mr-2'
                style={{ transform: 'translateY(4px)'}}
                id={`move-up-flashcard-${flashcard.id}`}
              />}
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
