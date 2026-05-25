import { notificationService } from "../services/notification.service";
import { supportService } from "../services/support.service";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

export const getSupportMails = asyncHandler(async (req, res) => {
  const data = await supportService.getAll();
  res.json(new ApiResponse(200, data));
});

export const getSupportMailById = asyncHandler(async (req, res) => {
  const id = req.params.id as string;
  const data = await supportService.getById(id);
  res.json(new ApiResponse(200, data));
});

export const takeSupportMails = asyncHandler(async (req, res) => {
  const data = await supportService.create(req.body);
  const notification = await notificationService.createNotification({
    title: "New Support Mail Received!",
    message: String(data.message),
    supportId: String(data._id),
    type: "support",
  });
  res.status(200).json("Support Inquery Taken");
});
