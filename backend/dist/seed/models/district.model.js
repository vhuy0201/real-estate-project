"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var DistrictSchema = new mongoose_1.Schema({
    district_name: {
        vi: { type: String, required: true, trim: true },
        en: { type: String, required: true, trim: true },
    },
    city_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "City",
        required: true,
    },
    deleted: { type: Boolean, default: false },
}, { timestamps: true });
// Unique index theo tên + parent city
DistrictSchema.index({ "district_name.vi": 1, city_id: 1 }, { unique: true, sparse: true });
DistrictSchema.index({ "district_name.en": 1, city_id: 1 }, { unique: true, sparse: true });
exports.default = mongoose_1.default.model("District", DistrictSchema);
