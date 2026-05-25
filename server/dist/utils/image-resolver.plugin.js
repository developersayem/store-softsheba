"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageResolver = exports.resolveImageUrls = void 0;
/**
 * Resolves relative image paths to full URLs in an object or array
 * @param data The object or array of objects to transform
 * @param fields List of fields to resolve
 * @param options Configuration options
 * @returns The transformed data
 */
const resolveImageUrls = (data, fields, options = {}) => {
    const baseUrl = process.env.BASE_URL || "";
    const excludeFields = options.excludePlaceholderFields || [];
    const resolveSingleUrl = (path, fieldName) => {
        // If no path is provided
        if (!path || path === "" || path === "null" || path === "undefined") {
            // Return null if field is in exclusion list, otherwise return placeholder
            if (fieldName && excludeFields.includes(fieldName)) {
                return null;
            }
            return `${baseUrl}/public/placeholder.png`;
        }
        // Handle arrays (e.g., gallery)
        if (Array.isArray(path)) {
            return path.map((p) => resolveSingleUrl(p, fieldName));
        }
        if (typeof path !== "string")
            return path;
        // Handle relative paths
        if (!path.startsWith("http")) {
            let resolvedPath = path;
            // Ensure it starts with a leading slash for consistency
            if (!resolvedPath.startsWith("/")) {
                // Only prepend /uploads/ if it's not a known system folder (public/ or uploads/)
                if (!resolvedPath.startsWith("uploads") && !resolvedPath.startsWith("public")) {
                    resolvedPath = `/uploads/${resolvedPath}`;
                }
                else {
                    resolvedPath = `/${resolvedPath}`;
                }
            }
            return `${baseUrl}${resolvedPath}`;
        }
        return path;
        return path;
    };
    const transformObject = (obj, currentFields, prefix = "") => {
        if (!obj || typeof obj !== "object")
            return obj;
        // Convert Mongoose document to plain object if needed
        let result = obj;
        if (typeof obj.toObject === "function") {
            result = obj.toObject();
        }
        else {
            result = Array.isArray(obj) ? [...obj] : { ...obj };
        }
        currentFields.forEach((field) => {
            const parts = field.split(".");
            const firstPart = parts[0];
            const remainingParts = parts.slice(1).join(".");
            const fullFieldName = prefix ? `${prefix}.${firstPart}` : firstPart;
            if (parts.length === 1) {
                if (result[firstPart] !== undefined) {
                    result[firstPart] = resolveSingleUrl(result[firstPart], fullFieldName);
                }
            }
            else {
                if (result[firstPart]) {
                    if (Array.isArray(result[firstPart])) {
                        result[firstPart] = result[firstPart].map((item) => transformObject(item, [remainingParts], fullFieldName));
                    }
                    else {
                        result[firstPart] = transformObject(result[firstPart], [remainingParts], fullFieldName);
                    }
                }
            }
        });
        return result;
    };
    if (Array.isArray(data)) {
        return data.map((item) => transformObject(item, fields));
    }
    return transformObject(data, fields);
};
exports.resolveImageUrls = resolveImageUrls;
/**
 * Mongoose plugin to resolve relative image paths to full URLs
 */
const imageResolver = (schema, options) => {
    const transform = (doc, ret) => {
        return (0, exports.resolveImageUrls)(ret, options.fields, {
            excludePlaceholderFields: options.excludePlaceholderFields,
        });
    };
    // ... rest of the code for toJSON/toObject ...
    const originalToJSON = schema.get("toJSON");
    const originalToObject = schema.get("toObject");
    schema.set("toJSON", {
        ...originalToJSON,
        transform: (doc, ret, opt) => {
            let transformed = transform(doc, ret);
            if (typeof originalToJSON?.transform === "function") {
                transformed = originalToJSON.transform(doc, transformed, opt);
            }
            return transformed;
        },
    });
    schema.set("toObject", {
        ...originalToObject,
        transform: (doc, ret, opt) => {
            let transformed = transform(doc, ret);
            if (typeof originalToObject?.transform === "function") {
                transformed = originalToObject.transform(doc, transformed, opt);
            }
            return transformed;
        },
    });
};
exports.imageResolver = imageResolver;
