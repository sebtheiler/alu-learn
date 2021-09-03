import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { capitalize, RenderRichText } from '../../utils';
import { FlashCard } from '../types';

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
            <span>Flashcard #{flashcard.order_num + 1}: {capitalize(flashcard.flashcard_type)}</span>
            <span className='float-right'>{flashcard.tags}</span>
          </Col>
        </Row>
        <Row className='flashcard-body'>
          {flashcard.fields.map((field, i) =>
            <Col
              md={12/flashcard.fields.length}
              className={'flashcard-field' + (i !== flashcard.fields.length - 1 ? ' divider' : '')}
              key={i}
            >
              <div className='text'>
                <RenderRichText text={field} />
              </div>
              <div className='images'>
                {i === 0 && flashcard.front_image && <img
                  src={flashcard.front_image}
                  alt='Flashcard attached front'
                />}
                {i === 1 && flashcard.back_image && <img
                  src={flashcard.back_image}
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