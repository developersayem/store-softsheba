import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { brandService } from "../services/brand.service";
import { ApiResponse } from "../utils/ApiResponse";

// ------------------ Create ------------------
export const createBrand = asyncHandler(async (req: Request, res: Response) => {
  const data = await brandService.create(req.body, req.file);
  res.status(201).json(new ApiResponse(201, data, "Brand created"));
});

// ------------------ Update ------------------
export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
  const data = await brandService.update(
    req.params.id as string,
    req.body,
    req.file
  );
  res.json(new ApiResponse(200, data, "Brand updated"));
});

// ------------------ Delete ------------------
export const deleteBrand = asyncHandler(async (req: Request, res: Response) => {
  const data = await brandService.delete(req.params.id as string);
  res.json(new ApiResponse(200, null, data.message));
});

// ------------------ Delete Multiple ------------------
export const deleteMultipleBrands = asyncHandler(
  async (req: Request, res: Response) => {
    const count = await brandService.deleteMultiple(req.body.ids);
    res.json(
      new ApiResponse(200, null, `${count} brand(s) deleted successfully`)
    );
  }
);

// ------------------ Toggle Published ------------------
export const togglePublished = asyncHandler(
  async (req: Request, res: Response) => {
    const status = await brandService.togglePublished(req.params.id as string);
    res.json(
      new ApiResponse(
        200,
        null,
        status ? "Brand published" : "Brand unpublished"
      )
    );
  }
);

// ------------------ Toggle Featured ------------------
export const toggleFeatured = asyncHandler(
  async (req: Request, res: Response) => {
    const status = await brandService.toggleFeatured(req.params.id as string);
    res.json(
      new ApiResponse(200, null, status ? "Brand featured" : "Brand unfeatured")
    );
  }
);

// ------------------ Toggle Multiple Published ------------------
export const toggleMultiplePublished = asyncHandler(
  async (req: Request, res: Response) => {
    const status = await brandService.toggleMultiplePublished(
      req.body.ids,
      req.body.action
    );
    res.json(
      new ApiResponse(
        200,
        null,
        `Brands ${status ? "published" : "unpublished"} successfully`
      )
    );
  }
);

// ------------------ Toggle Multiple Featured ------------------
export const toggleMultipleFeatured = asyncHandler(
  async (req: Request, res: Response) => {
    const status = await brandService.toggleMultipleFeatured(
      req.body.ids,
      req.body.action
    );
    res.json(
      new ApiResponse(
        200,
        null,
        `Brands ${status ? "featured" : "unfeatured"} successfully`
      )
    );
  }
);

// ------------------ Get All Brands ------------------
export const getAllBrands = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await brandService.getAll();
    res.json(new ApiResponse(200, data));
  }
);

// ------------------ Import Brands ------------------
export const importBrands = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) throw new Error("No file uploaded");
    const ext = req.file.originalname.split(".").pop()?.toLowerCase()!;
    const count = await brandService.importBrands(req.file.path, ext);
    res.json(
      new ApiResponse(200, null, `${count} brands imported successfully`)
    );
  }
);
