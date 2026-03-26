// src/services/taxonomy.service.ts
import City from "../models/city.model";
import PropertyType from "../models/propertyType.model";
import Feature from "../models/feature.model";
import Category from "../models/category.model";
import District from "../models/district.model";
import Ward from "../models/ward.model";

export const taxonomyService = {
  async getAll() {
    const [propertyTypes, categories, features] = await Promise.all([
      PropertyType.find({}, "type_name").sort({ type_name: 1 }),
      Category.find({}, "category_name").sort({ category_name: 1 }),
      Feature.find({}, "feature_name").sort({ feature_name: 1 }),
    ]);

    return {
      propertyTypes,
      categories,
      features,
    };
  },

  // Lấy tất cả city
  async getAllCities() {
    return City.find({ deleted: false }).sort({ "city_name.vi": 1 }).lean();
  },

  // Lấy tất cả districts theo cityId
  async getDistrictsByCity(cityId: string) {
    return District.find({ city_id: cityId, deleted: false })
      .sort({ "district_name.vi": 1 })
      .lean();
  },

  // Lấy tất cả wards theo districtId
  async getWardsByDistrict(districtId: string) {
    return Ward.find({ district_id: districtId, deleted: false })
      .sort({ "ward_name.vi": 1 })
      .lean();
  },

  async getAllLocations() {
    const cities = await City.find({ deleted: false }).lean();
    const districts = await District.find({ deleted: false }).lean();
    const wards = await Ward.find({ deleted: false }).lean();

    const data = cities.map((city) => ({
      _id: city._id,
      city_name: city.city_name,
      districts: districts
        .filter((d) => d.city_id.toString() === city._id.toString())
        .map((district) => ({
          _id: district._id,
          district_name: district.district_name,
          wards: wards
            .filter((w) => w.district_id.toString() === district._id.toString())
            .map((ward) => ({
              _id: ward._id,
              ward_name: ward.ward_name,
            })),
        })),
    }));

    return data;
  },
};
