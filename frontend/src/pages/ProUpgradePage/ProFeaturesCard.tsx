import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Displays a fancy card with features included with pro mode
 */
export default function ProFeaturesCard() {
  return (
    <div className='pro-card pro-card-pro'>
      <div className='pro-card-head'>
        <h3>Pro</h3>
        <p>$3/mo or $30/yr</p>
      </div>
      <div className='pro-card-body'>
        <ul>
          <li className='check'><FontAwesomeIcon icon={faCheck} />Personalized spaced repetition flashcards</li>
          <li className='check'><FontAwesomeIcon icon={faCheck} />Rich text formatting</li>
          <li className='check'><FontAwesomeIcon icon={faCheck} />Upload custom images</li>
          <li className='check'><FontAwesomeIcon icon={faCheck} />No ads</li>
          <li className='check'><FontAwesomeIcon icon={faCheck} />Study with games</li>
          <li className='check'><FontAwesomeIcon icon={faCheck} />Identify difficult flashcards and topics</li>
          <li className='check'><FontAwesomeIcon icon={faCheck} />Create links between flashcards</li>
          <li className='check'><FontAwesomeIcon icon={faCheck} />Unlimited flashcards</li>
          <li className='check'><FontAwesomeIcon icon={faCheck} />Support Alu and free education</li>
        </ul>
      </div>
    </div>
  );
}