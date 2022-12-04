/**
 * Runs the API requests to the cron endpoints.
 * Managed separately from the rest of Alu with a separate pm2 process
 * `pm2 start --name=alu_cron "node /home/aluadmin/aludir2/cron/_cron.mjs"`
 */
import axios from "axios";
import * as dotenv from "dotenv";
import cron from "node-cron";

dotenv.config();

const CRON_SECRET_SIGNING_KEY = process.env.CRON_SECRET_SIGNING_KEY;
const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
if (!CRON_SECRET_SIGNING_KEY)
  throw new Error("`CRON_SECRET_SIGNING_KEY` must be set in .env");
if (!NEXT_PUBLIC_SERVER_URL)
  throw new Error("`NEXT_PUBLIC_SERVER_URL` must be set in .env");

const hourlyUrl = `${NEXT_PUBLIC_SERVER_URL}/api/cron/hourly`;
const dailyUrl = `${NEXT_PUBLIC_SERVER_URL}/api/cron/daily`;
const weeklyUrl = `${NEXT_PUBLIC_SERVER_URL}/api/cron/weekly`;

cron.schedule("0 * * * *", () => {
  console.log("Running hourly cron");
  axios
    .post(
      hourlyUrl,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "signing-key": CRON_SECRET_SIGNING_KEY,
        },
      }
    )
    .then(({ data }) => {
      console.log(data);
    })
    .catch((e) => console.error(e));
});

cron.schedule("0 0 * * *", () => {
  console.log("Running daily cron");
  // TODO: Run PG database backup
  axios
    .post(
      dailyUrl,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "signing-key": CRON_SECRET_SIGNING_KEY,
        },
      }
    )
    .then(({ data }) => {
      console.log(data);
    })
    .catch((e) => console.error(e));
});

cron.schedule("0 0 * * 1", () => {
  console.log("Running weekly cron");
  axios
    .post(
      weeklyUrl,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "signing-key": CRON_SECRET_SIGNING_KEY,
        },
      }
    )
    .then(({ data }) => {
      console.log(data);
    })
    .catch((e) => console.error(e));
});
