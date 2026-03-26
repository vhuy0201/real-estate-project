import Property from "../../models/property.model";
import Feature from "../../models/feature.model";
import { createMultilangText } from "../../utils/translateHelper";

export const getAllFeatures = async () => {
  return await Feature.find({ deleted: false }).sort({ createdAt: -1 });
};

export const createFeature = async (data: any) => {
  if (!data.feature_name) throw new Error("Thiếu tên tiện ích");
  const featureNameObj = await createMultilangText(data.feature_name);

  const existingFeature = await Feature.findOne({
    $or: [
      { "feature_name.vi": featureNameObj.vi },
      { "feature_name.en": featureNameObj.en },
    ],
  });

  if (existingFeature) {
    if (existingFeature.deleted) {
      existingFeature.feature_name = featureNameObj;
      existingFeature.deleted = false;
      await existingFeature.save();
      return existingFeature;
    } else throw new Error("Tiện ích đã tồn tại");
  }

  return await Feature.create({
    feature_name: featureNameObj,
    deleted: false,
  });
};

export const updateFeature = async (id: string, data: any) => {
  const { feature_name } = data;
  const feature = await Feature.findById(id);
  if (!feature) throw new Error("Không tìm thấy tiện ích.");

  const multiLangName = await createMultilangText(feature_name);
  return await Feature.findByIdAndUpdate(id, { feature_name: multiLangName }, { new: true });
};

export const deleteFeature = async (id: string) => {
  const propertyInUse = await Property.exists({ features: id });
  if (propertyInUse) {
    throw new Error("Không thể xóa vì có property đang sử dụng tiện ích này.");
  }

  const deletedFeature = await Feature.findByIdAndUpdate(id, { deleted: true }, { new: true });
  if (!deletedFeature) throw new Error("Không tìm thấy tiện ích để xóa.");
  return deletedFeature;
};
