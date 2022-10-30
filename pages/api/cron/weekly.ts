import sendWeeklyProgressReport from "cron/weeklyProgressReport";
import { NextApiRequest, NextApiResponse } from "next";

const CRON_SECRET_SIGNING_KEY = process.env.CRON_SECRET_SIGNING_KEY;
if (!CRON_SECRET_SIGNING_KEY)
  throw new Error("`CRON_SECRET_SIGNING_KEY` must be set in .env");

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers["signing-key"] === CRON_SECRET_SIGNING_KEY) {
    try {
      await sendWeeklyProgressReport();
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as any).message });
    }
  } else {
    res.status(403).json({ success: false, message: "Invalid signing key" });
  }
}

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
