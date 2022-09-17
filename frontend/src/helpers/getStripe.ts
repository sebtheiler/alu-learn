import { Stripe, loadStripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
  if (!stripePromise) {
    const NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY =
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      throw new Error("No Stripe publishable key in .env");
    stripePromise = loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export default getStripe;
