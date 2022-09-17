import styles from "./ProUpgradePage.module.scss";
import classNames from "@/helpers/classNames";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * Displays a fancy card with features included with pro mode
 */
export default function ProFeaturesCard() {
  return (
    <div className={classNames(styles.proCard, styles.proCardPro)}>
      <div className={styles.proCardHead}>
        <h3>Pro</h3>
        <p>$3/mo or $30/yr</p>
      </div>
      <div className={styles.proCardBody}>
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
  );
}
