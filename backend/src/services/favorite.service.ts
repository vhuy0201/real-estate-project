// src/services/favorite.service.ts
import mongoose from "mongoose";
import Favorite from "../models/favorite.model";
import Property from "../models/property.model";

interface FavoriteFilters {
  sort?: string;
}

export const favoriteService = {
  async addFavorite(userId: string, propertyId: string) {
    if (!mongoose.isValidObjectId(propertyId)) {
      const err: any = new Error("Property ID không hợp lệ");
      err.status = 400;
      throw err;
    }

    const property = await Property.findOne({
      _id: propertyId,
      deleted: false,
    });

    if (!property) {
      const err: any = new Error(
        "Bất động sản không tồn tại hoặc đã bị xóa"
      );
      err.status = 404;
      throw err;
    }

    const existing = await Favorite.findOne({
      user_id: userId,
      property_id: propertyId,
    });

    if (existing) {
      const err: any = new Error(
        "Bất động sản đã nằm trong danh sách yêu thích"
      );
      err.status = 400;
      throw err;
    }

    return Favorite.create({
      user_id: userId,
      property_id: propertyId,
    });
  },

  async removeFavorite(userId: string, propertyId: string) {
    if (!mongoose.isValidObjectId(propertyId)) {
      const err: any = new Error("Property ID không hợp lệ");
      err.status = 400;
      throw err;
    }

    const favorite = await Favorite.findOneAndDelete({
      user_id: userId,
      property_id: propertyId,
    });

    if (!favorite) {
      const err: any = new Error("Bất động sản không tồn tại trong yêu thích");
      err.status = 404;
      throw err;
    }

    return favorite;
  },

  async getMyFavorites(userId: string) {
    const favorites = await Favorite.find({ user_id: userId })
      .populate({
        path: "property_id",
        model: "Property",
        populate: [
          { path: "city_id", model: "City" },
          { path: "district_id", model: "District" },
          { path: "ward_id", model: "Ward" },
          { path: "type_id", model: "PropertyType" },
          { path: "category_id", model: "Category" },
          { path: "owner_id", model: "User" },
          { path: "agent_id", model: "User" },
          { path: "features", model: "Feature" },
          { path: "owner_id", model: "User", select: "-password" },
          { path: "agent_id", model: "User", select: "-password" },
        ],
      })
      .sort({ createdAt: -1 });

    // format dữ liệu như Postman bạn gửi
    const result = favorites.map((fav) => {
      const property: any = fav.property_id;

      return {
        favorite_id: fav._id,
        property_id: property?._id,

        // --- PROPERTY FULL FIELDS ---
        title: property.title,
        description: property.description,
        price: property.price,
        images: property.images || [],

        address: property.address,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        unit: property.unit,
        yearBuilt: property.yearBuilt,
        floors: property.floors,
        coordinates: property.coordinates,

        city: property.city_id,
        district: property.district_id,
        ward: property.ward_id,

        type: property.type_id,
        category: property.category_id,

        features: property.features,

        status: property.status,
        reviewedBy: property.reviewedBy,
        reviewedAt: property.reviewedAt,
        publishedAt: property.publishedAt,

        owner: property.owner_id,
        agent: property.agent_id,

        deleted: property.deleted,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
      };
    });

    return {
      total: result.length,
      data: result,
    };
  },

  async isFavorite(userId: string, propertyId: string) {
    if (!mongoose.isValidObjectId(propertyId)) return null;

    return Favorite.findOne({
      user_id: userId,
      property_id: propertyId,
    });
  },

  async getFavoriteCount(propertyId: string) {
    if (!mongoose.isValidObjectId(propertyId)) return 0;

    return Favorite.countDocuments({ property_id: propertyId });
  },
};
