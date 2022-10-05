import AsyncButton from "@/atoms/AsyncButton";
import Button from "@/atoms/Button";
import ButtonGroup from "@/atoms/ButtonGroup";
import LinkButton from "@/atoms/LinkButton";
import Modal from "@/atoms/Modal";
import CancelStripeSubscription from "@/graphql/CancelStripeSubscription";
import GetStripeSubscription from "@/graphql/GetStripeSubscription";
import RenewStripeSubscription from "@/graphql/RenewStripeSubscription";
import SEO from "@/helpers/SEO";
import ProFeaturesCard from "@/pages/ProUpgradePage/ProFeaturesCard";
import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import type Stripe from "stripe";

export default function UpgradeSuccess() {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const { data: subscriptionData, refetch } = useQuery(GetStripeSubscription);
  const [cancelStripeSubscription] = useMutation(CancelStripeSubscription);
  const [renewStripeSubscription] = useMutation(RenewStripeSubscription);
  const subscription: Stripe.Subscription | undefined =
    subscriptionData?.getStripeSubscription?.subscription;
  const plan: Stripe.Plan | undefined =
    subscriptionData?.getStripeSubscription?.plan;

  const cancelSubscription = async () => {
    await cancelStripeSubscription();
    refetch();
    setCancelModalOpen(false);
  };

  const renewSubscription = async () => {
    await renewStripeSubscription();
    refetch();
  };

  return (
    <>
      <SEO title="Upgrade Success" path="/pro" />
      <div className="container mx-auto mt-28 text-center">
        <div className="prose mx-auto max-w-2xl">
          <h1>Thank You for Upgrading to Alu Pro!</h1>
          <p>
            You&apos;ve just improved your Alu experience while supporting free
            education!
          </p>
          <p>
            If you ever have any questions, you can contact support at{" "}
            <a
              href="mailto:support@alulearn.com"
              className="text-blue-500 no-underline"
            >
              support@alulearn.com
            </a>
          </p>
          <LinkButton href="/home">Return Home</LinkButton>
        </div>
        <div className="mx-auto mt-10 max-w-lg text-left">
          <ProFeaturesCard />
        </div>
        {subscription && (
          <div className="my-3">
            <h3 className="text-2xl font-bold text-center mt-10">Info</h3>
            <p>{subscription.description}</p>
            <p>
              Price: ${(plan?.amount ?? 0) / 100} per {plan?.interval}
            </p>
            {subscription.status === "active" && (
              <p>
                Billing period ends:{" "}
                {new Date(
                  subscription.current_period_end * 1000
                ).toDateString()}
              </p>
            )}
            {subscription.status === "trialing" && (
              <p>
                Free trial ends:{" "}
                {new Date((subscription.trial_end ?? 0) * 1000).toDateString()}
              </p>
            )}
            <p className="text-center text-blue-500 underline mt-1">
              <a
                href={process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_LINK}
                target="_blank"
                rel="noreferrer nofollow"
              >
                Manage
              </a>
            </p>
            {subscription.cancel_at_period_end ? (
              <div className="mt-2">
                <p className="mb-2">You&apos;ve cancelled your subscription</p>
                <AsyncButton onClick={renewSubscription} variant="green">
                  Renew Subscription
                </AsyncButton>
              </div>
            ) : (
              <Button
                onClick={() => setCancelModalOpen(true)}
                variant="red"
                className="mt-10"
              >
                Cancel Subscription
              </Button>
            )}
            <Modal
              open={cancelModalOpen}
              close={() => setCancelModalOpen(false)}
              title="Cancel Subscription"
            >
              <p>
                Are you sure you want to cancel your Alu Pro subscription? You
                will lose your access to upgraded features after the billing
                period ends.
              </p>
              <ButtonGroup className="mt-5 text-center" fixedWidth="49%" spaced>
                <Button onClick={() => setCancelModalOpen(false)}>
                  Nevermind
                </Button>
                <AsyncButton
                  variant="red"
                  className="ml-auto"
                  onClick={cancelSubscription}
                >
                  Cancel Subscription
                </AsyncButton>
              </ButtonGroup>
            </Modal>
          </div>
        )}
      </div>
    </>
  );
}
