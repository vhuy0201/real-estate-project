import { Property } from "./property";

export type FavoriteProperty = Property & {
  /** ID của bản ghi favorite */
  favorite_id?: string;
  /** ID property được lưu trong favorite */
  property_id?: string;
};

