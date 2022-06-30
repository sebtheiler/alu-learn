from django.conf import settings
from slack_bolt import App

slack_app = App(
    token=settings.ALU_BOT_APP_TOKEN,
    signing_secret=settings.ALU_BOT_SIGNING_SECRET,
)


def post_slack_message(message, channel=settings.SLACK_NOTIFICATION_CHANNEL):
    if settings.DEBUG:
        return

    slack_app.client.chat_postMessage(
        token=settings.ALU_BOT_OATH_TOKEN,
        channel=channel,
        text=message,
    )
