import Property from "../../models/property.model";
import Category from "../../models/category.model";
import { createMultilangText } from "../../utils/translateHelper";

export const getAllCategories = async () => {
  return await Category.find({ deleted: false }).sort({ createdAt: -1 });
};

export const createCategory = async (data: any) => {
  if (!data.category_name) throw new Error("Thiếu tên danh mục");
  const categoryNameObj = await createMultilangText(data.category_name);

  const existingCategory = await Category.findOne({
    $or: [
      { "category_name.vi": categoryNameObj.vi },
      { "category_name.en": categoryNameObj.en },
    ],
  });

  if (existingCategory) {
    if (existingCategory.deleted) {
      existingCategory.category_name = categoryNameObj;
      existingCategory.deleted = false;
      await existingCategory.save();
      return existingCategory;
    } else throw new Error("Danh mục đã tồn tại");
  }

  return await Category.create({
    category_name: categoryNameObj,
    deleted: false,
  });
};

export const updateCategory = async (id: string, data: any) => {
  const { category_name } = data;
  const category = await Category.findById(id);
  if (!category) throw new Error("Không tìm thấy danh mục.");

  const multiLangName = await createMultilangText(category_name);
  return await Category.findByIdAndUpdate(id, { category_name: multiLangName }, { new: true });
};

export const deleteCategory = async (id: string) => {
  const propertyInUse = await Property.exists({ category_id: id });
  if (propertyInUse) {
    throw new Error("Không thể xóa vì có property thuộc danh mục này.");
  }

  const deletedCategory = await Category.findByIdAndUpdate(id, { deleted: true }, { new: true });
  if (!deletedCategory) throw new Error("Không tìm thấy danh mục để xóa.");
  return deletedCategory;
};
