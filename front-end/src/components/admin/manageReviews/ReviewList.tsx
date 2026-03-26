import { getLanguage, type Lang } from "../../../utils/storage";
import {
  deleteReview,
  getAllReview,
  getReviewDetail,
} from "../../../services/reviewService";
import type { Review, ReviewPagination } from "../../../types/Review";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Modal,
  Pagination,
  Rating,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer } from "react-toastify";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxWidth: "90%",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

const ReviewList = () => {
  const [review, setReview] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<ReviewPagination | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [openModalView, setOpenModalView] = useState<boolean>(false);
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const [reviewDetail, setReviewDetail] = useState<Review | null>(null);
  const [reviewIdDelete, setReviewIdDelete] = useState<string | null>(null);
  const { t } = useTranslation("review");
  const currentLanguage: Lang = getLanguage();
  useEffect(() => {
    const fetchReview = async () => {
      const res = await getAllReview(currentPage);
      console.log("review: ", res);
      setReview(res.reviews);
      setPagination(res.pagination);
    };
    fetchReview();
  }, []);

  const handlePageChange = (page: number) => {
    if (!pagination) return;

    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    try {
      await deleteReview(id);
      toast.success(t("toast_delete_success"));
      setOpenModalDelete(false);
      const res = await getAllReview(currentPage);
      setReview(res.reviews);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(t("toast_delete_fail"));
      console.log("err: ", err);
    }
  };

  const handleViewDetail = async (id: string) => {
    if (!id) return;
    const res = await getReviewDetail(id);
    console.log("review detail: ", res);
    setReviewDetail(res);
    setOpenModalView(true);
  };

  const handleOpenModalDelete = (id: string) => {
    setReviewIdDelete(id);
    setOpenModalDelete(true);
  };

  const handleClose = () => {
    setOpenModalView(false);
    setOpenModalDelete(false);
    setReviewIdDelete(null);
  };

  return (
    <>
      <table className="min-w-full table-fixed divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-1/4 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-b">
              {t("name")}
            </th>
            <th className="w-1/4 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-b">
              {t("comment")}
            </th>
            <th className="w-1/4 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-b">
              {t("action")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {review &&
            review.map((data) => (
              <tr key={data._id} className="transition-colors hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {data.user_id.fullName}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {data.comment?.[currentLanguage]}
                </td>
                <td className="px-4 py-3">
                  <Tooltip title={t("view_btn_toolTip")}>
                    <Button
                      sx={{ mr: 1 }}
                      variant="outlined"
                      onClick={() => handleViewDetail(data._id)}
                    >
                      {t("view_btn")}
                    </Button>
                  </Tooltip>
                  <Tooltip title={t("delete_btn_toolTip")}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleOpenModalDelete(data._id)}
                    >
                      {t("delete_btn")}
                    </Button>
                  </Tooltip>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {reviewDetail && reviewDetail.target_type === "property" && (
        <Modal open={openModalView} onClose={handleClose}>
          <Box sx={style}>
            {reviewDetail.target.images.length > 0 && (
              <img
                src={reviewDetail.target.images[0]}
                alt={reviewDetail.target?.title?.vi}
                style={{
                  width: "100%",
                  maxHeight: 240,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            )}
            <Typography
              variant="h6"
              component="h2"
              sx={{ fontWeight: "bold", mb: 1, mt: 2 }}
            >
              {reviewDetail.target?.title?.vi}
            </Typography>
            <Typography variant="h6" component="h2">
              {reviewDetail.target.address.vi}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 3,
                pb: 3,
              }}
            >
              <Avatar
                alt={reviewDetail.user_id?.fullName}
                src={reviewDetail.user_id?.avatar}
                sx={{ width: 56, height: 56 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: "bold" }}>
                  {reviewDetail.user_id?.fullName}
                </Typography>
                <Rating value={reviewDetail.rating} readOnly sx={{ mt: 2 }} />
                <Typography sx={{ mt: 2 }}>
                  {reviewDetail.comment?.[currentLanguage]}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ px: 3, mt: 3.5, textAlign: "right" }}>
              <Button variant="outlined" onClick={handleClose}>
                {t("cancel_btn")}
              </Button>
            </Box>
          </Box>
        </Modal>
      )}

      {reviewDetail && reviewDetail.target_type === "agent" && (
        <Modal open={openModalView} onClose={handleClose}>
          <Box sx={style}>
            <Box sx={{ display: "flex", gap: 3 }}>
              <img
                src={reviewDetail.target.avatar}
                alt={reviewDetail.target.fullName}
                style={{
                  width: 200,
                  height: 200,
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
              <Box>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ fontWeight: "bold", mb: 1, mt: 2 }}
                >
                  {reviewDetail.target.fullName}
                </Typography>
                <Typography variant="h6" component="h2" sx={{ mb: 1, mt: 2 }}>
                  {reviewDetail.target.email}
                </Typography>
                <Typography variant="h6" component="h2" sx={{ mb: 1, mt: 2 }}>
                  {reviewDetail.target.phone}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 3,
                pb: 3,
              }}
            >
              <Avatar
                alt={reviewDetail.user_id?.fullName}
                src={reviewDetail.user_id?.avatar}
                sx={{ width: 56, height: 56 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {reviewDetail.user_id?.fullName}
                </Typography>
                <Rating value={reviewDetail.rating} readOnly sx={{ mt: 2 }} />
                <Typography sx={{ mt: 2 }}>
                  {reviewDetail.comment?.[currentLanguage]}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ px: 3, textAlign: "right", mt: 3.5 }}>
              <Button variant="outlined" onClick={handleClose}>
                {t("cancel_btn")}
              </Button>
            </Box>
          </Box>
        </Modal>
      )}

      <Modal open={openModalDelete} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            {t("delete_comment")}
          </Typography>
          <Typography sx={{ mt: 2 }}>{t("delete_question")}</Typography>
          <Box sx={{ px: 3, textAlign: "right", mt: 3 }}>
            <Button variant="outlined" onClick={handleClose} sx={{ mr: 2 }}>
              {t("cancel_btn")}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleDelete(reviewIdDelete!)}
            >
              {t("delete_btn")}
            </Button>
          </Box>
        </Box>
      </Modal>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mt-6">
          <Pagination
            count={pagination.totalPages}
            page={currentPage}
            onChange={(_, value) => handlePageChange(value)}
            variant="outlined"
            shape="rounded"
            color="primary"
          />
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default ReviewList;
