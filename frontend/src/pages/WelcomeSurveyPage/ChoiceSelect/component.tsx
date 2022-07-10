import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

import type { IconProp } from '@fortawesome/fontawesome-svg-core';

/**
 * Possible values for a choice in `ChoiceSelect`
 */
type ChoiceVal = string | boolean | number;

/**
 * Possible choices to be supplied to `ChoiceSelect`
 */
interface Choice {
  value: ChoiceVal;
  display: string;
  icon?: IconProp | string;
  iconColor?: string;
}

interface ChoiceSelectProps {
  /**
   * Choices to select from
   */
  choices: Choice[];
  /**
   * Function to call when a choice is clicked
   * @param value Value of the `Choice` clicked
   */
  onClick(value: ChoiceVal): void;
  /**
   * Shuffle the given `choices`
   */
  shuffle?: boolean;
  /**
   * Include an "Other" choice. Not affected by `shuffle`
   */
  includeOther?: boolean;
  /**
   * Manually specify the number of columns to render
   */
  numCols?: number;
}

/**
 * Renders a visual selection between a list of choices
 */
export default function ChoiceSelect({
  choices,
  onClick,
  shuffle,
  includeOther,
  numCols,
}: ChoiceSelectProps) {
  let shuffledChoices = shuffle
    ? choices.sort(() => 0.5 - Math.random())
    : choices;
  shuffledChoices = shuffledChoices.filter(c => c.value !== 'OTHER');
  if (includeOther) {
    shuffledChoices.push({
      value: 'OTHER',
      display: 'Other',
      icon: faEllipsis,
    });
  }

  // Workaround for specifying custom number of columns
  const cols = numCols ?? Math.min(shuffledChoices.length, 3);

  return (
    <div className={`text-center grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols}`}>
      {shuffledChoices.map((choice, i) =>
        <div className='p-3 text-center' key={i}>
          <div
            onClick={() => onClick(choice.value)}
            role='button'
            className='border-4 border-alu-mid-gray bg-alu-light-gray hover:bg-alu-light-gray-darker
                       rounded-xl p-5 h-48 overflow-hidden flex flex-col grow'
          >
            {choice.icon && <div>
              {typeof(choice.icon) === 'string'
                ? <img src={choice.icon} alt={`${choice.display} logo`} className='w-20 mx-auto' />
                : <FontAwesomeIcon icon={choice.icon} size='5x' style={{ color: choice.iconColor }} />
              }
              <hr className='my-3' />
            </div>}
            <div className='flex grow items-center'>
              <p className='text-xl font-semibold mx-auto'>{choice.display}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}