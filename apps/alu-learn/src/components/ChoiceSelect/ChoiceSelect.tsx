import classNames from "helpers-lib/src/classNames";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

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
  shuffledChoices = shuffledChoices.filter((c) => c.value !== "OTHER");
  if (includeOther) {
    shuffledChoices.push({
      value: "OTHER",
      display: "Other",
      icon: faEllipsis,
    });
  }

  // Workaround for specifying custom number of columns
  const cols = numCols ?? Math.min(shuffledChoices.length, 3);

  return (
    <div
      className={classNames(
        "grid grid-cols-1 text-center md:grid-cols-2",
        cols === 3 && "lg:grid-cols-3",
        cols === 4 && "lg:grid-cols-4"
      )}
    >
      {shuffledChoices.map((choice, i) => (
        <div className="p-3 text-center" key={i}>
          <div
            onClick={() => onClick(choice.value)}
            role="button"
            className="flex h-48 grow flex-col overflow-hidden rounded-xl border-4 border-alu-mid-gray bg-alu-light-gray p-5 hover:bg-alu-light-gray-darker"
          >
            {choice.icon && (
              <div>
                {typeof choice.icon === "string" ? (
                  <Image
                    src={choice.icon}
                    alt={`${choice.display} logo`}
                    className="mx-auto w-20"
                    width={90}
                    height={90}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={choice.icon}
                    size="5x"
                    style={{ color: choice.iconColor }}
                  />
                )}
                <hr className="my-3" />
              </div>
            )}
            <div className="flex grow items-center">
              <p className="mx-auto text-xl font-semibold">{choice.display}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
