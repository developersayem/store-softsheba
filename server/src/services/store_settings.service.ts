import _ from "lodash";
import { storeSettings } from "../models/store_settings.model";
import { fileService } from "./utils/file.service";
import { resolveImageUrls } from "../utils/image-resolver.plugin";

const STORE_SETTINGS_IMAGE_FIELDS = [
  "fav_icon",
  "header.site_logo",
  "pages.home.hero_section.hero_images",
  "pages.home.flash_sale_section.banner.banner_image",
  "pages.home.flash_sale_section.banner.count_down_image",
  "footer.top.left_icon",
  "footer.top.right_icon",
  "footer.contact.location_icon",
  "footer.contact.phone_icon",
  "footer.contact.email_icon",
];

interface UploadedFiles {
  site_logo?: Express.Multer.File[];
  cart_logo?: Express.Multer.File[];
  footer_left_icon?: Express.Multer.File[];
  footer_right_icon?: Express.Multer.File[];
  flash_banner_image?: Express.Multer.File[];
  flash_countdown_image?: Express.Multer.File[];
  hero_images?: Express.Multer.File[];
  fav_icon?: Express.Multer.File[];
}

export const getStoreSettingsService = async () => {
  let settings = await storeSettings.findOne().lean();
  
  // If not found (e.g. storeId mismatch in license mode), try finding ANY settings
  if (!settings) {
    settings = await storeSettings.findOne().setOptions({ skipStoreFilter: true }).lean();
  }

  if (!settings) {
    throw new Error("Store settings not found");
  }
  
  const resolved = await resolveImageUrls(settings, STORE_SETTINGS_IMAGE_FIELDS, {
    excludePlaceholderFields: [
      "header.site_logo",
      "footer.top.left_icon",
      "footer.top.right_icon",
      "footer.contact.location_icon",
      "footer.contact.phone_icon",
      "footer.contact.email_icon",
    ],
  });

  // Return as an array to maintain compatibility with frontend logic [storeSettingsData[0]]
  return [resolved];
};

/* =====================================================
   Update Store Settings (Admin)
 ===================================================== */

export const updateStoreSettingsService = async (
  payload: any,
  files?: UploadedFiles
) => {
  const settings = await storeSettings.findOne();
  if (!settings) {
    throw new Error("Store settings not found");
  }

  // Capture original values before merging updates
  const originalSiteLogo = settings.header?.site_logo;
  const originalFavIcon = settings.fav_icon;
  const originalCartIcon = settings.header?.cart_icon;
  const originalFooterLeftIcon = settings.footer?.top?.left_icon;
  const originalFooterRightIcon = settings.footer?.top?.right_icon;
  const originalFlashBanner = settings.pages?.home?.flash_sale_section?.banner?.banner_image;
  const originalFlashCountdown = settings.pages?.home?.flash_sale_section?.banner?.count_down_image;

  let updates = payload.settings;

  if (typeof updates === "string") {
    try {
      updates = JSON.parse(updates);
    } catch (error) {
      throw new Error("Invalid JSON format in settings payload");
    }
  }
  if (updates.fav_icon === null) {
    if (originalFavIcon) {
      await fileService.deleteFile("store-settings/fav_icon", originalFavIcon);
    }
  }
  if (updates) {
    // Use Mongoose document.set() to properly update and validate required fields
    settings.set(updates);
    
    if (
      updates.header?.site_logo === null &&
      !files?.site_logo &&
      originalSiteLogo
    ) {
      await fileService.deleteFile("store-settings/site_logo", originalSiteLogo);
      if (settings.header) {
        settings.header.site_logo = "";
      }
    }

    settings.markModified("header");
    settings.markModified("footer");
    settings.markModified("nav_bar");
    settings.markModified("pages");
    settings.markModified("tawk_to");
    settings.markModified("legal_pages");

  }

  // Handle file uploads
  if (files?.site_logo?.[0]) {
    if (originalSiteLogo) {
      await fileService.deleteFile("store-settings/site_logo", originalSiteLogo);
    }

    const f = files.site_logo[0];
    const fileName = fileService.generateFileName(
      f.originalname,
      settings?._id.toString()
    );
    await fileService.moveFile(f, "store-settings/site_logo", fileName);
    if (settings?.header) {
      settings.header.site_logo = fileService.getFileUrl(
        "store-settings/site_logo",
        fileName
      );
    }
  }
  if (files?.fav_icon?.[0]) {
    if (originalFavIcon) {
      await fileService.deleteFile("store-settings/fav_icon", originalFavIcon);
    }

    const f = files.fav_icon[0];
    const fileName = fileService.generateFileName(
      f.originalname,
      settings?._id.toString()
    );
    await fileService.moveFile(f, "store-settings/fav_icon", fileName);

    settings.fav_icon = fileService.getFileUrl(
      "store-settings/fav_icon",
      fileName
    );
  }

  if (files?.cart_logo?.[0]) {
    if (originalCartIcon) {
      await fileService.deleteFile("store-settings/cart_logo", originalCartIcon);
    }
    const f = files.cart_logo[0];
    const fileName = fileService.generateFileName(
      f.originalname,
      settings?._id.toString()
    );
    await fileService.moveFile(f, "store-settings/cart_logo", fileName);
    if (settings?.header) {
      settings.header.cart_icon = fileService.getFileUrl(
        "store-settings/cart_logo",
        fileName
      );
    }
  }
  if (files?.footer_left_icon?.[0]) {
    if (originalFooterLeftIcon)
      await fileService.deleteFile("store-settings/footer_left_icon", originalFooterLeftIcon);
    const f = files.footer_left_icon[0];
    const fileName = fileService.generateFileName(
      f.originalname,
      settings?._id.toString()
    );
    await fileService.moveFile(
      f,
      "store-settings/footer_left_icon",
      fileName
    );
    if (settings?.footer?.top) {
      settings.footer.top.left_icon = fileService.getFileUrl(
        "store-settings/footer_left_icon",
        fileName
      );
    }
  }
  if (files?.footer_right_icon?.[0]) {
    if (originalFooterRightIcon)
      await fileService.deleteFile("store-settings/footer_right_icon", originalFooterRightIcon);
    const f = files.footer_right_icon[0];
    const fileName = fileService.generateFileName(
      f.originalname,
      settings?._id.toString()
    );
    await fileService.moveFile(
      f,
      "store-settings/footer_right_icon",
      fileName
    );
    if (settings?.footer?.top) {
      settings.footer.top.right_icon = fileService.getFileUrl(
        "store-settings/footer_right_icon",
        fileName
      );
    }
  }
  if (files?.flash_banner_image?.[0]) {
    if (originalFlashBanner) {
      await fileService.deleteFile("store-settings/flash_banner_image", originalFlashBanner);
    }
    const f = files.flash_banner_image[0];
    const fileName = fileService.generateFileName(
      f.originalname,
      settings?._id.toString()
    );
    await fileService.moveFile(
      f,
      "store-settings/flash_banner_image",
      fileName
    );

    if (settings?.pages?.home?.flash_sale_section?.banner) {
      settings.pages.home.flash_sale_section.banner.banner_image =
        fileService.getFileUrl("store-settings/flash_banner_image", fileName);
    }
  }

  if (files?.flash_countdown_image?.[0]) {
    if (originalFlashCountdown) {
      await fileService.deleteFile("store-settings/flash_countdown_image", originalFlashCountdown);
    }
    const f = files.flash_countdown_image[0];
    const fileName = fileService.generateFileName(
      f.originalname,
      settings?._id.toString()
    );
    await fileService.moveFile(
      f,
      "store-settings/flash_countdown_image",
      fileName
    );

    if (settings?.pages?.home?.flash_sale_section?.banner) {
      settings.pages.home.flash_sale_section.banner.count_down_image =
        fileService.getFileUrl(
          "store-settings/flash_countdown_image",
          fileName
        );
    }
  }

  let deletedHeroIndices: number[] = [];

  if (payload.deleted_hero_indices) {
    try {
      deletedHeroIndices = JSON.parse(payload.deleted_hero_indices);
    } catch (err) {
      console.error("Invalid deleted_hero_indices", err);
    }
  }

  let heroIndices: number[] = [];
  try {
    if (payload.hero_indices) {
      heroIndices = JSON.parse(payload.hero_indices);
    }
  } catch (e) {
    console.error("Error parsing hero_indices", e);
  }

  if (
    deletedHeroIndices.length > 0 &&
    settings.pages?.home?.hero_section?.hero_images
  ) {
    // Sort indices in descending order to avoid index shifting issues
    // deletedHeroIndices.sort((a, b) => b - a);
    for (const index of deletedHeroIndices) {
      const oldUrl = settings.pages.home.hero_section.hero_images[index];

      if (oldUrl) {
        const fileName = oldUrl.split("/").pop()!;
        if (fileName) {
          await fileService.deleteFile("store-settings/hero_images", fileName);
        }
      }
    }
    // Remove deleted indices from array
    settings.pages.home.hero_section.hero_images =
      settings.pages.home.hero_section.hero_images.filter(
        (_, i) => !deletedHeroIndices.includes(i)
      );

    settings.markModified("pages.home.hero_section.hero_images");
  }

  if (files?.hero_images && files.hero_images.length > 0) {
    for (let i = 0; i < files.hero_images.length; i++) {
      const f = files.hero_images[i];
      const targetIndex = heroIndices[i];

      if (targetIndex !== undefined) {
        // Delete the old file at this index if it exists
        const currentUrl =
          settings.pages?.home?.hero_section?.hero_images?.[targetIndex];
        if (currentUrl) {
          const fileName = currentUrl.split("/").pop()!;
          if (fileName) {
            await fileService.deleteFile(
              "store-settings/hero_images",
              fileName
            );
          }
        }

        const fileName = fileService.generateFileName(
          f.originalname,
          `${settings._id.toString()}_hero_${targetIndex}`
        );

        await fileService.moveFile(
          f,
          "store-settings/hero_images",
          fileName
        );

        const publicUrl = fileService.getFileUrl(
          "store-settings/hero_images",
          fileName
        );

        if (
          settings.pages &&
          settings.pages.home &&
          settings.pages.home.hero_section
        ) {
          while (
            settings.pages.home.hero_section.hero_images.length <= targetIndex
          ) {
            settings.pages.home.hero_section.hero_images.push("");
          }

          settings.pages.home.hero_section.hero_images[targetIndex] = publicUrl;
        }
      }
    }
    settings.markModified("pages.home.hero_section.hero_images");
  }

  await settings.save();
  const finalSettings = await resolveImageUrls(settings, STORE_SETTINGS_IMAGE_FIELDS);
  
  // Return as an array for frontend compatibility
  return [finalSettings];
};
