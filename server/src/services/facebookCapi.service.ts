import axios from "axios";
import crypto from "crypto";

const hash = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

export const sendFacebookEvent = async ({
  facebook,
  eventName,
  eventId,
  user,
  customData,
}: any) => {
  if (!facebook?.serverTrackingEnabled) return;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        user_data: {
          em: user?.email ? hash(user.email) : undefined,
          ph: user?.phone ? hash(user.phone) : undefined,
          client_ip_address: user.ip,
          client_user_agent: user.ua,
        },
        custom_data: customData,
      },
    ],
    test_event_code: facebook.testEventCode || undefined,
  };

  await axios.post(
    `https://graph.facebook.com/v18.0/${facebook.pixelId}/events?access_token=${facebook.accessToken}`,
    payload
  );
};
