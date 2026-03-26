import type { Review } from "../types/Review";
import { httpAdmin } from "../utils/httpAdmin";
const RESOURCE = "/reviews";

interface ReviewList {
  reviews: Review[];
  pagination: any;
}

export const getAllReview = async (page: number): Promise<ReviewList> => {
  const res = await httpAdmin.get(RESOURCE, { params: { page } });
  const data = res.data.data.data;
  const pagination = res.data.data.pagination;
  return {
    reviews: data,
    pagination: pagination,
  };
};

export const deleteReview = async (id: string): Promise<Review> => {
  const res = await httpAdmin.delete(`${RESOURCE}/${id}`);
  return res.data.data;
};

export const getReviewDetail = async (id: string): Promise<Review> => {
  const res = await httpAdmin.get(`${RESOURCE}/${id}`);
  return res.data.data;
};
