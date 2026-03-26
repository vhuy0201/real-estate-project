import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getAllProperties,
  getAllPropertiesByPending,
  updateStatus,
} from "../../../services/propertyService";
import type { Property } from "../../../types/Property";
import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Modal,
  Pagination,
  Tooltip,
  Typography,
} from "@mui/material";
import { getLanguage, type Lang } from "../../../utils/storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import HideProperties from "./HideProperties";
import { toast, ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Carousel } from "react-responsive-carousel";

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

const ListProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams] = useSearchParams();
  const { t } = useTranslation("listProperties");
  const [openModalApprove, setOpenModalApprove] = useState<boolean>(false);
  const [openModalReject, setOpenModalReject] = useState<boolean>(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const itemPerPages: number = 10;
  const currentLanguage: Lang = getLanguage();
  const status = searchParams.get("status");
  const isManageMode = status === "pending";

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = isManageMode
          ? await getAllPropertiesByPending()
          : await getAllProperties();

        console.log("Data return is: ", data);

        if (status && !isManageMode) {
          setProperties(
            data.filter((properties) => properties.status === status)
          );
        } else {
          setProperties(data || []);
        }
      } catch (error) {
        console.log("Cannot fetch properties: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [status, isManageMode]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateStatus(id, newStatus);
      toast.success(t("toast_success"));
      setProperties(properties.filter((p) => p._id !== id));
    } catch (error) {
      toast.error(t("toast_fail"));
      console.error(error);
    } finally {
      setOpenModalApprove(false);
      setOpenModalReject(false);
    }
  };

  const filteredProperties = properties.filter((item) => {
    const matchSearch =
      item.title?.[currentLanguage]
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.address?.[currentLanguage]
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "" || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredProperties.length / itemPerPages);
  const startIndex = (currentPage - 1) * itemPerPages;
  const currentItems = filteredProperties.slice(
    startIndex,
    startIndex + itemPerPages
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleOpenModalApprove = (id: string) => {
    if (!id) return;
    setOpenModalApprove(true);
    setPropertyId(id);
  };

  const handleOpenModalReject = (id: string) => {
    if (!id) return;
    setOpenModalReject(true);
    setPropertyId(id);
  };

  const handleClose = () => {
    setOpenModalApprove(false);
    setOpenModalReject(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <span className="text-gray-500 animate-pulse text-lg">
          {t("loading")}
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder={t("search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded-md w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400 ml-3"
        />

        {!isManageMode && !status && (
          <select
            title="select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mr-3"
          >
            <option value="">{t("All status")}</option>
            <option value="approved">{t("Approved")}</option>
            <option value="pending">{t("Pending")}</option>
            <option value="sold">{t("sold")}</option>
            <option value="rejected">{t("Rejected")}</option>
          </select>
        )}
      </div>

      <div className="mt-4">
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full table-auto divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("avatar")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("name")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("address")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("status")}
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("action")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {currentItems.map((item) => (
                <>
                  <tr
                    key={item._id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <img
                          src={item.images[0]}
                          alt={t("avatar")}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100"
                        />
                      </div>
                    </td>

                    <td className="px-4 py-3 max-w-[260px] text-sm font-medium text-gray-900">
                      <span className="line-clamp-2">
                        {item.title?.[currentLanguage]}
                      </span>
                    </td>

                    <td className="px-4 py-3 max-w-[280px] text-sm text-gray-700">
                      <span className="line-clamp-2">
                        {item.address?.[currentLanguage]}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium
                ${
                  item.status === "approved"
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                    : item.status === "pending"
                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                    : item.status === "sold"
                    ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                    : item.status === "rejected"
                    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                    : item.status === "rented"
                    ? "bg-gray-100 text-purple-700 ring-1 ring-purple-200"
                    : ""
                }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {currentLanguage === "en"
                          ? item.status
                          : item.status === "approved"
                          ? "Đã duyệt"
                          : item.status === "pending"
                          ? "Chờ duyệt"
                          : item.status === "available"
                          ? "Có sẵn"
                          : "Bị từ chối"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-left gap-2">
                        <Tooltip title={t("view")}>
                          <button
                            onClick={() => navigate(`${item?._id}`)}
                            className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </Tooltip>

                        {isManageMode ? (
                          <>
                            <button
                              onClick={() => handleOpenModalApprove(item._id)}
                              className="cursor-pointer px-3 h-9 flex items-center justify-center rounded-md text-white bg-green-500 hover:bg-green-700 shadow-sm hover:shadow-md transition-all duration-200 text-xs font-medium"
                            >
                              {t("approve")}
                            </button>
                            <button
                              onClick={() => handleOpenModalReject(item._id)}
                              className="cursor-pointer px-3 h-9 flex items-center justify-center rounded-md text-white bg-red-500 hover:bg-red-700 shadow-sm hover:shadow-md transition-all duration-200 text-xs font-medium"
                            >
                              {t("reject")}
                            </button>
                          </>
                        ) : (
                          <HideProperties propertyId={item?._id} />
                        )}
                      </div>
                    </td>
                  </tr>
                  <Modal open={openModalApprove} onClose={handleClose}>
                    <Box sx={style}>
                      <Carousel
                        showArrows={true}
                        autoPlay
                        infiniteLoop
                        showThumbs={false}
                        showStatus={false}
                        interval={3500}
                        stopOnHover={true}
                        swipeable={true}
                      >
                        {item?.images?.map((item, index) => (
                          <div key={index}>
                            <img
                              src={item}
                              alt={`image ${index + 1}`}
                              className="w-full h-[200px] sm:h-[250px] md:h-[300px] object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </div>
                        ))}
                      </Carousel>
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{ fontWeight: "bold", mb: 1, mt: 2 }}
                      >
                        {item.title?.[currentLanguage]}
                      </Typography>
                      <Typography variant="h6" component="h2">
                        {t("address")}: {item.address?.[currentLanguage]}
                      </Typography>
                      <Typography variant="h6" component="h2">
                        {t("price")}: {item.price.toLocaleString()} VND
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
                          alt={item.owner_id?.fullName}
                          src={item.owner_id?.avatar}
                          sx={{ width: 56, height: 56 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: "bold" }}>
                            {item.owner_id?.fullName}
                          </Typography>
                          <Typography sx={{ mt: 2 }}>
                            {item.owner_id?.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ px: 3, mt: 3.5, textAlign: "right" }}>
                        <Button
                          variant="outlined"
                          onClick={handleClose}
                          sx={{ mr: 2 }}
                        >
                          {t("cancel_btn")}
                        </Button>
                        <Button
                          variant="outlined"
                          color="success"
                          onClick={() =>
                            handleUpdateStatus(propertyId!, "approved")
                          }
                        >
                          {t("approve")}
                        </Button>
                      </Box>
                    </Box>
                  </Modal>

                  <Modal open={openModalReject} onClose={handleClose}>
                    <Box sx={style}>
                      <Carousel
                        showArrows={true}
                        autoPlay
                        infiniteLoop
                        showThumbs={false}
                        showStatus={false}
                        interval={3500}
                        stopOnHover={true}
                        swipeable={true}
                      >
                        {item?.images?.map((item, index) => (
                          <div key={index}>
                            <img
                              src={item}
                              alt={`image ${index + 1}`}
                              className="w-full h-[200px] sm:h-[250px] md:h-[300px] object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </div>
                        ))}
                      </Carousel>
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{ fontWeight: "bold", mb: 1, mt: 2 }}
                      >
                        {item.title?.[currentLanguage]}
                      </Typography>
                      <Typography variant="h6" component="h2">
                        {t("address")}: {item.address?.[currentLanguage]}
                      </Typography>
                      <Typography variant="h6" component="h2">
                        {t("price")}: {item.price.toLocaleString()} VND
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
                          alt={item.owner_id?.fullName}
                          src={item.owner_id?.avatar}
                          sx={{ width: 56, height: 56 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: "bold" }}>
                            {item.owner_id?.fullName}
                          </Typography>
                          <Typography sx={{ mt: 2 }}>
                            {item.owner_id?.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ px: 3, mt: 3.5, textAlign: "right" }}>
                        <Button
                          variant="outlined"
                          onClick={handleClose}
                          sx={{ mr: 2 }}
                        >
                          {t("cancel_btn")}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() =>
                            handleUpdateStatus(propertyId!, "rejected")
                          }
                        >
                          {t("reject")}
                        </Button>
                      </Box>
                    </Box>
                  </Modal>
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6">
          <Pagination
            count={totalPages}
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

export default ListProperties;
