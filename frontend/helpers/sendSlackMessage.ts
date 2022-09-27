import slackApp from "lib/slack";

const sendSlackMessage = (
  text: string,
  channel = process.env.SLACK_NOTIFICATION_CHANNEL as string
) => {
  if (process.env.NODE_ENV !== "production") return null;
  return slackApp.client.chat.postMessage({
    channel,
    text,
  });
};

export default sendSlackMessage;
