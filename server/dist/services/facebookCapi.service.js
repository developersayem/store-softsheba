"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFacebookEvent = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const hash = (value) => crypto_1.default.createHash("sha256").update(value).digest("hex");
const sendFacebookEvent = async ({ facebook, eventName, eventId, user, customData, }) => {
    if (!facebook?.serverTrackingEnabled)
        return;
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
    await axios_1.default.post(`https://graph.facebook.com/v18.0/${facebook.pixelId}/events?access_token=${facebook.accessToken}`, payload);
};
exports.sendFacebookEvent = sendFacebookEvent;
