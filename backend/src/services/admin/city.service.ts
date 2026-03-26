import Property from "../../models/property.model";
import City from "../../models/city.model";
import { createMultilangText } from "../../utils/translateHelper";

export const getAllCities = async () => {
  return await City.find({ deleted: false }).sort({ createdAt: -1 });
};

export const createCity = async (data: any) => {
  if (!data.city_name) throw new Error("Thiếu tên thành phố");
  const cityNameObj = await createMultilangText(data.city_name);
  const existingCity = await City.findOne({
    $or: [
      { "city_name.vi": cityNameObj.vi },
      { "city_name.en": cityNameObj.en },
    ],
  });
  if (existingCity) {
    if (existingCity.deleted) {
      existingCity.city_name = cityNameObj;
      existingCity.deleted = false;
      await existingCity.save();
      return existingCity;
    } else {
      throw new Error("Thành phố đã tồn tại");
    }
  }
  return await City.create({
    city_name: cityNameObj,
    deleted: false,
  });
};

export const updateCity = async (id: string, data: any) => {
  const { city_name } = data;
  const city = await City.findById(id);
  if (!city) throw new Error("Không tìm thấy thành phố.");

  const multiLangName = await createMultilangText(city_name);
  return await City.findByIdAndUpdate(id, { city_name: multiLangName }, { new: true });
};

export const deleteCity = async (id: string) => {
  const propertyInUse = await Property.exists({ city_id: id });
  if (propertyInUse) {
    throw new Error("Không thể xóa vì có bất động sản thuộc thành phố này.");
  }

  const deletedCity = await City.findByIdAndUpdate(id, { deleted: true }, { new: true });
  if (!deletedCity) throw new Error("Không tìm thấy thành phố để xóa.");
  return deletedCity;
};
