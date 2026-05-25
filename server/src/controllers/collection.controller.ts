import asyncHandler from "../utils/asyncHandler";
import { collectionService } from "../services/collection.service";
import { ApiResponse } from "../utils/ApiResponse";
import { Request, Response } from "express";

export const createCollection = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await collectionService.create(req.body, req.file);
    res.status(201).json(new ApiResponse(201, data, "Collection created"));
  }
);

export const collectionReorder=asyncHandler(
  async (req: Request, res: Response) => {
    const updates = req.body.updates; // Expecting [{ id: string, order: number }, ...]
    await collectionService.updateOrder(updates);
    res.json(new ApiResponse(200, null, "Collection order updated successfully"));
  }
);

export const updateCollection = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await collectionService.update(
      req.params.id as string,
      req.body,
      req.file
    );
    res.json(new ApiResponse(200, data, "Collection updated"));
  }
);

export const deleteCollection = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await collectionService.delete(req.params.id as string);
    res.json(new ApiResponse(200, data.message));
  }
);

export const deleteMultipleCollections = asyncHandler(
  async (req: Request, res: Response) => {
    const count = await collectionService.deleteMultiple(req.body.ids);
    res.json(
      new ApiResponse(200, null, `${count} collection(s) deleted successfully`)
    );
  }
);

export const togglePublished = asyncHandler(
  async (req: Request, res: Response) => {
    const status = await collectionService.togglePublished(
      req.params.id as string
    );
    res.json(
      new ApiResponse(
        200,
        null,
        status ? "Collection published" : "Collection unpublished"
      )
    );
  }
);

export const toggleFeatured = asyncHandler(
  async (req: Request, res: Response) => {
    const status = await collectionService.toggleFeatured(
      req.params.id as string
    );
    res.json(
      new ApiResponse(
        200,
        null,
        status ? "Collection featured" : "Collection unfeatured"
      )
    );
  }
);

export const toggleMultiplePublished = asyncHandler(
  async (req: Request, res: Response) => {
    const status = await collectionService.toggleMultiplePublished(
      req.body.ids,
      req.body.action
    );
    res.json(
      new ApiResponse(
        200,
        null,
        `Collections ${status ? "published" : "unpublished"} successfully`
      )
    );
  }
);

export const toggleMultipleFeatured = asyncHandler(
  async (req: Request, res: Response) => {
    const status = await collectionService.toggleMultipleFeatured(
      req.body.ids,
      req.body.action
    );
    res.json(
      new ApiResponse(
        200,
        null,
        `Collections ${status ? "featured" : "unfeatured"} successfully`
      )
    );
  }
);

export const getAllCollections = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await collectionService.getAll();
    res.json(new ApiResponse(200, data));
  }
);

export const getAllCollectionsWithProducts = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await collectionService.getAllWithProducts();
    res.json(new ApiResponse(200, data));
  }
);

export const getProductsByCollection = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await collectionService.getBySlug(req.params.slug as string);
    res.json(new ApiResponse(200, data));
  }
);

export const importCollections = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) throw new Error("No file uploaded");
    const ext = req.file.originalname.split(".").pop()?.toLowerCase()!;
    const count = await collectionService.importCollections(req.file.path, ext);
    res.json(
      new ApiResponse(200, null, `${count} collections imported successfully`)
    );
  }
);
