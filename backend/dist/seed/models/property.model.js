"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
require("./city.model");
require("./district.model");
require("./ward.model");
require("./category.model");
require("./propertyType.model");
require("./feature.model");
require("./user.model");
var PropertySchema = new mongoose_1.Schema({
    title: {
        vi: { type: String, required: true, trim: true },
        en: { type: String, required: true, trim: true },
    },
    description: {
        vi: { type: String, trim: true },
        en: { type: String, trim: true },
    },
    price: { type: Number, required: true, min: 0 },
    // địa chỉ chi tiết property (đường, số nhà, ...)
    address: {
        vi: { type: String, required: true, trim: true },
        en: { type: String, required: true, trim: true },
    },
    bedrooms: { type: Number, default: 0, min: 0 },
    bathrooms: { type: Number, default: 0, min: 0 },
    area: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ["m2", "ft2"], default: "m2" },
    yearBuilt: { type: Number },
    floors: { type: Number, default: 1, min: 0 },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number },
    },
    city_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "City", required: true },
    district_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "District", required: true },
    ward_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Ward", required: true },
    type_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "PropertyType", required: true },
    category_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category", required: true },
    owner_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    agent_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    assignmentHistory: [
        {
            agent_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
            assignedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
            action: {
                type: String,
                enum: ["assign", "remove", "reject", "cancel", "request"],
                required: true,
            },
            assignedAt: { type: Date, default: Date.now },
        },
    ],
    features: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Feature" }],
    images: [{ type: String }],
    status: {
        type: String,
        enum: ["available", "pending", "approved", "sold", "rejected"],
        default: "available",
    },
    reviewedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    publishedAt: { type: Date },
    hiddenNote: { type: String, trim: true },
    deleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Property", PropertySchema);
