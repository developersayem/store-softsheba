import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { landingPageService } from "../services/landing-page.service";
import { ApiResponse } from "../utils/ApiResponse";
import { fileService } from "../services/utils/file.service";
import slugify from "slugify";

async function handleFiles(req: Request, name: string, payload: any) {
  let heroImage: string | null = null;
  const reviewAvatars: { [key: number]: string } = {};
  const featureImages: { [key: number]: string } = {};
  const deliveryImages: { [key: number]: string } = {};
  const packageBenefitImages: { [key: number]: string } = {};

  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || !files.length) return { heroImage };

  for (const f of files) {
    const baseName = slugify(name || f.originalname, { lower: true, strict: true });
    const ext = f.originalname.split(".").pop();
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const customName = `${baseName}-${uniqueSuffix}.${ext}`;

    if (f.fieldname === "heroImage") {
      await fileService.moveFile(f, "landing-pages", customName);
      heroImage = fileService.getFileUrl("landing-pages", customName);
    }

    if (f.fieldname === "logo") {
      await fileService.moveFile(f, "landing-pages/logo", customName);
      payload.logo = fileService.getFileUrl("landing-pages/logo", customName);
    }

    if (f.fieldname.startsWith("reviewAvatar_")) {
      const index = parseInt(f.fieldname.split("_")[1]);
      await fileService.moveFile(f, "landing-pages/reviews", customName);
      reviewAvatars[index] = fileService.getFileUrl("landing-pages/reviews", customName);
    }

    if (f.fieldname.startsWith("featureImage_")) {
      const index = parseInt(f.fieldname.split("_")[1]);
      await fileService.moveFile(f, "landing-pages/features", customName);
      featureImages[index] = fileService.getFileUrl("landing-pages/features", customName);
    }

    if (f.fieldname.startsWith("deliveryImage_")) {
      const index = parseInt(f.fieldname.split("_")[1]);
      await fileService.moveFile(f, "landing-pages/delivery", customName);
      deliveryImages[index] = fileService.getFileUrl("landing-pages/delivery", customName);
    }
    if (f.fieldname.startsWith("packageBenefitImage_")) {
      const index = parseInt(f.fieldname.split("_")[1]);
      await fileService.moveFile(f, "landing-pages/packages", customName);
      packageBenefitImages[index] = fileService.getFileUrl("landing-pages/packages", customName);
    }
    if (f.fieldname === "problemImage") {
      await fileService.moveFile(f, "landing-pages/problem-solution", customName);
      payload.problemSolution.problem.image = fileService.getFileUrl("landing-pages/problem-solution", customName);
    }
    if (f.fieldname === "solutionImage") {
      await fileService.moveFile(f, "landing-pages/problem-solution", customName);
      payload.problemSolution.solution.image = fileService.getFileUrl("landing-pages/problem-solution", customName);
    }
  }

  // Update payload packageBenefits with uploaded image URLs
  if (Object.keys(packageBenefitImages).length > 0 && payload.packageBenefits) {
    if (typeof payload.packageBenefits === "string") {
      payload.packageBenefits = JSON.parse(payload.packageBenefits);
    }
    Object.entries(packageBenefitImages).forEach(([index, url]) => {
      if (payload.packageBenefits[index]) {
        payload.packageBenefits[index].image = url;
      }
    });
  }

  // Update payload customReviews with uploaded avatar URLs
  if (Object.keys(reviewAvatars).length > 0 && payload.customReviews) {
    if (typeof payload.customReviews === "string") {
      payload.customReviews = JSON.parse(payload.customReviews);
    }
    Object.entries(reviewAvatars).forEach(([index, url]) => {
      if (payload.customReviews[index]) {
        payload.customReviews[index].avatar = url;
      }
    });
  }

  // Update payload features with uploaded image URLs
  if (Object.keys(featureImages).length > 0 && payload.features) {
    if (typeof payload.features === "string") {
      payload.features = JSON.parse(payload.features);
    }
    Object.entries(featureImages).forEach(([index, url]) => {
      if (payload.features[index]) {
        payload.features[index].image = url;
      }
    });
  }

  // Update payload deliveryGuarantee items with uploaded image URLs
  if (Object.keys(deliveryImages).length > 0 && payload.deliveryGuarantee?.items) {
    if (typeof payload.deliveryGuarantee === "string") {
      payload.deliveryGuarantee = JSON.parse(payload.deliveryGuarantee);
    }
    Object.entries(deliveryImages).forEach(([index, url]) => {
      if (payload.deliveryGuarantee.items[index]) {
        payload.deliveryGuarantee.items[index].image = url;
      }
    });
  }

  return { heroImage };
}

function parsePayload(payload: any) {
  const jsonFields = [
    "theme",
    "hero",
    "problemSolution",
    "features",
    "customReviews",
    "deliveryGuarantee",
    "countdown",
    "packageBenefits",
    "navLabels",
    "navAnchors",
  ];

  jsonFields.forEach((field) => {
    if (payload[field] && typeof payload[field] === "string") {
      try {
        payload[field] = JSON.parse(payload[field]);
      } catch (e) {
        console.error(`Failed to parse field ${field}:`, e);
      }
    }
  });
  return payload;
}

export const createLandingPage = asyncHandler(async (req: Request, res: Response) => {
  let payload = req.body;
  if (typeof payload === "string") payload = JSON.parse(payload);
  payload = parsePayload(payload);
  
  const { heroImage } = await handleFiles(req, payload.name, payload);
  
  if (heroImage) {
    payload.hero = { ...payload.hero, heroImage };
  }

  const lp = await landingPageService.create(payload);
  res.status(201).json(new ApiResponse(201, lp, "Landing page created"));
});

export const listLandingPages = asyncHandler(async (_req: Request, res: Response) => {
  const pages = await landingPageService.list();
  res.json(new ApiResponse(200, pages));
});

export const getLandingPageById = asyncHandler(async (req: Request, res: Response) => {
  const lp = await landingPageService.getById(String(req.params.id));
  res.json(new ApiResponse(200, lp));
});

export const getLandingPageBySlug = asyncHandler(async (req: Request, res: Response) => {
  const lp = await landingPageService.getBySlug(String(req.params.slug));
  res.json(new ApiResponse(200, lp));
});

export const updateLandingPage = asyncHandler(async (req: Request, res: Response) => {
  let payload = req.body;
  if (typeof payload === "string") payload = JSON.parse(payload);
  payload = parsePayload(payload);

  const { heroImage } = await handleFiles(req, payload.name, payload);

  if (heroImage) {
    payload.hero = { ...payload.hero, heroImage };
  }

  const lp = await landingPageService.update(String(req.params.id), payload);
  res.json(new ApiResponse(200, lp, "Landing page updated"));
});

export const deleteLandingPage = asyncHandler(async (req: Request, res: Response) => {
  await landingPageService.delete(String(req.params.id));
  res.json(new ApiResponse(200, null, "Landing page deleted"));
});

export const toggleLandingPageActive = asyncHandler(async (req: Request, res: Response) => {
  const lp = await landingPageService.toggleActive(String(req.params.id));
  res.json(new ApiResponse(200, lp, "Status updated"));
});
