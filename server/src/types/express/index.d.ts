import mongoose from "mongoose";
import { IUser } from "../../models/user.model";
import { IStore } from "../../models/store.model";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      storeId?: mongoose.Types.ObjectId;
      store?: IStore;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}
