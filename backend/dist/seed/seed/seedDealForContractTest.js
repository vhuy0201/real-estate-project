"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// Seed: Create Buyer/Seller/Agent, Property, Offer, Deal for contract upload testing (U022)
var mongoose_1 = require("mongoose");
var dotenv_1 = require("dotenv");
var user_model_1 = require("../models/user.model");
var property_model_1 = require("../models/property.model");
var offer_model_1 = require("../models/offer.model");
var deal_model_1 = require("../models/deal.model");
dotenv_1.default.config();
var MONGO_URI = process.env.MONGO_URL || "your_mongodb_atlas_url_here";
function ensureUser(email, fullName, role) {
    return __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, user_model_1.default.findOne({ email: email })];
                case 1:
                    user = _a.sent();
                    if (user)
                        return [2 /*return*/, user];
                    return [4 /*yield*/, user_model_1.default.create({
                            fullName: fullName,
                            email: email,
                            password: "123456",
                            role: role,
                            isActive: true,
                        })];
                case 2:
                    user = _a.sent();
                    return [2 /*return*/, user];
            }
        });
    });
}
function ensureProperty(titleEn, sellerId, agentId) {
    return __awaiter(this, void 0, void 0, function () {
        var property;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, property_model_1.default.findOne({
                        "title.en": titleEn,
                        owner_id: sellerId,
                        agent_id: agentId,
                    })];
                case 1:
                    property = _a.sent();
                    if (property)
                        return [2 /*return*/, property];
                    return [4 /*yield*/, property_model_1.default.create({
                            title: { vi: "Nhà test hợp đồng", en: titleEn },
                            description: {
                                vi: "BĐS dùng cho test upload hợp đồng (U022).",
                                en: "Property for contract upload testing (U022).",
                            },
                            price: 2500000000,
                            address: { vi: "Số 1 Test, Quận 1, HCM", en: "1 Test St, District 1, HCMC" },
                            bedrooms: 2,
                            bathrooms: 2,
                            area: 80,
                            unit: "m2",
                            floors: 10,
                            city_id: new mongoose_1.default.Types.ObjectId(), // dummy refs acceptable for testing UI; adjust if you require real city/type/category IDs
                            district_id: new mongoose_1.default.Types.ObjectId(),
                            ward_id: new mongoose_1.default.Types.ObjectId(),
                            type_id: new mongoose_1.default.Types.ObjectId(),
                            category_id: new mongoose_1.default.Types.ObjectId(),
                            owner_id: sellerId,
                            agent_id: agentId,
                            images: [],
                            status: "approved",
                        })];
                case 2:
                    property = _a.sent();
                    return [2 /*return*/, property];
            }
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var buyer, seller, agent, property, offer, deal, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, 9, 11]);
                    console.log("🚀 Connecting MongoDB...");
                    return [4 /*yield*/, mongoose_1.default.connect(MONGO_URI)];
                case 1:
                    _a.sent();
                    console.log("✅ Connected");
                    return [4 /*yield*/, ensureUser("buyer.contract.test@example.com", "Buyer Contract Test", "buyer")];
                case 2:
                    buyer = _a.sent();
                    return [4 /*yield*/, ensureUser("seller.contract.test@example.com", "Seller Contract Test", "seller")];
                case 3:
                    seller = _a.sent();
                    return [4 /*yield*/, ensureUser("agent.contract.test@example.com", "Agent Contract Test", "agent")];
                case 4:
                    agent = _a.sent();
                    return [4 /*yield*/, ensureProperty("Contract Test Property", seller._id, agent._id)];
                case 5:
                    property = _a.sent();
                    return [4 /*yield*/, offer_model_1.default.create({
                            property_id: property._id,
                            buyer_id: buyer._id,
                            amount: 2000000000,
                            status: "accepted",
                        })];
                case 6:
                    offer = _a.sent();
                    return [4 /*yield*/, deal_model_1.default.create({
                            property_id: property._id,
                            offer_id: offer._id,
                            buyer_id: buyer._id,
                            seller_id: seller._id,
                            agent_id: agent._id,
                            status: "awaiting_contract",
                            amounts: {
                                agreed_price: 2000000000,
                                currency: "VND",
                                platform_fee: 10000000,
                                agent_fee: 20000000,
                                seller_payout: 2000000000 - 10000000 - 20000000,
                            },
                            audit: {
                                created_from_offer_at: new Date(),
                            },
                            compliance: {
                                kyc_verified_buyer: false,
                                kyc_verified_seller: false,
                            },
                            meta: { seed: "U022" },
                        })];
                case 7:
                    deal = _a.sent();
                    console.log("✅ Seeded successfully!");
                    console.log("Users:");
                    console.log("  Buyer  email: ".concat(buyer.email, " | password: 123456 | id: ").concat(buyer._id));
                    console.log("  Seller email: ".concat(seller.email, " | password: 123456 | id: ").concat(seller._id));
                    console.log("  Agent  email: ".concat(agent.email, " | password: 123456 | id: ").concat(agent._id));
                    console.log("Property:");
                    console.log("  id: ".concat(property._id, " | title: ").concat(property.title.en));
                    console.log("Offer:");
                    console.log("  id: ".concat(offer._id, " | status: ").concat(offer.status, " | amount: ").concat(offer.amount));
                    console.log("Deal:");
                    console.log("  id: ".concat(deal._id, " | status: ").concat(deal.status));
                    console.log("");
                    console.log("Postman test URLs (assuming http://localhost:3000):");
                    console.log("  GET    /api/client/agent/deals/".concat(deal._id, "/contract"));
                    console.log("  POST   /api/client/agent/deals/".concat(deal._id, "/contract (form-data: file)"));
                    console.log("  PUT    /api/client/agent/deals/".concat(deal._id, "/contract  (form-data: file)"));
                    console.log("  DELETE /api/client/agent/deals/".concat(deal._id, "/contract"));
                    return [3 /*break*/, 11];
                case 8:
                    e_1 = _a.sent();
                    console.error("❌ Seed error:", e_1);
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, mongoose_1.default.disconnect()];
                case 10:
                    _a.sent();
                    console.log("🔌 Disconnected");
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
run();
