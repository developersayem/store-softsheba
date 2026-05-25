import { MarketingSettings } from "../models/marketing.model";

export const marketingService = {
  async getMarketing() {
    const data = await MarketingSettings.find();
    if (!data) {
      throw new Error("Marketing details not Found!");
    }
    return data;
  },
  async updateMarketing(payload: Partial<any>) {
    const result = await MarketingSettings.findOneAndUpdate(
      {},
      { $set: payload },
      {
        new: true, // return updated document
        upsert: true, // create if not exists
        runValidators: true,
      },
    );

    return result;
  },
  async getFacebookPixelData() {
    const data = await MarketingSettings.find()
      .select("facebook")
      .populate(
        "facebook",
        "pixelId browserTrackingEnabled serverTrackingEnabled",
      );
    if (!data) {
      throw new Error("Marketing details not Found!");
    }
    return data;
  },
  async getGoogleData() {
    const data = await MarketingSettings.find()
      .select("google")
      .populate(
        "google",
        "measurementId tagId merchant testEventCode analyticsIntegration",
      );
    if (!data) {
      throw new Error("Marketing details not Found!");
    }
    return data;
  },
  async getSeoData() {
    const data = await MarketingSettings.find().select("seo");
    if (!data) {
      throw new Error("Marketing details not Found!");
    }
    return data;
  },
};
