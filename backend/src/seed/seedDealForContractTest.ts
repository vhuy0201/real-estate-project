// Seed: Create Buyer/Seller/Agent, Property, Offer, Deal for contract upload testing (U022)
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model";
import Property from "../models/property.model";
import Offer from "../models/offer.model";
import Deal from "../models/deal.model";

dotenv.config();
const MONGO_URI = process.env.MONGO_URL || "your_mongodb_atlas_url_here";

async function ensureUser(email: string, fullName: string, role: "buyer" | "seller" | "agent") {
  let user = await User.findOne({ email });
  if (user) return user;
  user = await User.create({
    fullName,
    email,
    password: "123456",
    role,
    isActive: true,
  });
  return user;
}

async function ensureProperty(titleEn: string, sellerId: mongoose.Types.ObjectId, agentId: mongoose.Types.ObjectId) {
  let property = await Property.findOne({
    "title.en": titleEn,
    owner_id: sellerId,
    agent_id: agentId,
  });
  if (property) return property;

  property = await Property.create({
    title: { vi: "Nhà test hợp đồng 2", en: titleEn },
    description: {
      vi: "BĐS dùng cho test upload hợp đồng (U022).",
      en: "Property for contract upload testing (U022).",
    },
    price: 3500000000,
    address: { vi: "Số 1 Test, Quận 1, HCM", en: "1 Test St, District 1, HCMC" },
    bedrooms: 2,
    bathrooms: 2,
    area: 80,
    unit: "m2",
    floors: 10,
    city_id: new mongoose.Types.ObjectId(), // dummy refs acceptable for testing UI; adjust if you require real city/type/category IDs
    district_id: new mongoose.Types.ObjectId(),
    ward_id: new mongoose.Types.ObjectId(),
    type_id: new mongoose.Types.ObjectId(),
    category_id: new mongoose.Types.ObjectId(),
    owner_id: sellerId,
    agent_id: agentId,
    images: [],
    status: "approved",
  });

  return property;
}

async function run() {
  try {
    console.log("🚀 Connecting MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected");

    // Ensure users
    const buyer = await ensureUser("buyer1.contract.test@example.com", "Buyer Contract Test", "buyer");
    const seller = await ensureUser("seller1.contract.test@example.com", "Seller Contract Test", "seller");
    const agent = await ensureUser("agent1.contract.test@example.com", "Agent Contract Test", "agent");

        // Ensure property (with seller/agent)
        const property = await ensureProperty("Contract Test Property", seller._id as mongoose.Types.ObjectId, agent._id as mongoose.Types.ObjectId);

    // Create an accepted offer (for linkage)
    const offer = await Offer.create({
      property_id: property._id,
      buyer_id: buyer._id,
      amount: 3000000000,
      status: "accepted",
    });

    // Create deal in a state allowing contract upload
    const deal = await Deal.create({
      property_id: property._id,
      offer_id: offer._id,
      buyer_id: buyer._id,
      seller_id: seller._id,
      agent_id: agent._id,
      status: "awaiting_contract",
      amounts: {
        agreed_price: 3000000000,
        currency: "VND",
        platform_fee: 10000000,
        agent_fee: 20000000,
        seller_payout: 3000000000 - 10000000 - 20000000,
      },
      audit: {
        created_from_offer_at: new Date(),
      },
      compliance: {
        kyc_verified_buyer: false,
        kyc_verified_seller: false,
      },
      meta: { seed: "U022" },
    });

    console.log("✅ Seeded successfully!");
    console.log("Users:");
    console.log(`  Buyer  email: ${buyer.email} | password: 123456 | id: ${buyer._id}`);
    console.log(`  Seller email: ${seller.email} | password: 123456 | id: ${seller._id}`);
    console.log(`  Agent  email: ${agent.email} | password: 123456 | id: ${agent._id}`);
    console.log("Property:");
    console.log(`  id: ${property._id} | title: ${property.title.en}`);
    console.log("Offer:");
    console.log(`  id: ${offer._id} | status: ${offer.status} | amount: ${offer.amount}`);
    console.log("Deal:");
    console.log(`  id: ${deal._id} | status: ${deal.status}`);
    console.log("");
    console.log("Postman test URLs (assuming http://localhost:3000):");
    console.log(`  GET    /api/client/agent/deals/${deal._id}/contract`);
    console.log(`  POST   /api/client/agent/deals/${deal._id}/contract (form-data: file)`);
    console.log(`  PUT    /api/client/agent/deals/${deal._id}/contract  (form-data: file)`);
    console.log(`  DELETE /api/client/agent/deals/${deal._id}/contract`);
  } catch (e) {
    console.error("❌ Seed error:", e);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

run();

