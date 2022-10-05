import { verifySignature } from "@upstash/qstash/nextjs";
import reminderEmail from "cron/reminderEmail";
import streakReset from "cron/streakReset";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      res.status(200).json({ success: true });
      await streakReset();
      await reminderEmail();
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: (err as any).message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

export default verifySignature(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
