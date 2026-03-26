import {
  approveContract,
  getAllContract,
  rejectContract,
} from "../../../services/contractService";
import type { Contract, pagination } from "../../../types/Contract";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  TextField,
  Tooltip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
const ContractsList = () => {
  const [contract, setContract] = useState<Contract[]>([]);
  const [pagination, setPagination] = useState<pagination | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [open, setOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null
  );
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const { t } = useTranslation("contract");

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await getAllContract(currentPage, status || undefined);
        console.log("fetchContract return is: ", res);
        console.log("Contracts return is: ", res.contracts);
        console.log("Pagination return is: ", res.pagination);
        setContract(res.contracts);
        setPagination(res.pagination);
      } catch (error) {
        console.log("error: ", error);
      }
    };
    fetchContract();
  }, [currentPage, status]);

  useEffect(() => {
    setCurrentPage(1);
  }, [status]);

  const handlePageChange = (page: number) => {
    if (pagination) {
      if (pagination.page >= 1 && page <= pagination.totalPages) {
        setCurrentPage(page);
      }
    }
  };

  const handleApproveContract = async (id: string) => {
    if (!id) {
      toast.error(t("toast_id"));
      return;
    }
    try {
      await approveContract(id);
      const res = await getAllContract(currentPage);
      setContract(res.contracts);
      setPagination(res.pagination);
      toast.success(t("toast_approve_success"));
    } catch (error) {
      console.log("error: ", error);
      toast.error(t("toast_approve_fail"));
    }
  };

  const handleRejectContract = async (id: string) => {
    if (!id) {
      toast.error(t("toast_id"));
      return;
    }
    try {
      await rejectContract(id, rejectReason);
      const res = await getAllContract(currentPage);
      setContract(res.contracts);
      setPagination(res.pagination);
      setOpen(false);
      toast.success(t("toast_reject_success"));
    } catch (error) {
      console.log("error: ", error);
      toast.error(t("toast_reject_fail"));
    }
  };

  const handleOpen = (id: string) => {
    setSelectedContractId(id);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setRejectReason("");
    setSelectedContractId(null);
  };

  return (
    <>
      <div className="mt-4">
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full table-auto divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("Uploader")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("Property")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("Status")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("Action")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {contract &&
                contract.map((data) => (
                  <tr
                    key={data._id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {data.uploaded_by.fullName}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span className="break-all">
                        {data.uploaded_by.email}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          data.status === "approved"
                            ? "bg-emerald-50 text-green-700 ring-1 ring-emerald-100"
                            : data.status === "rejected"
                            ? "bg-rose-50 text-red-700 ring-1 ring-rose-100"
                            : "bg-amber-50 text-orange-700 ring-1 ring-amber-100"
                        }`}
                      >
                        {data.status === "approved"
                          ? t("Approved_status")
                          : data.status === "rejected"
                          ? t("Rejected_status")
                          : t("Superseded_status")}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-left gap-2">
                        <Tooltip title={t("View_btn")}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              window.open(`${data.file_url}`, "_blank")
                            }
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </Button>
                        </Tooltip>

                        {data.status === "superseded" && (
                          <>
                            <Tooltip title={t("Approve_btn")}>
                              <Button
                                variant="outlined"
                                color="success"
                                size="small"
                                onClick={() => handleApproveContract(data._id)}
                              >
                                {t("Approve_btn")}
                              </Button>
                            </Tooltip>
                            <Tooltip title={t("Reject_btn")}>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handleOpen(data._id)}
                              >
                                {t("Reject_btn")}
                              </Button>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination?.totalPages > 1 && (
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{t("Reason_reject_title")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("Enter_reason")}
            type="text"
            fullWidth
            multiline
            minRows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            {t("Cancel_btn")}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() =>
              selectedContractId && handleRejectContract(selectedContractId)
            }
          >
            {t("Accept_btn")}
          </Button>
        </DialogActions>
      </Dialog>

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

export default ContractsList;
