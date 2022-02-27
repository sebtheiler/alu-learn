import './ChoiceSelect.scss';

interface Choice {
  value: any;
  display: string;
}
interface ChoiceSelectProps {
  choices: Choice[];
  onClick: (response: any) => void;
}
export default function ChoiceSelect({ choices, onClick }: ChoiceSelectProps) {
  return (
    <div className='choice-select'>
      {choices.map(choice =>
        <div className='choice-selection' onClick={() => onClick(choice.value)} key={choice.value}>
          {choice.display}
        </div>
      )}
    </div>
  );
}