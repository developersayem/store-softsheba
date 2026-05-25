"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserSchema = new mongoose_1.Schema({
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
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Store" },
    role: {
        type: String,
        enum: ["owner", "staff"],
        default: "owner",
    },
    permissions: {
        type: [String],
        default: [],
    },
}, { timestamps: true });
UserSchema.index({ storeId: 1 });
// Hash password
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    this.password = await bcrypt_1.default.hash(this.password, 10);
    next();
});
// Compare password correctly
UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt_1.default.compare(password, this.password);
};
// Generate access token
UserSchema.methods.generateAccessToken = function () {
    const expiresIn = (process.env.JWT_ACCESS_TOKEN_EXPIRY ||
        "1h");
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign({ _id: this._id, email: this.email }, process.env.JWT_ACCESS_TOKEN_SECRET, options);
};
// Generate refresh token
UserSchema.methods.generateRefreshToken = function () {
    const expiresIn = (process.env.JWT_REFRESH_TOKEN_EXPIRY ||
        "7d");
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign({ _id: this._id }, process.env.JWT_REFRESH_TOKEN_SECRET, options);
};
exports.User = mongoose_1.default.model("User", UserSchema);
