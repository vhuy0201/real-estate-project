"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_OFFER_CURRENCIES = void 0;
// src/models/offer.model.ts
var mongoose_1 = require("mongoose");
exports.SUPPORTED_OFFER_CURRENCIES = ["VND", "USD", "EUR"];
var OfferSchema = new mongoose_1.Schema({
    property_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Property", required: true },
    buyer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    seller_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    agent_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true, min: 0 },
    currency: {
        type: String,
        enum: exports.SUPPORTED_OFFER_CURRENCIES,
        default: "VND",
    },
    note: { type: String, trim: true },
    status: {
        type: String,
        enum: ["pending", "forwarded_to_seller", "seller_reviewing", "accepted", "rejected", "cancelled"],
        default: "pending",
    },
    forwarded_at: { type: Date },
    reviewed_by: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    reviewed_at: { type: Date },
    rejection_reason: { type: String, trim: true },
    expires_at: { type: Date },
    attachments: [{ type: String }],
    meta: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
OfferSchema.path("amount").validate(function (value) { return value > 0; }, "Offer amount must be greater than 0");
OfferSchema.index({ property_id: 1, buyer_id: 1, status: 1 });
OfferSchema.index({ agent_id: 1, seller_id: 1, status: 1 });
OfferSchema.index({ expires_at: 1 });
exports.default = mongoose_1.default.model("Offer", OfferSchema);
