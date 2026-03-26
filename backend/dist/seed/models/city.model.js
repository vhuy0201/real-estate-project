"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var CitySchema = new mongoose_1.Schema({
    city_name: {
        vi: { type: String, required: true, trim: true },
        en: { type: String, required: true, trim: true },
    },
    deleted: { type: Boolean, default: false },
}, { timestamps: true });
//  Unique index theo từng ngôn ngữ
CitySchema.index({ "city_name.vi": 1 }, { unique: true, sparse: true });
CitySchema.index({ "city_name.en": 1 }, { unique: true, sparse: true });
exports.default = mongoose_1.default.model("City", CitySchema);
