import ProFeaturesCard from "./ProFeaturesCard";
import ProFromOrganization from "./ProFromOrganization";
import styles from "./ProUpgradePage.module.scss";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AsyncButton from "atoms/AsyncButton";
import Button from "atoms/Button";
import SEO from "helpers/SEO";
import classNames from "helpers/classNames";
import daysBetween from "helpers/daysBetween";
import { useRouter } from "next/router";
import useGlobalModalStore from "stores/globalModalStore";

export interface ProUpgradePageProps {
  proTrialExpires: string;
  isProFromOrg: boolean;
  isPro: boolean;
  isSignedIn: boolean;
}

export default function ProUpgradePage({
  proTrialExpires,
  isProFromOrg,
  isPro,
  isSignedIn,
}: ProUpgradePageProps) {
  const router = useRouter();
  const { setRegisterModalOpen } = useGlobalModalStore();
  // const [stripe, setStripe] = useState<Stripe | null>(null);
  // useAsyncState<{ publishableKey: string }>(
  //   () => backendFetch('GET', 'accounts/stripe-config/'), [],
  //   publishableKey => {
  //     loadStripe(publishableKey.publishableKey).then(
  //       stripe => setStripe(stripe),
  //     );
  //   }
  // );

  const purchase = (purchaseType: "monthly" | "yearly") => {
    // if (!stripe) return async () => {};
    // return async () => {
    //   await backendFetch<{ sessionId: string }>(
    //     'POST', 'accounts/stripe-create-checkout-session/', { purchaseType },
    //   ).then(
    //     ({ sessionId }) => stripe.redirectToCheckout({ sessionId }),
    //   );
    // }
    return async () => {
      console.log(purchaseType);
    };
  };

  const expiresInDays = Math.floor(daysBetween(new Date(), proTrialExpires));

  if (isProFromOrg) return <ProFromOrganization />;
  if (isPro && !proTrialExpires) {
    router.push("/pro/success");
    return <p>Redirecting...</p>;
  }

  return (
    <>
      <SEO
        title="Pro"
        path="/pro"
        // description=""  TODO: (SEO) set description
      />
      <div className="container mx-auto mt-28 max-w-6xl px-20">
        <div className="prose mx-auto text-center">
          <h1 className="mb-0">Take Studying to the Next Level</h1>
          <p className="mb-1">
            Gain access to Alu&apos;s most powerful features
          </p>
          {proTrialExpires && (
            <p className="mt-0">
              Your free-trial of Alu Pro ends in{" "}
              <strong>{expiresInDays} days.</strong> Upgrade now to make it
              permanent.
            </p>
          )}
        </div>
        <div className="mt-10 grid grid-cols-12">
          <div className={classNames(styles.proCard, styles.proCardBasic)}>
            <div className={styles.proCardHead}>
              <h3>Basic</h3>
              <p>Free</p>
            </div>
            <div className={styles.proCardBody}>
              <ul>
                <li className="check">
                  <FontAwesomeIcon icon={faCheck} />
                  Personalized spaced repetition flashcards
                </li>
                <li className="check">
                  <FontAwesomeIcon icon={faCheck} />
                  Rich text formatting
                </li>
                <li className="check">
                  <FontAwesomeIcon icon={faCheck} />
                  Upload custom images
                </li>
                <li className="xmark">
                  <FontAwesomeIcon icon={faXmark} />
                  No ads
                </li>
                <li className="xmark">
                  <FontAwesomeIcon icon={faXmark} />
                  Study with games
                </li>
                <li className="xmark">
                  <FontAwesomeIcon icon={faXmark} />
                  Identify difficult flashcards and topics
                </li>
                <li className="xmark">
                  <FontAwesomeIcon icon={faXmark} />
                  Create links between flashcards
                </li>
                <li className="xmark">
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
                <AsyncButton onClick={purchase("monthly")} block>
                  Upgrade to Pro ($3/mo)
                </AsyncButton>
                <AsyncButton
                  onClick={purchase("yearly")}
                  block
                  className="mt-2"
                >
                  Upgrade to Pro ($30/yr)
                </AsyncButton>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
