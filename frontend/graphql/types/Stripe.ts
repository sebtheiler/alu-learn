import { ApolloError } from "apollo-server-micro";
import getUserGQL from "helpers/getUserGQL";
import stripe from "lib/stripe";
import { enumType, extendType, nonNull } from "nexus";

export const StripeMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createStripeSession", {
      type: "String",
      description: "Creates a Stripe session for purchasing an item",
      args: {
        item: nonNull(StripeItem),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx, { id: true });
        if (!user) return null;

        const itemPriceId = stripeItems.get(args.item);
        if (!itemPriceId) throw new ApolloError("Invalid item");

        const stripeSession = await stripe.checkout.sessions.create({
          client_reference_id: user.id,
          payment_method_types: ["card"],
          mode: "subscription",
          line_items: [
            {
              price: itemPriceId,
              quantity: 1,
            },
          ],
          success_url: `${process.env.SERVER_URL}/pro/success`,
          cancel_url: `${process.env.SERVER_URL}/pro/cancelled`,
        });

        return stripeSession.url;
      },
    });
  },
});

export const StripeItem = enumType({
  name: "StripeItem",
  description: "A purchasable item to buy with Stripe",
  members: ["proMONTHLY", "proYEARLY"],
});

const stripeItems = new Map([
  ["proMONTHLY", process.env.STRIPE_MONTHLY_PRO_ID],
  ["proYEARLY", process.env.STRIPE_YEARLY_PRO_ID],
]);
