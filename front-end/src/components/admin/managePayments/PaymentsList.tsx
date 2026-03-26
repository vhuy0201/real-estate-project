import {
  getAllPayment,
  releasePayment,
} from "../../../services/paymentService";
import type { Payment } from "../../../types/Payment";
import {
  Box,
  Button,
  Modal,
  Pagination,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { pagination } from "../../../types/Contract";
import { useNavigate, useSearchParams } from "react-router-dom";
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

const PaymentsList = () => {
  const [payment, setPayment] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<pagination | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [openModalRelease, setOpenModalRelease] = useState<boolean>(false);
  const [paymentRelease, setPaymentRelease] = useState<string | null>(null);
  const status = searchParams.get("status");
  const { t } = useTranslation("payment");

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllPayment(currentPage, status || undefined);
      console.log("PaymentList return is: ", data);
      setPayment(data.payments);
      setPagination(data.pagination);
    };
    fetchData();
  }, [status, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [status]);

  const handlePageChange = (page: number) => {
    if (!pagination) return;

    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const handleOpenModalRelease = (id: string) => {
    setPaymentRelease(id);
    setOpenModalRelease(true);
  };

  const handleClose = () => {
    setOpenModalRelease(false);
    setPaymentRelease(null);
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    try {
      await releasePayment(id);
      const data = await getAllPayment(currentPage, status || undefined);
      console.log("PaymentList return is: ", data);
      setPayment(data.payments);
      setPagination(data.pagination);
      toast.success(t("toast_success_release"));
    } catch (error) {
      console.log("err: ", error);
      toast.error(t("toast_error_release"));
    } finally {
      handleClose();
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-1/4 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-b">
                {t("initiated")}
              </th>
              <th className="w-1/4 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-b">
                {t("method")}
              </th>
              <th className="w-1/4 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-b">
                {t("status")}
              </th>
              <th className="w-1/4 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-b">
                {t("action")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {payment &&
              payment.map((data) => (
                <tr
                  key={data._id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {data.initiated_by?.fullName}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {data.method === "payos_qr"
                      ? t("payos_qr")
                      : data.method === "internal_release"
                      ? t("internal_release")
                      : ""}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`
                    inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
                    ${
                      data.status === "completed"
                        ? "bg-green-50 text-green-700 ring-1 ring-green-100"
                        : data.status === "cancelled"
                        ? "bg-red-50 text-red-700 ring-1 ring-red-100"
                        : data.status === "failed"
                        ? "bg-red-50 text-red-700 ring-1 ring-red-100"
                        : data.status === "processing"
                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                        : data.status === "pending"
                        ? "bg-orange-50 text-orange-700 ring-1 ring-orange-100"
                        : "bg-gray-50 text-gray-700 ring-1 ring-gray-100"
                    }
                  `}
                    >
                      {data.status === "completed"
                        ? t("completed")
                        : data.status === "cancelled"
                        ? t("cancelled")
                        : data.status === "failed"
                        ? t("cancelled")
                        : data.status === "processing"
                        ? t("processing")
                        : data.status === "pending"
                        ? t("pending")
                        : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Stack direction="row" spacing={1}>
                      <Tooltip title={t("view_tooltip")}>
                        <Button
                          variant="outlined"
                          onClick={() => navigate(`${data._id}`)}
                        >
                          {t("view_btn")}
                        </Button>
                      </Tooltip>
                      {data.status === "completed" &&
                        data.deal_id.status !== "completed" && (
                          <Tooltip title={t("release_tooltip")}>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() =>
                                handleOpenModalRelease(data.deal_id._id)
                              }
                            >
                              {t("release_btn")}
                            </Button>
                          </Tooltip>
                        )}
                    </Stack>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal open={openModalRelease} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            {t("release")}
          </Typography>
          <Typography sx={{ mt: 2 }}>{t("release_question")}</Typography>
          <Box sx={{ px: 3, textAlign: "right", mt: 3 }}>
            <Button variant="outlined" onClick={handleClose} sx={{ mr: 2 }}>
              {t("cancel_btn")}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleDelete(paymentRelease!)}
            >
              {t("accept_btn")}
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
        autoClose={2000}
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

export default PaymentsList;
