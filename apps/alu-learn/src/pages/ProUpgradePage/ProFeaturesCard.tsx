import styles from "./ProUpgradePage.module.scss";
import classNames from "helpers-lib/src/classNames";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * Displays a fancy card with features included with pro mode
 */
export default function ProFeaturesCard() {
  return (
    <div className={classNames(styles.proCard, styles.proCardPro)}>
      <div className={styles.proCardBorder} />
      <div className={styles.proCardMiddle}>
        <div className={styles.proCardInner}>
          <div className="bg-alu-dark-purple p-3">
            <h3 className="text-white text-xl font-bold">Pro</h3>
            <h4 className="text-white text-lg">$4.99/mo</h4>
          </div>
          <div className="p-3">
            <ul>
              <li className={styles.check}>
                <FontAwesomeIcon icon={faCheck} />
                Personalized spaced repetition flashcards
              </li>
              <li className={styles.check}>
                <FontAwesomeIcon icon={faCheck} />
                Rich text formatting
              </li>
              <li className={styles.check}>
                <FontAwesomeIcon icon={faCheck} />
                Upload custom images
              </li>
              <li className={styles.check}>
                <FontAwesomeIcon icon={faCheck} />
                Automatically generate 500+ flashcards per month using AI
              </li>
              <li className={styles.check}>
                <FontAwesomeIcon icon={faCheck} />
                Get automatic feedback and grades on your essays
              </li>
              <li className={styles.check}>
                <FontAwesomeIcon icon={faCheck} />
                No ads
              </li>
              <li className={styles.check}>
                <FontAwesomeIcon icon={faCheck} />
                Study with games
              </li>
              <li className={styles.check}>
                <FontAwesomeIcon icon={faCheck} />
                Identify difficult flashcards and topics
              </li>
              <li className={styles.check}>
                <FontAwesomeIcon icon={faCheck} />
                Create links between flashcards
              </li>
              <li className={styles.check}>
                <FontAwesomeIcon icon={faCheck} />
                Unlimited flashcards
              </li>
              <li className={styles.check}>
                <FontAwesomeIcon icon={faCheck} />
                Support Alu and free education
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
