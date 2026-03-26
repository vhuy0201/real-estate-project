"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/deal.model.ts
var mongoose_1 = require("mongoose");
require("./offer.model");
var DealSchema = new mongoose_1.Schema({
    property_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Property", required: true },
    offer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Offer", required: true },
    buyer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    seller_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    agent_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
        type: String,
        enum: ["active", "awaiting_contract", "contract_under_review", "escrow_funded", "completed", "cancelled"],
        default: "active",
    },
    amounts: {
        agreed_price: { type: Number, required: true },
        currency: { type: String, default: "VND" },
        platform_fee: { type: Number },
        agent_fee: { type: Number },
        seller_payout: { type: Number },
    },
    audit: {
        created_from_offer_at: { type: Date },
        completed_at: { type: Date },
        cancelled_at: { type: Date },
        cancellation_reason: { type: String },
    },
    compliance: {
        kyc_verified_buyer: { type: Boolean, default: false },
        kyc_verified_seller: { type: Boolean, default: false },
    },
    meta: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
DealSchema.index({ seller_id: 1, agent_id: 1, buyer_id: 1, status: 1 });
DealSchema.index({ property_id: 1 });
DealSchema.index({ "audit.created_from_offer_at": -1 });
DealSchema.index({ "audit.completed_at": -1 });
exports.default = mongoose_1.default.model("Deal", DealSchema);
