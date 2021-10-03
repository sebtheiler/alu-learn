import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { RenderRichText } from '../utils';
import { FlashCard } from './types';

export default function RenderFlashcard({ flashcard, deckId }: { flashcard: FlashCard, deckId?: number }) {
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
            <span className='float-right'>{flashcard.data?.tags}</span>
          </Col>
        </Row>
        <Row className='flashcard-body'>
          {flashcard.data?.fields?.map((field, i) =>
            <Col
              md={12/(flashcard.data?.fields?.length ?? 2)}
              className='flashcard-field'
              key={i}
            >
              <div className={'text' + (i !== (flashcard.data?.fields?.length ?? 2) - 1 ? ' divider' : '')}>
                <RenderRichText text={field} />
              </div>
              <div className='images'>
                {i === 0 && flashcard.data?.front_image && <img
                  src={flashcard.data?.front_image}
                  alt='Flashcard attached front'
                />}
                {i === 1 && flashcard.data?.back_image && <img
                  src={flashcard.data?.back_image}
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