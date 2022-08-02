import LinkButton from "atoms/LinkButton";
import SEO from "helpers/SEO";
import ProFeaturesCard from "pages/ProUpgradePage/ProFeaturesCard";

export default function ProUpgradeSuccessPage() {
  // const [subscriptionProduct] = useAsyncState<{ subscription: any, product: any }>(
  //   () => backendFetch('GET', 'accounts/stripe-get-subscription/'),
  // );

  return (
    <>
      <SEO title="Upgrade Success" path="/pro/success" noindex />
      <div className="container mx-auto mt-28 text-center">
        <div className="prose mx-auto max-w-2xl">
          <h1>Thank You for Upgrading to Alu Pro!</h1>
          <p>
            You&apos;ve just improved your Alu experience while supporting free
            education!
          </p>
          <p>
            Your payment is being processed and might take a couple of minutes
            to complete
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
        <div className="mx-auto mt-10 max-w-lg text-left">
          <ProFeaturesCard />
        </div>
      </div>
    </>
  );
}
