import prisma from "lib/prisma";
import stripe from "lib/stripe";
import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";

export const config = {
  api: { bodyParser: false },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const signature = req.headers["stripe-signature"] as string;
  const signingSecret = process.env.STRIPE_ENDPOINT_SECRET;
  if (!signingSecret)
    throw new Error("`STRIPE_ENDPOINT_SECRET` not configured in .env");
  const reqBuffer = await buffer(req); // https://egghead.io/lessons/next-js-subscribe-to-stripe-webhooks-using-next-js-api-routes

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(reqBuffer, signature, signingSecret);
  } catch (err) {
    console.log(err);
    return res.status(400).send(`Webhook error: ${(err as any).message}`);
  }

  const session = event.data.object as Stripe.Checkout.Session;

  switch (event.type) {
    case "checkout.session.completed": {
      if (
        !session.client_reference_id ||
        !session.customer ||
        !session.subscription
      ) {
        return res.status(400).json({
          msg: "`client_reference_id`, `customer`, and `subscription` must be defined",
        });
      }

      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: session.client_reference_id,
        },
        select: {
          id: true,
          email: true,
        },
      });

      await prisma.user.update({
        where: {
          id: session.client_reference_id,
        },
        data: {
          isPro: true,
        },
      });

      await prisma.stripeCustomer.create({
        data: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      break;
    }
    case "customer.subscription.deleted": {
      const { id, userId } = await prisma.stripeCustomer.findUniqueOrThrow({
        where: {
          stripeCustomerId: session.customer as string,
        },
        select: {
          id: true,
          userId: true,
        },
      });
      await prisma.stripeCustomer.delete({ where: { id } });

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isPro: false,
        },
      });

      break;
    }
    default:
      break;
  }

  res.status(200).json({ received: true });
};

export default handler;
