import AsyncButton from "components/AsyncButton";
import Button from "components/Button";
import GlobalContext from "global";
import ProFeaturesCard from "./ProFeaturesCard";
import ProFromOrganization from "./ProFromOrganization";
import ProPurchaseSuccessPage from "pages/ProPurchaseSuccessPage";
import daysBetween from "helpers/daysBetween";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";
import "./ProUpgradePage.scss";

interface ProUpgradePageProps {
  isPro: boolean;
  isProFromOrg: boolean;
  isLoggedIn: boolean;
  proTrialExpires?: string;
}

/**
 * Displays the page for a user to upgrade to pro-mode.
 * If the user already has pro, displays information about their subscription.
 */
export default function ProUpgradePage({
  isPro,
  isProFromOrg,
  isLoggedIn,
  proTrialExpires,
}: ProUpgradePageProps) {
  const { setSignUpModalOpen } = useContext(GlobalContext);
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
  if (isPro && !proTrialExpires) return <ProPurchaseSuccessPage />;

  return (
    <div className="container mx-auto px-20 mt-28 max-w-6xl">
      <div className="prose text-center mx-auto">
        <h1 className="mb-0">Take Studying to the Next Level</h1>
        <p className="mb-1">Gain access to Alu's most powerful features</p>
        {proTrialExpires && (
          <p className="mt-0">
            Your free-trial of Alu Pro ends in{" "}
            <strong>{expiresInDays} days.</strong> Upgrade now to make it
            permanent.
          </p>
        )}
      </div>
      <div className="grid grid-cols-12 mt-10">
        <div className="pro-card pro-card-basic">
          <div className="pro-card-head">
            <h3>Basic</h3>
            <p>Free</p>
          </div>
          <div className="pro-card-body">
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
        <div className="text-center w-100">
          {!isLoggedIn ? (
            <>
              <Button onClick={() => setSignUpModalOpen(true)} block>
                Get Started
              </Button>
            </>
          ) : (
            <>
              <AsyncButton onClick={purchase("monthly")} block>
                Upgrade to Pro ($3/mo)
              </AsyncButton>
              <AsyncButton onClick={purchase("yearly")} block className="mt-2">
                Upgrade to Pro ($30/yr)
              </AsyncButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
