// src/seed/report2024.seed.ts
import mongoose from "mongoose";
import User from "../models/user.model";
import Property from "../models/property.model";
import Deal from "../models/deal.model";
import Payment from "../models/payment.model";
import Appointment from "../models/appointment.model";

export async function seedReport2024() {
  console.log("===== SEED DATA 2024 START =====");

  // 1. Tạo users
  const admin = await User.create({
    fullName: "Admin System 1",
    email: "admin12Dwello2024@test.com",
    password: "123456",
    role: "admin",
    isVerified: true,
  });

  const agent = await User.create({
    fullName: "Tran Thi Thuy 1",
    email: "thuytranthi22024@test.com",
    password: "123456",
    role: "agent",
    isVerified: true,
  });

  const seller = await User.create({
    fullName: "Dang Van Kha 1",
    email: "dangvankha12024@test.com",
    password: "123456",
    role: "seller",
    isVerified: true,
  });

  const buyer = await User.create({
    fullName: "Le Van Minh Nhat 1",
    email: "nhatvanminhle12024@test.com",
    password: "123456",
    role: "buyer",
    isVerified: true,
  });

  // 2. Property
  const property = await Property.create({
    title: { vi: "Căn hộ test 2024", en: "Test Apartment 2024" },
    description: { vi: "Mô tả", en: "Description" },
    price: 2300000000,
    address: { vi: "123 Đường ABC", en: "123 ABC Street" },
    bedrooms: 2,
    bathrooms: 2,
    area: 70,
    unit: "m2",
    floors: 20,
    coordinates: {
      type: "Point",
      coordinates: [107.59546, 16.4619], // [longitude, latitude]
    },
    city_id: "6911c7a12792669a371b6226",
    district_id: "6912f0eb2792669a371bb9ab",
    ward_id: "6912f0ed2792669a371bb9ad",
    type_id: "690c25336a0da4df8e483c74",
    category_id: "690c25336a0da4df8e483c6f",
    owner_id: seller._id,
    agent_id: agent._id,
    status: "sold",
    deleted: false,
  });

  // 3. Deal completed trong 2024
  const completedDate = new Date("2024-05-15T10:00:00");

  const deal = await Deal.create({
    property_id: property._id,
    offer_id: new mongoose.Types.ObjectId(),
    buyer_id: buyer._id,
    seller_id: seller._id,
    agent_id: agent._id,
    status: "completed",
    amounts: {
      agreed_price: 2300000000,
      platform_fee: 20000000,
      agent_fee: 30000000,
      seller_payout: 2250000000,
      currency: "VND",
    },
    audit: {
      completed_at: completedDate,
    },
  });

  // 4. Payments completed 2024
  await Payment.create([
    {
      deal_id: deal._id,
      type: "platform_fee",
      amount: 20000000,
      currency: "VND",
      status: "completed",
      method: "bank_transfer",
      initiated_by: buyer._id,
      payment_date: completedDate,
    },
    {
      deal_id: deal._id,
      type: "agent_fee",
      amount: 30000000,
      currency: "VND",
      status: "completed",
      method: "bank_transfer",
      initiated_by: buyer._id,
      payment_date: completedDate,
    },
  ]);

  // 5. Appointment
  await Appointment.create({
    property_id: property._id,
    buyer_id: buyer._id,
    agent_id: agent._id,
    seller_id: seller._id,
    times: [
      { time: new Date("2025-12-05T09:00:00") },
      { time: new Date("2025-12-05T09:00:00") },
    ],
    final_time: new Date("2025-12-06T09:00:00"),
    status: "completed",
  }, { validateBeforeSave: false });

  console.log("===== SEED DATA 2024 DONE =====");
}
