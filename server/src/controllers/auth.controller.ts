import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { ApiResponse } from "../utils/ApiResponse";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const user = await authService.registerUser(name, email, password);
    res.status(201).json(
      new ApiResponse(201, { user: { id: user.id, name: user.name, email: user.email } }, "User registered successfully")
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const data = await authService.loginUser(email, password);
    res.status(200).json(
      new ApiResponse(200, data, "Login successful")
    );
  } catch (error) {
    next(error);
  }
};
