"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var WardSchema = new mongoose_1.Schema({
    ward_name: {
        vi: { type: String, required: true, trim: true },
        en: { type: String, required: true, trim: true },
    },
    district_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "District",
        required: true,
    },
    deleted: { type: Boolean, default: false },
}, { timestamps: true });
// Unique index theo tên + parent district
WardSchema.index({ "ward_name.vi": 1, district_id: 1 }, { unique: true, sparse: true });
WardSchema.index({ "ward_name.en": 1, district_id: 1 }, { unique: true, sparse: true });
exports.default = mongoose_1.default.model("Ward", WardSchema);
