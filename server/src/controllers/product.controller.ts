// controllers/product.controller.ts
import { Request, Response } from "express";
import slugify from "slugify";
import { productService } from "../services/product.service";
import { variantService } from "../services/variant.service";
import asyncHandler from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { fileService } from "../services/utils/file.service";
import { ApiError } from "../utils/ApiError";
import { Types } from "mongoose";

// Variant interface
interface IVariantAttribute {
  [key: string]: any;
  attribute: string;
  value: string;
}

interface IVariant {
  sku: string;
  sale_price: number;
  purchase_price: number;
  regular_price: number;
  discount_type?: "flat" | "percentage" | null;
  discount: number;
  stock: number;
  stock_alert: number;
  status?: "active" | "inactive";
  attributes: IVariantAttribute[];
  image?: string;
  sold: number;
}

// -------------------- HANDLE FILES --------------------
async function handleFiles(req: Request, name: string) {
  let thumbnail: string | null = null;
  const gallery: string[] = [];
  let digitalFileUrl: string | null = null;
  const variantImages: Record<string, string> = {};

  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || !files.length)
    return { thumbnail, gallery, digitalFileUrl, variantImages };

  for (const f of files) {
    const baseName = slugify(name || f.originalname, {
      lower: true,
      strict: true,
    });
    const ext = f.originalname.split(".").pop();
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const customName = `${baseName}-${uniqueSuffix}.${ext}`;

    switch (f.fieldname) {
      case "thumbnail":
        await fileService.moveFile(f, "products", customName);
        thumbnail = fileService.getFileUrl("products", customName);
        break;
      case "digitalFile":
        await fileService.moveFile(f, "products/files", customName);
        digitalFileUrl = fileService.getFileUrl("products/files", customName);
        break;
      default:
        if (f.fieldname === "gallery") {
          await fileService.moveFile(f, "products", customName);
          gallery.push(fileService.getFileUrl("products", customName));
        } else if (
          f.fieldname.startsWith("variants") &&
          f.fieldname.endsWith("[image]")
        ) {
          const match = f.fieldname.match(/^variants\[(\d+)\]\[image\]$/);
          if (match) {
            const index = match[1];
            await fileService.moveFile(f, "products/variants", customName);
            variantImages[index] = fileService.getFileUrl(
              "products/variants",
              customName,
            );
          }
        }
    }
  }

  return { thumbnail, gallery, digitalFileUrl, variantImages };
}

// -------------------- CLEANUP FILES --------------------
async function cleanupFiles(files: {
  thumbnail?: string | null;
  gallery?: string[];
  digitalFileUrl?: string | null;
  variantImages?: Record<string, string>;
}) {
  const extractFolderAndName = (fileUrl: string) => {
    const parts = fileUrl.split("/uploads/")[1].split("/"); // ["products", "variants", "file.png"]
    const filename = parts.pop()!; // remove last element → file.png
    const folder = parts.join("/"); // join remaining → "products/variants"
    return { folder, filename };
  };

  if (files.thumbnail) {
    const { folder, filename } = extractFolderAndName(files.thumbnail);
    await fileService.deleteFile(folder, filename);
  }

  if (files.digitalFileUrl) {
    const { folder, filename } = extractFolderAndName(files.digitalFileUrl);
    await fileService.deleteFile(folder, filename);
  }

  if (files.gallery) {
    for (const g of files.gallery) {
      const { folder, filename } = extractFolderAndName(g);
      await fileService.deleteFile(folder, filename);
    }
  }

  if (files.variantImages) {
    for (const key in files.variantImages) {
      const { folder, filename } = extractFolderAndName(
        files.variantImages[key],
      );
      await fileService.deleteFile(folder, filename);
    }
  }
}
// -------------------- PARSE VARIANTS --------------------
function parseVariants(body: any): IVariant[] {
  let variants = body.variants;

  // If variants is an array (from FormData with multiple fields), find the JSON string
  if (Array.isArray(variants)) {
    // Filter out empty strings and '[object Object]' strings, find valid JSON
    const jsonString = variants.find(
      (v: any) =>
        v &&
        typeof v === "string" &&
        v.trim().startsWith("[") &&
        !v.includes("[object Object]"), // Skip invalid toString() results
    );
    if (jsonString) {
      try {
        variants = JSON.parse(jsonString);
      } catch (error) {
        variants = [];
      }
    } else {
      variants = [];
    }
  } else if (typeof variants === "string") {
    try {
      variants = JSON.parse(variants);
    } catch (error) {
      variants = [];
    }
  }

  // Check if variants exist and are already an array
  if (!variants || !Array.isArray(variants)) {
    return [];
  }

  return variants.filter(Boolean).map((v: any) => ({
    _id: v._id, // Preserve ID for updates
    sku: v.sku,
    regular_price: Number(v.regular_price || 0),
    sale_price: Number(v.sale_price || 0),
    discount_type: v.discount_type || null,
    discount: Number(v.discount || 0),
    stock: Number(v.stock || 0),
    stock_alert: Number(v.stock_alert || 0),
    status: v.status || "active",
    image: v.image || "",
    sold: Number(v.sold || 0),
    ratings: Number(v.ratings || 0),
    purchase_price: Number(v.purchase_price || 0),
    attributes: (v.attributes || [])
      .filter((a: any) => {
        const hasId = a && (a.attribute || a.attributeId);
        const hasValue =
          a && a.value !== undefined && a.value !== null && a.value !== ""; // Allow 0
        return hasId && hasValue;
      })
      .map((a: any) => ({
        attribute: a.attribute || a.attributeId,
        value: a.value,
      })),
  }));
}
// -------------------- NORMALIZE PRODUCT --------------------
function normalizeProductBody(body: any) {
  const parseJSON = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  };

  const parseGallery = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    // Handle comma-separated string
    if (typeof val === "string") {
      // Try JSON parse first
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // If not JSON, split by comma
        return val
          .split(",")
          .map((url: string) => url.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  const discount_type = body.discount_type === "" ? null : body.discount_type;

  const parseProductAttributes = (val: any) => {
    if (!val) return [];

    let parsed = val;

    // If it's an array (from FormData), get the first non-empty element
    if (Array.isArray(val)) {
      const firstValid = val.find((item) => item && item !== "");
      if (!firstValid) return [];
      parsed = firstValid;
    }

    // If it's a string, try to parse it
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        return [];
      }
    }

    // Ensure it's an array
    if (!Array.isArray(parsed)) return [];

    // Transform the data: change 'attribute' to 'attributeId'
    // Only filter out completely invalid items (missing attributeId)
    const result = parsed
      .filter((item: any) => item && (item.attribute || item.attributeId))
      .map((item: any) => ({
        attributeId: item.attribute || item.attributeId,
        value: item.value || "",
      }));

    return result;
  };

  return {
    ...body,
    is_published: body.is_published === "true" || body.is_published === true,
    is_digital_product:
      body.is_digital_product === "true" || body.is_digital_product === true,
    regular_price: Number(body.regular_price || 0),
    sale_price: Number(body.sale_price || 0),
    purchase_price: Number(body.purchase_price || 0),
    discount: Number(body.discount || 0),
    stock: Number(body.stock || 0),
    stock_alert: Number(body.stock_alert || 0),
    sold: Number(body.sold || 0),
    ratings: Number(body.ratings || 0),
    categories: parseJSON(body.categories),
    collections: parseJSON(body.collections),
    tags: parseJSON(body.tags || body.tag),
    keywords: parseJSON(body.keywords),
    attributes: parseJSON(body.attributes),
    gallery: parseGallery(body.gallery),
    variants: parseVariants(body),
    productAttributes: parseProductAttributes(body.productAttributes),
    discount_type,
    hasVariants: body.hasVariants === "true" || body.hasVariants === true,
    delivery: body.delivery || null,
    is_free_shipping:
      body.is_free_shipping === "true" || body.is_free_shipping === true,
    brand: body.brand || null,
  };
}

// -------------------- CREATE PRODUCT --------------------
export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    // 1️⃣ Handle file uploads
    const { thumbnail, gallery, digitalFileUrl, variantImages } =
      await handleFiles(req, req.body.name);
    const parsed = normalizeProductBody(req.body);

    // Ensure variants is always an array
    const { variants = [], ...productPayload } = parsed;

    let product;

    try {
      // 2️⃣ Create product
      product = await productService.createProduct({
        ...productPayload,
        thumbnail,
        gallery,
        file: digitalFileUrl,
      });

      // 3️⃣ Create variants sequentially
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (!v) continue;

        try {
          const safeAttributes = (v.attributes || []).map(
            (a: IVariantAttribute) => ({
              attributeId: new Types.ObjectId(a.attribute),
              value: a.value,
            }),
          );

          await variantService.create({
            productId: product._id,
            sku: v.sku,
            regular_price: v.regular_price,
            sale_price: v.sale_price,
            purchase_price: v.purchase_price,
            discount_type: v.discount_type,
            discount: v.discount,
            stock: v.stock,
            stock_alert: v.stock_alert,
            attributes: safeAttributes,
            image: variantImages[i] || "",
            status: v.status,
            sold: v.sold || 0,
            ratings: v.ratings || 0,
          });
        } catch (error: any) {
          throw error; // Re-throw to trigger rollback
        }
      }

      // 4️⃣ Respond success
      return res
        .status(201)
        .json(new ApiResponse(201, product, "Product created successfully"));
    } catch (error) {
      // ❌ Rollback if anything fails

      // Delete product if created
      if (product?._id) {
        try {
          await productService.deleteProduct(String(product._id));
        } catch (err) {
          console.error("Failed to delete product during rollback:", err);
        }
      }

      // Delete all uploaded files
      try {
        await cleanupFiles({
          thumbnail,
          gallery,
          digitalFileUrl,
          variantImages,
        });
      } catch (err) {
        console.error("Failed to cleanup files during rollback:", err);
      }

      // Forward error
      console.error("Error creating product:", error);
      throw error;
    }
  },
);

// -------------------- UPDATE PRODUCT --------------------
export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // 1️⃣ Handle uploaded files
    const { gallery, digitalFileUrl, thumbnail, variantImages } =
      await handleFiles(req, req.body.name);

    // 2️⃣ Normalize body
    const parsedBody = normalizeProductBody(req.body);

    // Merge uploaded files
    if (gallery.length)
      parsedBody.gallery = [...(parsedBody.gallery || []), ...gallery];
    if (digitalFileUrl) parsedBody.file = digitalFileUrl;
    if (thumbnail) parsedBody.thumbnail = thumbnail;

    let updatedProduct;
    const createdVariants: string[] = []; // track for rollback

    try {
      // 3️⃣ Update product fields
      updatedProduct = await productService.updateProduct(
        id as string,
        parsedBody,
      );

      // 4️⃣ Handle variants
      const variants = parsedBody.variants || [];
      const existingVariants = await variantService.getByProduct(id as string);

      // Map of existing variants by _id for update
      const existingMap = new Map<string, any>(
        (existingVariants as any[]).map((v: any) => [String(v._id), v]),
      );

      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (!v) continue;

        const safeAttributes = (v.attributes || []).map(
          ({ attribute, value }: { attribute: string; value: string }) => ({
            attributeId: new Types.ObjectId(attribute),
            value,
          }),
        );

        if (v._id && existingMap.has(v._id)) {
          // ✅ Update existing variant
          await variantService.update(v._id, {
            sku: v.sku,
            regular_price: v.regular_price,
            sale_price: v.sale_price,
            purchase_price: v.purchase_price,
            discount_type: v.discount_type,
            discount: v.discount,
            stock: v.stock,
            stock_alert: v.stock_alert,
            attributes: safeAttributes,
            image: variantImages[i] || v.image || "",
            status: v.status,
            sold: v.sold || 0,
            ratings: v.ratings || 0,
          });
          existingMap.delete(v._id);
        } else {
          // ✅ Create new variant
          const variant = await variantService.create({
            productId: updatedProduct._id,
            sku: v.sku,
            regular_price: v.regular_price,
            purchase_price: v.purchase_price,
            sale_price: v.sale_price,
            discount_type: v.discount_type,
            discount: v.discount,
            stock: v.stock,
            stock_alert: v.stock_alert,
            attributes: safeAttributes,
            image: variantImages[i] || "",
            status: v.status,
            sold: v.sold || 0,
            ratings: v.ratings || 0,
          });
          createdVariants.push(String(variant._id));
        }
      }

      // 5️⃣ Delete leftover variants not in payload
      const deletedVariantImages: string[] = [];
      for (const leftover of Array.from(existingMap.values()) as any[]) {
        if (leftover.image) deletedVariantImages.push(leftover.image);
        await variantService.delete(String(leftover._id));
      }

      // Cleanup deleted variant images
      for (const fileUrl of deletedVariantImages) {
        try {
          const parts = fileUrl.split("/uploads/")[1].split("/");
          const filename = parts.pop()!;
          const folder = parts.join("/");
          await fileService.deleteFile(folder, filename);
        } catch (err) {
          console.error("Failed to delete variant image", fileUrl, err);
        }
      }

      // 6️⃣ Respond success
      res.json(
        new ApiResponse(200, updatedProduct, "Product updated successfully"),
      );
    } catch (error) {
      // Rollback newly created variants
      for (const variantId of createdVariants) {
        try {
          await variantService.delete(variantId);
        } catch {}
      }

      // Cleanup uploaded files
      try {
        await cleanupFiles({
          thumbnail,
          gallery,
          digitalFileUrl,
          variantImages,
        });
      } catch {}

      throw error;
    }
  },
);
//list all products with offers and discounts

export const listAllProductsWithOffers = asyncHandler(
  async (req: Request, res: Response) => {
    const response = await productService.getallOfferProducts();

    res.status(200).json({
      statusCode: 200,
      message: "success",
      success: true,
      response, // spreads data and meta at top level
    });
  },
);

// -------------------- LIST PRODUCTS --------------------
export const listAllProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const response = await productService.listAllProducts(req.query);

    res.status(200).json({
      statusCode: 200,
      message: "success",
      success: true,
      ...response, // spreads data and meta at top level
    });
  },
);

// -------------------- LIST ACTIVE PRODUCTS --------------------
export const listActiveProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const response = await productService.listActiveProducts(req.query);

    res.status(200).json({
      statusCode: 200,
      message: "success",
      success: true,
      ...response, // spreads data and meta at top level
    });
  },
);

// -------------------- LIST All ACTIVE Flash Sale PRODUCTS --------------------
export const listAllActiveFlashSaleProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const response = await productService.listAllActiveFlashSaleProducts(
      req.query,
    );

    res.status(200).json({
      statusCode: 200,
      message: "success",
      success: true,
      ...response, // spreads data and meta at top level
    });
  },
);

// -------------------- GET PRODUCT --------------------
export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await productService.getById(id as string);
    res.json(new ApiResponse(200, product));
  },
);

// -------------------- GET PRODUCT --------------------
export const getProductByIdWithAllVariants = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await productService.getByIdWithAllVariants(id as string);
    res.json(new ApiResponse(200, product));
  },
);

// -------------------- GET PRODUCT BY SLUG --------------------
export const getProductBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const product = await productService.getBySlug(slug as string);
    res.json(new ApiResponse(200, product));
  },
);

// -------------------- DELETE SINGLE PRODUCT --------------------
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // fetch product with all details
    const product = await productService.getById(id as string);

    // delete product and its variants
    await productService.deleteProduct(product._id.toString());

    // prepare files for cleanup
    const filesToCleanup: {
      thumbnail?: string | null;
      gallery?: string[];
      digitalFileUrl?: string | null;
      variantImages?: Record<string, string>;
    } = {
      thumbnail: product.thumbnail || null,
      gallery: product.gallery || [],
      digitalFileUrl: product.file || null,
      variantImages: {},
    };

    // add variant images
    if (product.variants?.length) {
      product.variants.forEach((v: any, index: number) => {
        if (v.image) filesToCleanup.variantImages![index] = v.image;
      });
    }

    // cleanup files
    try {
      await cleanupFiles(filesToCleanup);
    } catch (err) {
      console.error("Failed to cleanup files during product deletion:", err);
    }

    res.json(new ApiResponse(200, null, "Product deleted successfully"));
  },
);

// -------------------- DELETE MULTIPLE PRODUCTS --------------------
export const deleteMultiple = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) throw new ApiError(400, "ids array required");

    // fetch all products
    const products = await Promise.all(
      ids.map((id: string) => productService.getById(id)),
    );

    // delete products and their variants
    const result = await productService.deleteMultiple(ids);

    // prepare files for cleanup
    const cleanupTasks = products.map((product) => {
      const filesToCleanup: {
        thumbnail?: string | null;
        gallery?: string[];
        digitalFileUrl?: string | null;
        variantImages?: Record<string, string>;
      } = {
        thumbnail: product.thumbnail || null,
        gallery: product.gallery || [],
        digitalFileUrl: product.file || null,
        variantImages: {},
      };

      if (product.variants?.length) {
        product.variants.forEach((v: any, index: number) => {
          if (v.image) filesToCleanup.variantImages![index] = v.image;
        });
      }

      return cleanupFiles(filesToCleanup);
    });

    try {
      await Promise.all(cleanupTasks);
    } catch (err) {
      console.error(
        "Failed to cleanup files during multiple product deletion:",
        err,
      );
    }

    res.json(
      new ApiResponse(200, result, `${result.deletedCount} product(s) deleted`),
    );
  },
);

// -------------------- TOGGLE PRODUCT PUBLISHED --------------------
export const togglePublished = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const toggled = await productService.togglePublished(id as string);
    res.json(
      new ApiResponse(
        200,
        toggled,
        toggled.is_published ? "Published" : "Unpublished",
      ),
    );
  },
);

// -------------------- TOGGLE PRODUCT FLASH SALE --------------------
export const toggleFlashSale = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const toggled = await productService.toggleFlashSale(id as string);
    res.json(
      new ApiResponse(
        200,
        toggled,
        toggled.is_flash_sale ? "Flash Sale Enabled" : "Flash Sale Disabled",
      ),
    );
  },
);

// -------------------- TOGGLE MULTIPLE PRODUCTS PUBLISHED --------------------
export const toggleMultiplePublished = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids, action } = req.body;
    if (!action || !["publish", "unpublish"].includes(action))
      throw new ApiError(400, "Invalid action");

    const toggledProducts = await productService.toggleMultiplePublished(
      ids,
      action,
    );

    res.json(
      new ApiResponse(
        200,
        null,
        `${toggledProducts.length} product(s) ${
          action === "publish" ? "published" : "unpublished"
        }`,
      ),
    );
  },
);

// -------------------- TOGGLE MULTIPLE PRODUCTS FLASH SALE --------------------
export const toggleMultipleFlashSale = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids, action } = req.body;
    if (!action || !["flash_sale", "disable_flash_sale"].includes(action))
      throw new ApiError(400, "Invalid action");

    const toggledProducts = await productService.toggleMultipleFlashSale(
      ids,
      action,
    );

    res.json(
      new ApiResponse(
        200,
        null,
        `${toggledProducts.length} product(s) ${
          action === "flash_sale" ? "flash sale enabled" : "flash sale disabled"
        }`,
      ),
    );
  },
);

//* ------------------------------- Variants Controllers --------------------------------

// -------------------- Delete VARIANT --------------------
export const deleteVariant = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // 1️⃣ Fetch the variant to get its image URL
    const variant = await variantService.getById(id as string);
    if (!variant) throw new ApiError(404, "Variant not found");

    // 2️⃣ Delete the image from storage if it exists
    if (variant.image) {
      try {
        const parts = variant.image.split("/uploads/")[1].split("/"); // ["products", "variants", "file.png"]
        const filename = parts.pop()!;
        const folder = parts.join("/");
        await fileService.deleteFile(folder, filename);
      } catch (err) {
        console.error("Failed to delete variant image", variant.image, err);
      }
    }

    // 3️⃣ Delete the variant record from DB
    const deleted = await variantService.delete(id as string);

    res.json(new ApiResponse(200, deleted, "Variant deleted successfully"));
  },
);

//-------------------------- search products ------------------
export const getProductSearchController = asyncHandler(
  async (req: Request, res: Response) => {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const data = await productService.getSearchSuggestions(q);
    res.status(200).json({
      success: true,
      data,
    });
  },
);
