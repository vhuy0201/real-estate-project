import { getAllDeal } from "../../../services/dealService";
import type { Deal } from "../../../types/Deal";
import type { pagination } from "../../../types/Contract";
import { Button, Pagination, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useTranslation } from "react-i18next";
import { getLanguage, type Lang } from "../../../utils/storage";

const DealsList = () => {
  const [deal, setDeal] = useState<Deal[]>([]);
  const [pagination, setPagination] = useState<pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const { t } = useTranslation("deal");
  const currentLanguage: Lang = getLanguage();

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const res = await getAllDeal(currentPage, status || undefined);
        console.log("All deals return is: ", res);
        setDeal(res.deals);
        setPagination(res.pagination);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDeal();
  }, [currentPage, status]);

  useEffect(() => {
    setCurrentPage(1);
  }, [status]);

  const handlePageChange = (page: number) => {
    console.log(page);
    if (!pagination) return;

    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <div className="mt-4">
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-1/3 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("Property")}
                </th>
                <th className="w-1/3 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("Status")}
                </th>
                <th className="w-1/3 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("Action")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {deal &&
                deal.map((data) => (
                  <tr
                    key={data._id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      <span className="line-clamp-2">
                        {data?.property_id?.title?.[currentLanguage]}
                      </span>
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
                        : data.status === "awaiting_contract"
                        ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-100"
                        : data.status === "contract_under_review"
                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                        : data.status === "awaiting_escrow_payment"
                        ? "bg-purple-50 text-purple-700 ring-1 ring-purple-100"
                        : data.status === "escrow_funded"
                        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                        : "bg-orange-50 text-orange-700 ring-1 ring-orange-100"
                    }

                  `}
                      >
                        {data.status === "completed"
                          ? t("Completed")
                          : data.status === "cancelled"
                          ? t("Cancelled")
                          : data.status === "awaiting_contract"
                          ? t("Awaiting")
                          : data.status === "contract_under_review"
                          ? t("UnderReview")
                          : data.status === "awaiting_escrow_payment"
                          ? t("EscrowPayment")
                          : data.status === "escrow_funded"
                          ? t("EscrowFunded")
                          : data.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-left gap-2">
                        <Tooltip title={t("view_tooltip")}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`${data._id}`)}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

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
    </>
  );
};

export default DealsList;
