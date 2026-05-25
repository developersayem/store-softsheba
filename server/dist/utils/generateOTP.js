"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = void 0;
const generateOTP = (length = 6) => {
    let otp = "";
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10); // random digit 0–9
    }
    return otp;
};
exports.generateOTP = generateOTP;
