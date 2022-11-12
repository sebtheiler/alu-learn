import ProFeaturesCard from "./ProFeaturesCard";
import ProFromOrganization from "./ProFromOrganization";
import styles from "./ProUpgradePage.module.scss";
import UpgradeSuccess from "./UpgradeSuccess";
import AsyncButton from "@/atoms/AsyncButton";
import Button from "@/atoms/Button";
import CreateStripeSession from "@/graphql/CreateStripeSession";
import SEO from "@/helpers/SEO";
import classNames from "@/helpers/classNames";
import useGlobalModalStore from "@/stores/globalModalStore";
import type {
  Mutation,
  MutationCreateStripeSessionArgs,
  StripeItem,
} from "@/types";
import { useMutation } from "@apollo/client";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface ProUpgradePageProps {
  proTrialExpires: string;
  isProFromOrg: boolean;
  isPro: boolean;
  isSignedIn: boolean;
}

export default function ProUpgradePage({
  isProFromOrg,
  isPro,
  isSignedIn,
}: ProUpgradePageProps) {
  const { setRegisterModalOpen } = useGlobalModalStore();
  const [createStripeSession] = useMutation<
    { createStripeSession: Mutation["createStripeSession"] },
    MutationCreateStripeSessionArgs
  >(CreateStripeSession);

  const purchase = (purchaseType: "MONTHLY" | "YEARLY") => {
    return async () => {
      const { data } = await createStripeSession({
        variables: {
          item: `pro${purchaseType}` as StripeItem,
        },
      });

      if (data && data.createStripeSession) {
        window.location.href = data.createStripeSession;
      }
    };
  };

  if (isProFromOrg) return <ProFromOrganization />;
  if (isPro) {
    return <UpgradeSuccess />;
  }

  return (
    <>
      <SEO
        title="Pro"
        path="/pro"
        description="Upgrade to Alu Pro to gain access to Alu's next-level flashcard and studying features, including games, special tools, and more"
      />
      <div className="container mx-auto mt-28 max-w-6xl px-20">
        <div className="prose mx-auto text-center">
          <h1 className="mb-0">Take Studying to the Next Level</h1>
          <p className="mb-1">
            Gain access to Alu&apos;s most powerful features
          </p>
        </div>
        <div className="mt-10 grid grid-cols-12">
          <div className={classNames(styles.proCard, styles.proCardBasic)}>
            <div className={styles.proCardHead}>
              <h3>Basic</h3>
              <h4>Free</h4>
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
                <li className={styles.xmark}>
                  <FontAwesomeIcon icon={faXmark} />
                  No ads
                </li>
                <li className={styles.xmark}>
                  <FontAwesomeIcon icon={faXmark} />
                  Study with games
                </li>
                <li className={styles.xmark}>
                  <FontAwesomeIcon icon={faXmark} />
                  Identify difficult flashcards and topics
                </li>
                <li className={styles.xmark}>
                  <FontAwesomeIcon icon={faXmark} />
                  Create links between flashcards
                </li>
                <li className={styles.xmark}>
                  <FontAwesomeIcon icon={faXmark} />
                  Unlimited flashcards
                </li>
              </ul>
            </div>
          </div>
          <ProFeaturesCard />
        </div>
        <div className="mt-8 text-center">
          <div className="w-100 text-center">
            {!isSignedIn ? (
              <>
                <Button onClick={() => setRegisterModalOpen(true)} block>
                  Start Studying Efficiently
                </Button>
              </>
            ) : (
              <>
                <AsyncButton onClick={purchase("MONTHLY")} block>
                  Upgrade to Pro ($4.99/mo)
                </AsyncButton>
                <AsyncButton
                  onClick={purchase("YEARLY")}
                  block
                  className="mt-2"
                >
                  Upgrade to Pro ($3.99/mo, billed yearly as $47.88)
                </AsyncButton>
              </>
            )}
            <p className="font-bold my-3">7-day free trial. Cancel anytime.</p>
          </div>
        </div>
      </div>
    </>
  );
}
