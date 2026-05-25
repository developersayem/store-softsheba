"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = validate;
const express_validator_1 = require("express-validator");
function validate(validations) {
    return async (req, res, next) => {
        for (let validation of validations) {
            await validation.run(req);
        }
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    };
}
