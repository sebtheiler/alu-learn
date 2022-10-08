import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/cron/hourly`;
axios
  .post(
    url,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "signing-key": process.env.CRON_SECRET_SIGNING_KEY,
      },
    }
  )
  .then(({ data }) => {
    console.log(data);
  }).catch(e => console.error(e));
