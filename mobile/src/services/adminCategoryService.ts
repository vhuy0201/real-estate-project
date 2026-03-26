import { api } from "./api";

/**
 * Resource paths for admin taxonomy CRUD.
 * "categories" | "types" | "features" | "cities"
 */
export type TaxonomyResource = "categories" | "types" | "features" | "cities";

/** Lấy danh sách items — GET /admin/{resource} */
export async function fetchTaxonomy(resource: TaxonomyResource) {
  const response = await api.get(`/admin/${resource}`);
  // API trả về { success, data: [...] } hoặc trực tiếp [...]
  return response.data?.data ?? response.data;
}

/** Thêm mới — POST /admin/{resource} */
export async function createTaxonomy(
  resource: TaxonomyResource,
  body: Record<string, any>
) {
  const response = await api.post(`/admin/${resource}`, body);
  return response.data?.data ?? response.data;
}

/** Sửa — PATCH /admin/{resource}/:id */
export async function updateTaxonomy(
  resource: TaxonomyResource,
  id: string,
  body: Record<string, any>
) {
  const response = await api.patch(`/admin/${resource}/${id}`, body);
  return response.data?.data ?? response.data;
}

/** Xóa — DELETE /admin/{resource}/:id */
export async function deleteTaxonomy(
  resource: TaxonomyResource,
  id: string
) {
  const response = await api.delete(`/admin/${resource}/${id}`);
  return response.data;
}
