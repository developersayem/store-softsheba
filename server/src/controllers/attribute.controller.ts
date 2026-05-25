// controllers/attribute.controller.ts
import asyncHandler from "../utils/asyncHandler";
import { attributeService } from "../services/attribute.service";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

// ------------------------------------------------------
// CREATE
// ------------------------------------------------------
export const createAttribute = asyncHandler(async (req, res) => {
  const data = await attributeService.create(req.body);
  res.status(201).json(new ApiResponse(201, data, "Attribute created"));
});

// ------------------------------------------------------
// UPDATE
// ------------------------------------------------------
export const updateAttribute = asyncHandler(async (req, res) => {
  const data = await attributeService.update(req.params.id as string, req.body);
  res.json(new ApiResponse(200, data, "Attribute updated"));
});

// ------------------------------------------------------
// DELETE SINGLE
// ------------------------------------------------------
export const deleteAttribute = asyncHandler(async (req, res) => {
  const data = await attributeService.delete(req.params.id as string);
  res.json(new ApiResponse(200, data, "Attribute deleted"));
});

// ------------------------------------------------------
// DELETE MULTIPLE
// ------------------------------------------------------
export const deleteMultipleAttributes = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  const deletedCount = await attributeService.deleteMultiple(ids);

  res.json(
    new ApiResponse(200, { deletedCount }, `${deletedCount} attributes deleted`)
  );
});

// ------------------------------------------------------
// GET ALL
// ------------------------------------------------------
export const getAttributes = asyncHandler(async (req, res) => {
  const data = await attributeService.getAll(req.query);
  res.json(new ApiResponse(200, data));
});

// ------------------------------------------------------
// TOGGLE SINGLE ACTIVE
// ------------------------------------------------------
export const toggleAttributeStatus = asyncHandler(async (req, res) => {
  const data = await attributeService.toggleStatus(req.params.id as string);
  res.json(new ApiResponse(200, data, "Attribute status updated"));
});

// ------------------------------------------------------
// TOGGLE MULTIPLE ACTIVE
// ------------------------------------------------------
export const toggleMultipleAttributes = asyncHandler(async (req, res) => {
  const { ids, action } = req.body;

  const isActive = await attributeService.toggleMultiple(ids, action);

  res.json(
    new ApiResponse(
      200,
      { isActive },
      `Attributes ${isActive ? "activated" : "deactivated"}`
    )
  );
});

// ------------------------------------------------------
// IMPORT (JSON + CSV)
// ------------------------------------------------------
export const importAttributes = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  const ext = req.file.originalname.split(".").pop();
  if (!ext) throw new ApiError(400, "File extension missing");

  const count = await attributeService.importAttributes(req.file.path, ext);

  res.json(new ApiResponse(200, { count }, `${count} attributes imported`));
});
