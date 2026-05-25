import mongoose, { Schema, Document, Model, Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";

export interface IUser extends Document {
  _id: Types.ObjectId; // ← THIS FIXES YOUR PROBLEM
  avatar?: string;
  fullName: string;
  email: string;
  twoStepEmail?: string;
  password: string;
  isActive: boolean;
  loginOtp?: string;
  otpExpires?: Date;
  phoneNumber?: string;
  address?: string;
  refreshToken?: string;
  twoStepEnabled: boolean;
  storeId?: Types.ObjectId; // Current store manage/own
  role: "owner" | "staff";
  permissions: string[];

  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const UserSchema = new Schema<IUser>(
  {
    avatar: { type: String },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    twoStepEmail: { type: String, default: null, lowercase: true, trim: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    twoStepEnabled: { type: Boolean, default: false },
    loginOtp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    phoneNumber: { type: String, default: null },
    address: { type: String, default: null },
    refreshToken: { type: String, default: null },
    storeId: { type: Schema.Types.ObjectId, ref: "Store" },
    role: {
      type: String,
      enum: ["owner", "staff"],
      default: "owner",
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

UserSchema.index({ storeId: 1 });

// Hash password
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password correctly
UserSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Generate access token
UserSchema.methods.generateAccessToken = function (): string {
  const expiresIn = (process.env.JWT_ACCESS_TOKEN_EXPIRY ||
    "1h") as `${number}${"s" | "m" | "h" | "d"}`;
  const options: SignOptions = { expiresIn };

  return jwt.sign(
    { _id: this._id, email: this.email },
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    options
  );
};

// Generate refresh token
UserSchema.methods.generateRefreshToken = function (): string {
  const expiresIn = (process.env.JWT_REFRESH_TOKEN_EXPIRY ||
    "7d") as `${number}${"s" | "m" | "h" | "d"}`;
  const options: SignOptions = { expiresIn };

  return jwt.sign(
    { _id: this._id },
    process.env.JWT_REFRESH_TOKEN_SECRET as string,
    options
  );
};

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
