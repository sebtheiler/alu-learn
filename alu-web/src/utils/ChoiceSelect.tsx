import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import './ChoiceSelect.scss';

interface Choice {
  value: any;
  display: string;
  icon?: string;
  iconColor?: string;
}
interface ChoiceSelectProps {
  choices: Choice[];
  onClick: (response: any) => void;
  shuffle?: boolean;
  includeOther?: boolean;
}
export default function ChoiceSelect({ choices, onClick, shuffle, includeOther }: ChoiceSelectProps) {
  let shuffledChoices = shuffle ? choices.sort(() => 0.5 - Math.random()) : choices;
  if (includeOther)
    shuffledChoices.push({ value: 'OTHER', display: 'Other', icon: 'fa-solid fa-ellipsis' })

  return (
    <Row className='choice-select'>
      {shuffledChoices.map(choice =>
        <Col className='choice-col mx-auto' key={choice.value} md={3}>
          <div className='choice-selection' onClick={() => onClick(choice.value)}>
            {choice.icon && <>
              {choice.icon.includes('/')
                ? <img src={choice.icon} alt={`${choice.display} logo`} style={{ width: '80px', height: 'auto' }} />
                : <i className={`choice-select-icon ${choice.icon} fa-5x`} style={{ color: choice.iconColor }} />
              }
              <hr />
            </>}
            <p className='choice-select-text mb-0'>{choice.display}</p>
          </div>
        </Col>
      )}
    </Row>
  );
}