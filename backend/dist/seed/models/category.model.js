"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var CategorySchema = new mongoose_1.Schema({
    category_name: {
        vi: { type: String, required: true, trim: true },
        en: { type: String, required: true, trim: true },
    },
    deleted: { type: Boolean, default: false },
}, { timestamps: true });
CategorySchema.index({ "category_name.vi": 1 }, { unique: true, sparse: true });
CategorySchema.index({ "category_name.en": 1 }, { unique: true, sparse: true });
exports.default = mongoose_1.default.model("Category", CategorySchema);
