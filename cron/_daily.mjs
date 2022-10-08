import axios from "axios";
import * as dotenv from "dotenv";
// import { exec } from "child_process";

dotenv.config();

// const date = new Date().toISOString().slice(0, 10)

// const COMMAND = `pg_dump alu > ${process.env.BASE_DIR}/backups/${date}.sql`;
// console.log(COMMAND)
// exec(COMMAND, (error, stdout, stderr) => {
//     if (error) {
//         console.log(`error: ${error.message}`);
//         return;
//     }
//     if (stderr) {
//         console.log(`stderr: ${stderr}`);
//         return;
//     }
//     console.log(`stdout: ${stdout}`);
// });

const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/cron/daily`;
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
