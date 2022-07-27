import type { NextPage } from "next";
import LinkButton from "components/LinkButton";
import ProFeaturesCard from "components/ProFeaturesCard";

const ProPurchaseSuccess: NextPage = () => {
  // const [subscriptionProduct] = useAsyncState<{ subscription: any, product: any }>(
  //   () => backendFetch('GET', 'accounts/stripe-get-subscription/'),
  // );

  return (
    <div className="container mx-auto text-center mt-28">
      <div className="prose max-w-2xl mx-auto">
        <h1>Thank You for Upgrading to Alu Pro!</h1>
        <p>
          You've just improved your Alu experience while supporting free
          education!
        </p>
        <p>
          Your payment is being processed and might take a couple of minutes to
          complete
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
      {/* {subscriptionProduct && subscriptionProduct.subscription.status === 'active' && <SubscriptionProduct
        subscription={subscriptionProduct.subscription}
        product={subscriptionProduct.product}
      />} */}
      <div className="max-w-lg mx-auto mt-10 text-left">
        <ProFeaturesCard />
      </div>
    </div>
  );
};

export default ProPurchaseSuccess;
