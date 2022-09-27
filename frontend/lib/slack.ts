import { App } from "@slack/bolt";

const ALU_BOT_OAUTH_TOKEN = process.env.ALU_BOT_OAUTH_TOKEN;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

if (!ALU_BOT_OAUTH_TOKEN || !SLACK_SIGNING_SECRET)
  throw new Error(
    "`ALU_BOT_OAUTH_TOKEN` and `SLACK_SIGNING_SECRET` must be set in `.env`"
  );

const slackApp = new App({
  token: ALU_BOT_OAUTH_TOKEN,
  signingSecret: SLACK_SIGNING_SECRET,
});

export default slackApp;
