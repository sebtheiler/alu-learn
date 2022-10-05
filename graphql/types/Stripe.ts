import { JSONData } from "./scalars";
import { ApolloError } from "apollo-server-micro";
import getUserGQL from "helpers/getUserGQL";
import stripe from "lib/stripe";
import { enumType, extendType, nonNull } from "nexus";

export const StripeQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("getStripeSubscription", {
      type: JSONData,
      description:
        "Gets the Stripe subscription and product for the current user",
      async resolve(_, __, ctx) {
        const user = await getUserGQL(ctx, { id: true });
        if (!user) return null;

        const stripeCustomer = await ctx.prisma.stripeCustomer.findUnique({
          where: {
            userId: user.id,
          },
          select: {
            stripeSubscriptionId: true,
          },
        });
        if (!stripeCustomer) return null;

        const subscription = await stripe.subscriptions.retrieve(
          stripeCustomer.stripeSubscriptionId
        );

        // @ts-ignore
        const planId = subscription.plan.id;
        const plan = await stripe.plans.retrieve(planId);

        return { subscription, plan };
      },
    });
  },
});

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
          subscription_data: {
            trial_period_days: 7,
          },
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/pro`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/pro`,
        });

        return stripeSession.url;
      },
    });
    t.field("cancelStripeSubscription", {
      type: "Boolean",
      description: "Cancels the Stripe subscription for the current user",
      async resolve(_parent, _args, ctx) {
        const user = await getUserGQL(ctx, { id: true });
        if (!user) return null;

        const stripeCustomer = await ctx.prisma.stripeCustomer.findUnique({
          where: {
            userId: user.id,
          },
          select: {
            stripeSubscriptionId: true,
          },
        });
        if (!stripeCustomer) return null;

        await stripe.subscriptions.update(stripeCustomer.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });

        return true;
      },
    });
    t.field("renewStripeSubscription", {
      type: "Boolean",
      description: "Renews the Stripe subscription for the current user",
      async resolve(_parent, _args, ctx) {
        const user = await getUserGQL(ctx, { id: true });
        if (!user) return null;

        const stripeCustomer = await ctx.prisma.stripeCustomer.findUnique({
          where: {
            userId: user.id,
          },
          select: {
            stripeSubscriptionId: true,
          },
        });
        if (!stripeCustomer) return null;

        await stripe.subscriptions.update(stripeCustomer.stripeSubscriptionId, {
          cancel_at_period_end: false,
        });

        return true;
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
