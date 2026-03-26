import mongoose from "mongoose";
import Property from "../../models/property.model";
import { notifyPropertyStatus } from "../../utils/notificationHelper";

export type ApproveStatus = "approved" | "rejected";

export const adminPropertyService = {
  async updateStatus(
    propertyId: string,
    status: ApproveStatus,
    adminId: string
  ) {
    if (!mongoose.isValidObjectId(propertyId)) {
      const err: any = new Error("Invalid property id");
      err.status = 400;
      throw err;
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      const err: any = new Error("Property not found");
      err.status = 404;
      throw err;
    }

    property.status = status;
    property.reviewedBy = new mongoose.Types.ObjectId(adminId);
    property.reviewedAt = new Date();

    if (status === "approved") {
      property.publishedAt = new Date();
    }

    await property.save();

    try {
      const propertyTitle = property.title.vi || property.title.en;

      if(property.owner_id){
        await notifyPropertyStatus(
          property.owner_id.toString(),
          propertyTitle,
          status,
          propertyId
        )
      }
    } catch (error) {
      
    }

    return {
      id: property._id,
      title: property.title,
      status: property.status,
      reviewedBy: property.reviewedBy,
      reviewedAt: property.reviewedAt,
      publishedAt: property.publishedAt,
      owner: property.owner_id,
    };
  },

  async list(query: { page?: number; limit?: number; status?: string }) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const skip = (page - 1) * limit;
    const q: any = {};
    if (query.status) {
      // U011: "Chờ duyệt" cần bao gồm cả available + pending
      if (query.status === "pending") {
        q.status = { $in: ["pending", "available"] };
      } else {
        q.status = query.status;
      }
    }

    const [items, total] = await Promise.all([
      Property.find(q)
        .populate("owner_id", "fullName email")
        .populate("reviewedBy", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(q),
    ]);

    return {
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      data: items,
    };
  },

  async hide(propertyId: string, adminId: string, note?: string) {
    if (!mongoose.isValidObjectId(propertyId)) {
      const err: any = new Error("Invalid property id");
      err.status = 400;
      throw err;
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      const err: any = new Error("Property not found");
      err.status = 404;
      throw err;
    }

    if (property.deleted) {
      return { id: property._id, deleted: true, status: property.status };
    }

    property.deleted = true;
    if (property.status !== "rejected") {
      property.status = "rejected" as any;
    }
    property.reviewedBy = new mongoose.Types.ObjectId(adminId);
    property.reviewedAt = new Date();
    if (note) {
      (property as any).hiddenNote = note;
    }
    await property.save();

    return { id: property._id, deleted: property.deleted, status: property.status, hiddenNote: (property as any).hiddenNote };
  },

  async restore(propertyId: string, _adminId: string) {
    if (!mongoose.isValidObjectId(propertyId)) {
      const err: any = new Error("Invalid property id");
      err.status = 400;
      throw err;
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      const err: any = new Error("Property not found");
      err.status = 404;
      throw err;
    }

    if (property.status === "available" || property.status === "approved") {
      const err: any = new Error("Property publicly available, cannot restore");
      err.status = 400;
      throw err;
    }

    if (!property.deleted) {
      return { id: property._id, deleted: false, status: property.status };
    }

    property.deleted = false;
    if (property.status === "rejected") {
      property.status = "available" as any;
    }
    (property as any).hiddenNote = undefined;
    await property.save();

    return { id: property._id, deleted: property.deleted, status: property.status };
  },

  getPropertyById: async (id: string) => {
    if (!mongoose.isValidObjectId(id)) {
      const err: any = new Error("Invalid property id");
      err.status = 400;
      throw err;
    }

    const property = await Property.findById(id)
      .populate("city_id", "city_name")
      .populate("category_id", "category_name")
      .populate("type_id", "type_name")
      .populate("owner_id", "fullName email phone avatar")
      .populate("agent_id", "fullName email phone avatar")
      .populate("features", "feature_name")
      .populate("assignmentHistory.agent_id", "fullName email phone avatar")
      .populate("assignmentHistory.assignedBy", "fullName email")
      .lean();

    if (!property) {
      const err: any = new Error("Property not found");
      err.status = 404;
      throw err;
    }

    return {
      id: property._id,
      title: property.title,
      description: property.description,
      price: property.price,
      address: property.address,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      unit: property.unit,
      yearBuilt: property.yearBuilt,
      floors: property.floors,
      coordinates: property.coordinates,
      city: property.city_id,
      category: property.category_id,
      type: property.type_id,
      features: property.features,
      images: property.images || [],
      owner: property.owner_id,
      agent: property.agent_id,
      status: property.status,
      deleted: property.deleted,
      hiddenNote: (property as any).hiddenNote,
      assignmentHistory: property.assignmentHistory || [],
      reviewedBy: property.reviewedBy,
      reviewedAt: property.reviewedAt,
      publishedAt: property.publishedAt,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  },

};

