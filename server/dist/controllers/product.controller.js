"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductSearchController = exports.deleteVariant = exports.toggleMultipleFlashSale = exports.toggleMultiplePublished = exports.toggleFlashSale = exports.togglePublished = exports.deleteMultiple = exports.deleteProduct = exports.getProductBySlug = exports.getProductByIdWithAllVariants = exports.getProductById = exports.listAllActiveFlashSaleProducts = exports.listActiveProducts = exports.listAllProducts = exports.listAllProductsWithOffers = exports.updateProduct = exports.createProduct = void 0;
const slugify_1 = __importDefault(require("slugify"));
const product_service_1 = require("../services/product.service");
const variant_service_1 = require("../services/variant.service");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const ApiResponse_1 = require("../utils/ApiResponse");
const file_service_1 = require("../services/utils/file.service");
const ApiError_1 = require("../utils/ApiError");
const mongoose_1 = require("mongoose");
// -------------------- HANDLE FILES --------------------
async function handleFiles(req, name) {
    let thumbnail = null;
    const gallery = [];
    let digitalFileUrl = null;
    const variantImages = {};
    const files = req.files;
    if (!files || !files.length)
        return { thumbnail, gallery, digitalFileUrl, variantImages };
    for (const f of files) {
        const baseName = (0, slugify_1.default)(name || f.originalname, {
            lower: true,
            strict: true,
        });
        const ext = f.originalname.split(".").pop();
        const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const customName = `${baseName}-${uniqueSuffix}.${ext}`;
        switch (f.fieldname) {
            case "thumbnail":
                await file_service_1.fileService.moveFile(f, "products", customName);
                thumbnail = file_service_1.fileService.getFileUrl("products", customName);
                break;
            case "digitalFile":
                await file_service_1.fileService.moveFile(f, "products/files", customName);
                digitalFileUrl = file_service_1.fileService.getFileUrl("products/files", customName);
                break;
            default:
                if (f.fieldname === "gallery") {
                    await file_service_1.fileService.moveFile(f, "products", customName);
                    gallery.push(file_service_1.fileService.getFileUrl("products", customName));
                }
                else if (f.fieldname.startsWith("variants") &&
                    f.fieldname.endsWith("[image]")) {
                    const match = f.fieldname.match(/^variants\[(\d+)\]\[image\]$/);
                    if (match) {
                        const index = match[1];
                        await file_service_1.fileService.moveFile(f, "products/variants", customName);
                        variantImages[index] = file_service_1.fileService.getFileUrl("products/variants", customName);
                    }
                }
        }
    }
    return { thumbnail, gallery, digitalFileUrl, variantImages };
}
// -------------------- CLEANUP FILES --------------------
async function cleanupFiles(files) {
    const extractFolderAndName = (fileUrl) => {
        const parts = fileUrl.split("/uploads/")[1].split("/"); // ["products", "variants", "file.png"]
        const filename = parts.pop(); // remove last element → file.png
        const folder = parts.join("/"); // join remaining → "products/variants"
        return { folder, filename };
    };
    if (files.thumbnail) {
        const { folder, filename } = extractFolderAndName(files.thumbnail);
        await file_service_1.fileService.deleteFile(folder, filename);
    }
    if (files.digitalFileUrl) {
        const { folder, filename } = extractFolderAndName(files.digitalFileUrl);
        await file_service_1.fileService.deleteFile(folder, filename);
    }
    if (files.gallery) {
        for (const g of files.gallery) {
            const { folder, filename } = extractFolderAndName(g);
            await file_service_1.fileService.deleteFile(folder, filename);
        }
    }
    if (files.variantImages) {
        for (const key in files.variantImages) {
            const { folder, filename } = extractFolderAndName(files.variantImages[key]);
            await file_service_1.fileService.deleteFile(folder, filename);
        }
    }
}
// -------------------- PARSE VARIANTS --------------------
function parseVariants(body) {
    let variants = body.variants;
    // If variants is an array (from FormData with multiple fields), find the JSON string
    if (Array.isArray(variants)) {
        // Filter out empty strings and '[object Object]' strings, find valid JSON
        const jsonString = variants.find((v) => v &&
            typeof v === "string" &&
            v.trim().startsWith("[") &&
            !v.includes("[object Object]"));
        if (jsonString) {
            try {
                variants = JSON.parse(jsonString);
            }
            catch (error) {
                variants = [];
            }
        }
        else {
            variants = [];
        }
    }
    else if (typeof variants === "string") {
        try {
            variants = JSON.parse(variants);
        }
        catch (error) {
            variants = [];
        }
    }
    // Check if variants exist and are already an array
    if (!variants || !Array.isArray(variants)) {
        return [];
    }
    return variants.filter(Boolean).map((v) => ({
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
            .filter((a) => {
            const hasId = a && (a.attribute || a.attributeId);
            const hasValue = a && a.value !== undefined && a.value !== null && a.value !== ""; // Allow 0
            return hasId && hasValue;
        })
            .map((a) => ({
            attribute: a.attribute || a.attributeId,
            value: a.value,
        })),
    }));
}
// -------------------- NORMALIZE PRODUCT --------------------
function normalizeProductBody(body) {
    const parseJSON = (val) => {
        if (!val)
            return [];
        if (Array.isArray(val))
            return val;
        try {
            return JSON.parse(val);
        }
        catch {
            return [];
        }
    };
    const parseGallery = (val) => {
        if (!val)
            return [];
        if (Array.isArray(val))
            return val;
        // Handle comma-separated string
        if (typeof val === "string") {
            // Try JSON parse first
            try {
                const parsed = JSON.parse(val);
                if (Array.isArray(parsed))
                    return parsed;
            }
            catch {
                // If not JSON, split by comma
                return val
                    .split(",")
                    .map((url) => url.trim())
                    .filter(Boolean);
            }
        }
        return [];
    };
    const discount_type = body.discount_type === "" ? null : body.discount_type;
    const parseProductAttributes = (val) => {
        if (!val)
            return [];
        let parsed = val;
        // If it's an array (from FormData), get the first non-empty element
        if (Array.isArray(val)) {
            const firstValid = val.find((item) => item && item !== "");
            if (!firstValid)
                return [];
            parsed = firstValid;
        }
        // If it's a string, try to parse it
        if (typeof parsed === "string") {
            try {
                parsed = JSON.parse(parsed);
            }
            catch {
                return [];
            }
        }
        // Ensure it's an array
        if (!Array.isArray(parsed))
            return [];
        // Transform the data: change 'attribute' to 'attributeId'
        // Only filter out completely invalid items (missing attributeId)
        const result = parsed
            .filter((item) => item && (item.attribute || item.attributeId))
            .map((item) => ({
            attributeId: item.attribute || item.attributeId,
            value: item.value || "",
        }));
        return result;
    };
    return {
        ...body,
        is_published: body.is_published === "true" || body.is_published === true,
        is_digital_product: body.is_digital_product === "true" || body.is_digital_product === true,
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
        is_free_shipping: body.is_free_shipping === "true" || body.is_free_shipping === true,
        brand: body.brand || null,
    };
}
// -------------------- CREATE PRODUCT --------------------
exports.createProduct = (0, asyncHandler_1.default)(async (req, res) => {
    // 1️⃣ Handle file uploads
    const { thumbnail, gallery, digitalFileUrl, variantImages } = await handleFiles(req, req.body.name);
    const parsed = normalizeProductBody(req.body);
    // Ensure variants is always an array
    const { variants = [], ...productPayload } = parsed;
    let product;
    try {
        // 2️⃣ Create product
        product = await product_service_1.productService.createProduct({
            ...productPayload,
            thumbnail,
            gallery,
            file: digitalFileUrl,
        });
        // 3️⃣ Create variants sequentially
        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            if (!v)
                continue;
            try {
                const safeAttributes = (v.attributes || []).map((a) => ({
                    attributeId: new mongoose_1.Types.ObjectId(a.attribute),
                    value: a.value,
                }));
                await variant_service_1.variantService.create({
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
            }
            catch (error) {
                throw error; // Re-throw to trigger rollback
            }
        }
        // 4️⃣ Respond success
        return res
            .status(201)
            .json(new ApiResponse_1.ApiResponse(201, product, "Product created successfully"));
    }
    catch (error) {
        // ❌ Rollback if anything fails
        // Delete product if created
        if (product?._id) {
            try {
                await product_service_1.productService.deleteProduct(String(product._id));
            }
            catch (err) {
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
        }
        catch (err) {
            console.error("Failed to cleanup files during rollback:", err);
        }
        // Forward error
        console.error("Error creating product:", error);
        throw error;
    }
});
// -------------------- UPDATE PRODUCT --------------------
exports.updateProduct = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    // 1️⃣ Handle uploaded files
    const { gallery, digitalFileUrl, thumbnail, variantImages } = await handleFiles(req, req.body.name);
    // 2️⃣ Normalize body
    const parsedBody = normalizeProductBody(req.body);
    // Merge uploaded files
    if (gallery.length)
        parsedBody.gallery = [...(parsedBody.gallery || []), ...gallery];
    if (digitalFileUrl)
        parsedBody.file = digitalFileUrl;
    if (thumbnail)
        parsedBody.thumbnail = thumbnail;
    let updatedProduct;
    const createdVariants = []; // track for rollback
    try {
        // 3️⃣ Update product fields
        updatedProduct = await product_service_1.productService.updateProduct(id, parsedBody);
        // 4️⃣ Handle variants
        const variants = parsedBody.variants || [];
        const existingVariants = await variant_service_1.variantService.getByProduct(id);
        // Map of existing variants by _id for update
        const existingMap = new Map(existingVariants.map((v) => [String(v._id), v]));
        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            if (!v)
                continue;
            const safeAttributes = (v.attributes || []).map(({ attribute, value }) => ({
                attributeId: new mongoose_1.Types.ObjectId(attribute),
                value,
            }));
            if (v._id && existingMap.has(v._id)) {
                // ✅ Update existing variant
                await variant_service_1.variantService.update(v._id, {
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
            }
            else {
                // ✅ Create new variant
                const variant = await variant_service_1.variantService.create({
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
        const deletedVariantImages = [];
        for (const leftover of Array.from(existingMap.values())) {
            if (leftover.image)
                deletedVariantImages.push(leftover.image);
            await variant_service_1.variantService.delete(String(leftover._id));
        }
        // Cleanup deleted variant images
        for (const fileUrl of deletedVariantImages) {
            try {
                const parts = fileUrl.split("/uploads/")[1].split("/");
                const filename = parts.pop();
                const folder = parts.join("/");
                await file_service_1.fileService.deleteFile(folder, filename);
            }
            catch (err) {
                console.error("Failed to delete variant image", fileUrl, err);
            }
        }
        // 6️⃣ Respond success
        res.json(new ApiResponse_1.ApiResponse(200, updatedProduct, "Product updated successfully"));
    }
    catch (error) {
        // Rollback newly created variants
        for (const variantId of createdVariants) {
            try {
                await variant_service_1.variantService.delete(variantId);
            }
            catch { }
        }
        // Cleanup uploaded files
        try {
            await cleanupFiles({
                thumbnail,
                gallery,
                digitalFileUrl,
                variantImages,
            });
        }
        catch { }
        throw error;
    }
});
//list all products with offers and discounts
exports.listAllProductsWithOffers = (0, asyncHandler_1.default)(async (req, res) => {
    const response = await product_service_1.productService.getallOfferProducts();
    res.status(200).json({
        statusCode: 200,
        message: "success",
        success: true,
        response, // spreads data and meta at top level
    });
});
// -------------------- LIST PRODUCTS --------------------
exports.listAllProducts = (0, asyncHandler_1.default)(async (req, res) => {
    const response = await product_service_1.productService.listAllProducts(req.query);
    res.status(200).json({
        statusCode: 200,
        message: "success",
        success: true,
        ...response, // spreads data and meta at top level
    });
});
// -------------------- LIST ACTIVE PRODUCTS --------------------
exports.listActiveProducts = (0, asyncHandler_1.default)(async (req, res) => {
    const response = await product_service_1.productService.listActiveProducts(req.query);
    res.status(200).json({
        statusCode: 200,
        message: "success",
        success: true,
        ...response, // spreads data and meta at top level
    });
});
// -------------------- LIST All ACTIVE Flash Sale PRODUCTS --------------------
exports.listAllActiveFlashSaleProducts = (0, asyncHandler_1.default)(async (req, res) => {
    const response = await product_service_1.productService.listAllActiveFlashSaleProducts(req.query);
    res.status(200).json({
        statusCode: 200,
        message: "success",
        success: true,
        ...response, // spreads data and meta at top level
    });
});
// -------------------- GET PRODUCT --------------------
exports.getProductById = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const product = await product_service_1.productService.getById(id);
    res.json(new ApiResponse_1.ApiResponse(200, product));
});
// -------------------- GET PRODUCT --------------------
exports.getProductByIdWithAllVariants = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const product = await product_service_1.productService.getByIdWithAllVariants(id);
    res.json(new ApiResponse_1.ApiResponse(200, product));
});
// -------------------- GET PRODUCT BY SLUG --------------------
exports.getProductBySlug = (0, asyncHandler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const product = await product_service_1.productService.getBySlug(slug);
    res.json(new ApiResponse_1.ApiResponse(200, product));
});
// -------------------- DELETE SINGLE PRODUCT --------------------
exports.deleteProduct = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    // fetch product with all details
    const product = await product_service_1.productService.getById(id);
    // delete product and its variants
    await product_service_1.productService.deleteProduct(product._id.toString());
    // prepare files for cleanup
    const filesToCleanup = {
        thumbnail: product.thumbnail || null,
        gallery: product.gallery || [],
        digitalFileUrl: product.file || null,
        variantImages: {},
    };
    // add variant images
    if (product.variants?.length) {
        product.variants.forEach((v, index) => {
            if (v.image)
                filesToCleanup.variantImages[index] = v.image;
        });
    }
    // cleanup files
    try {
        await cleanupFiles(filesToCleanup);
    }
    catch (err) {
        console.error("Failed to cleanup files during product deletion:", err);
    }
    res.json(new ApiResponse_1.ApiResponse(200, null, "Product deleted successfully"));
});
// -------------------- DELETE MULTIPLE PRODUCTS --------------------
exports.deleteMultiple = (0, asyncHandler_1.default)(async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids))
        throw new ApiError_1.ApiError(400, "ids array required");
    // fetch all products
    const products = await Promise.all(ids.map((id) => product_service_1.productService.getById(id)));
    // delete products and their variants
    const result = await product_service_1.productService.deleteMultiple(ids);
    // prepare files for cleanup
    const cleanupTasks = products.map((product) => {
        const filesToCleanup = {
            thumbnail: product.thumbnail || null,
            gallery: product.gallery || [],
            digitalFileUrl: product.file || null,
            variantImages: {},
        };
        if (product.variants?.length) {
            product.variants.forEach((v, index) => {
                if (v.image)
                    filesToCleanup.variantImages[index] = v.image;
            });
        }
        return cleanupFiles(filesToCleanup);
    });
    try {
        await Promise.all(cleanupTasks);
    }
    catch (err) {
        console.error("Failed to cleanup files during multiple product deletion:", err);
    }
    res.json(new ApiResponse_1.ApiResponse(200, result, `${result.deletedCount} product(s) deleted`));
});
// -------------------- TOGGLE PRODUCT PUBLISHED --------------------
exports.togglePublished = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const toggled = await product_service_1.productService.togglePublished(id);
    res.json(new ApiResponse_1.ApiResponse(200, toggled, toggled.is_published ? "Published" : "Unpublished"));
});
// -------------------- TOGGLE PRODUCT FLASH SALE --------------------
exports.toggleFlashSale = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const toggled = await product_service_1.productService.toggleFlashSale(id);
    res.json(new ApiResponse_1.ApiResponse(200, toggled, toggled.is_flash_sale ? "Flash Sale Enabled" : "Flash Sale Disabled"));
});
// -------------------- TOGGLE MULTIPLE PRODUCTS PUBLISHED --------------------
exports.toggleMultiplePublished = (0, asyncHandler_1.default)(async (req, res) => {
    const { ids, action } = req.body;
    if (!action || !["publish", "unpublish"].includes(action))
        throw new ApiError_1.ApiError(400, "Invalid action");
    const toggledProducts = await product_service_1.productService.toggleMultiplePublished(ids, action);
    res.json(new ApiResponse_1.ApiResponse(200, null, `${toggledProducts.length} product(s) ${action === "publish" ? "published" : "unpublished"}`));
});
// -------------------- TOGGLE MULTIPLE PRODUCTS FLASH SALE --------------------
exports.toggleMultipleFlashSale = (0, asyncHandler_1.default)(async (req, res) => {
    const { ids, action } = req.body;
    if (!action || !["flash_sale", "disable_flash_sale"].includes(action))
        throw new ApiError_1.ApiError(400, "Invalid action");
    const toggledProducts = await product_service_1.productService.toggleMultipleFlashSale(ids, action);
    res.json(new ApiResponse_1.ApiResponse(200, null, `${toggledProducts.length} product(s) ${action === "flash_sale" ? "flash sale enabled" : "flash sale disabled"}`));
});
//* ------------------------------- Variants Controllers --------------------------------
// -------------------- Delete VARIANT --------------------
exports.deleteVariant = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    // 1️⃣ Fetch the variant to get its image URL
    const variant = await variant_service_1.variantService.getById(id);
    if (!variant)
        throw new ApiError_1.ApiError(404, "Variant not found");
    // 2️⃣ Delete the image from storage if it exists
    if (variant.image) {
        try {
            const parts = variant.image.split("/uploads/")[1].split("/"); // ["products", "variants", "file.png"]
            const filename = parts.pop();
            const folder = parts.join("/");
            await file_service_1.fileService.deleteFile(folder, filename);
        }
        catch (err) {
            console.error("Failed to delete variant image", variant.image, err);
        }
    }
    // 3️⃣ Delete the variant record from DB
    const deleted = await variant_service_1.variantService.delete(id);
    res.json(new ApiResponse_1.ApiResponse(200, deleted, "Variant deleted successfully"));
});
//-------------------------- search products ------------------
exports.getProductSearchController = (0, asyncHandler_1.default)(async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const data = await product_service_1.productService.getSearchSuggestions(q);
    res.status(200).json({
        success: true,
        data,
    });
});
