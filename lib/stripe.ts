import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY)
  throw new Error("`STRIPE_SECRET_KEY` not configured in .env");

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
  telemetry: false,
});

export default stripe;
