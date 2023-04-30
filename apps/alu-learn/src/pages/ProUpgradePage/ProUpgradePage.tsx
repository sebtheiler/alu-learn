import ProFeaturesCard from "./ProFeaturesCard";
import ProFromOrganization from "./ProFromOrganization";
import styles from "./ProUpgradePage.module.scss";
import UpgradeSuccess from "./UpgradeSuccess";
import AsyncButton from "alu-ui/src/AsyncButton";
import Button from "alu-ui/src/Button";
// import CopyLink from "@/components/CopyLink";
import CreateStripeSession from "graphql-operations/operations/CreateStripeSession";
import SEO from "@/helpers/SEO";
import classNames from "helpers-lib/src/classNames";
// import generateReferralLink from "@/helpers/generateReferralLink";
import useGlobalModalStore from "@/stores/globalModalStore";
// import useMeStore from "@/stores/meStore";
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

const PRO_TRIAL_DAYS = parseInt(
  process.env.NEXT_PUBLIC_ALU_PRO_TRIAL_DAYS ?? "7"
);

export default function ProUpgradePage({
  isProFromOrg,
  isPro,
  proTrialExpires,
  isSignedIn,
}: ProUpgradePageProps) {
  const { setRegisterModalOpen } = useGlobalModalStore();
  const [createStripeSession] = useMutation<
    { createStripeSession: Mutation["createStripeSession"] },
    MutationCreateStripeSessionArgs
  >(CreateStripeSession);

  // const username = useMeStore((state) => state.me?.username);

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
  if (isPro && !proTrialExpires) return <UpgradeSuccess />;

  return (
    <>
      <SEO
        title="Pro"
        path="/pro"
        description="Upgrade to Alu Pro to gain access to Alu's next-level flashcard and studying features, including games, special tools, and more"
      />
      <div className="container mx-auto mt-28 max-w-6xl px-5">
        <div className="prose mx-auto text-center">
          <h1 className="mb-0">Take Studying to the Next Level</h1>
          <p className="mb-1">
            Gain access to Alu&apos;s most powerful features
          </p>
        </div>
        <div className="mt-10 flex flex-wrap">
          <div className="w-full md:w-4/5 lg:w-2/5 mx-auto">
            <div className={styles.proCard}>
              <div
                className={classNames(
                  styles.proCardBorder,
                  styles.proCardBorderBasic
                )}
              />
              <div className={styles.proCardMiddle}>
                <div className={styles.proCardInner}>
                  <div className="bg-alu-dark-purple p-3">
                    <h3 className="text-white text-xl font-bold">Basic</h3>
                    <h4 className="text-white text-lg">Free</h4>
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
                        50 automatically generated flashcards per month
                      </li>
                      <li className={styles.check}>
                        <FontAwesomeIcon icon={faCheck} />
                        Automatically generate 50 flashcards per month using AI
                      </li>
                      <li className={styles.xmark}>
                        <FontAwesomeIcon icon={faXmark} />
                        Get automatic feedback and grades on your essays
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
              </div>
            </div>
          </div>
          <div className="w-full xl:w-0 my-3 xl:my-0" />{" "}
          {/* Stupid hack to get the cards on a different line */}
          <div className="w-full md:w-4/5 lg:w-2/5 mx-auto">
            <ProFeaturesCard />
          </div>
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
            {PRO_TRIAL_DAYS > 0 && (
              <p className="font-bold my-3">
                {PRO_TRIAL_DAYS}-day free trial. Cancel anytime.
              </p>
            )}
            {/* <hr className="my-3" />
            <p className="mb-1">
              {proTrialExpires ? (
                <>
                  Your pro trial expires on{" "}
                  {new Date(proTrialExpires).toDateString()}. Extend it by
                  inviting more users.
                </>
              ) : (
                <>
                  Want <strong>free</strong> weeks of pro mode? Invite new users
                  with the link below.
                </>
              )}
            </p>
            <CopyLink
              link={generateReferralLink(username as string)}
              className="my-2 max-w-lg mx-auto"
            /> */}
          </div>
        </div>
      </div>
    </>
  );
}
