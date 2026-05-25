import { ILandingPage, LandingPage } from "../models/landing-page.model";
import { storeSettings } from "../models/store_settings.model";
import { ApiError } from "../utils/ApiError";
import { resolveImageUrls } from "../utils/image-resolver.plugin";

export const landingPageService = {
  async create(payload: Partial<ILandingPage>) {
    if (!payload.name) throw new ApiError(400, "Landing page name is required");
    if (!payload.productId) throw new ApiError(400, "Product is required");
    if (!payload.slug) throw new ApiError(400, "Slug is required");

    const existing = await LandingPage.findOne({ slug: payload.slug });
    if (existing) throw new ApiError(409, "A landing page with this slug already exists");

    const lp = await LandingPage.create(payload);
    return resolveImageUrls(lp, ["productId.thumbnail", "hero.heroImage", "logo", "customReviews.avatar", "features.image", "deliveryGuarantee.items.image", "problemSolution.problem.image", "problemSolution.solution.image", "packageBenefits.image"]);
  },

  async list() {
    const pages = await LandingPage.find()
      .populate("productId", "name slug thumbnail")
      .sort({ createdAt: -1 })
      .lean();
    return resolveImageUrls(pages, ["productId.thumbnail", "hero.heroImage", "logo", "customReviews.avatar", "features.image", "deliveryGuarantee.items.image", "problemSolution.problem.image", "problemSolution.solution.image", "packageBenefits.image"]);
  },

  async getById(id: string) {
    const lp = await LandingPage.findById(id)
      .populate("productId", "name slug thumbnail")
      .lean();
    if (!lp) throw new ApiError(404, "Landing page not found");
    return resolveImageUrls(lp, ["productId.thumbnail", "hero.heroImage", "logo", "customReviews.avatar", "features.image", "deliveryGuarantee.items.image", "problemSolution.problem.image", "problemSolution.solution.image", "packageBenefits.image"]);
  },

  async getBySlug(slug: string) {
    const lp = await LandingPage.findOne({ slug, isActive: true })
      .populate("productId", "name slug thumbnail regular_price sale_price variants hasVariants")
      .lean();
    if (!lp) throw new ApiError(404, "Landing page not found");

    const settings = await storeSettings.findOne({ key: "global" }).lean();
    const result = {
      ...lp,
      siteName: (settings as any)?.site_name?.trim() || lp.name,
      favIcon: (settings as any)?.fav_icon,
      logo: lp.logo || (settings as any)?.header?.site_logo,
      updatedAt: (settings as any)?.updatedAt,
    };

    return resolveImageUrls(result, ["productId.thumbnail", "hero.heroImage", "logo", "favIcon", "customReviews.avatar", "features.image", "deliveryGuarantee.items.image", "problemSolution.problem.image", "problemSolution.solution.image", "packageBenefits.image"]);
  },

  async update(id: string, payload: Partial<ILandingPage>) {
    // If slug is changing, check for conflicts
    if (payload.slug) {
      const existing = await LandingPage.findOne({ slug: payload.slug, _id: { $ne: id } });
      if (existing) throw new ApiError(409, "A landing page with this slug already exists");
    }

    const lp = await LandingPage.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
    if (!lp) throw new ApiError(404, "Landing page not found");
    return resolveImageUrls(lp, ["productId.thumbnail", "hero.heroImage", "logo", "customReviews.avatar", "features.image", "deliveryGuarantee.items.image", "problemSolution.problem.image", "problemSolution.solution.image", "packageBenefits.image"]);
  },

  async delete(id: string) {
    const deleted = await LandingPage.findByIdAndDelete(id);
    if (!deleted) throw new ApiError(404, "Landing page not found");
    return deleted;
  },

  async toggleActive(id: string) {
    const lp = await LandingPage.findById(id);
    if (!lp) throw new ApiError(404, "Landing page not found");
    lp.isActive = !lp.isActive;
    await lp.save();
    return lp;
  },
};
