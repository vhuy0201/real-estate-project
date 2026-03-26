import { useEffect, useState } from "react";
import type { Property } from "../../../types/Property";
import {
  getDetailPropertiesById,
  hideProperty,
  restoreProperty,
} from "../../../services/propertyService";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faLockOpen,
  faCommentDots,
  faHouse,
  faCoins,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getLanguage, type Lang } from "../../../utils/storage";
import { useTranslation } from "react-i18next";

type HideProperty = {
  propertyId: string;
};

const HideProperties = ({ propertyId }: HideProperty) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [note, setNote] = useState<string>("");
  const navigate = useNavigate();
  const currentLanguage: Lang = getLanguage();
  const { t } = useTranslation("detailProperty");

  const handleOpen = async () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getDetailPropertiesById(propertyId!);
        console.log("getDetailPropertiesById: ", data);
        setProperty(data);
      } catch (error) {
        console.log("không thể fetch data cho role này: ", error);
      }
    };
    fetchProperty();
  }, [propertyId]);

  const handleHideUser = async () => {
    if (!propertyId) {
      toast.error(t("user_notFound"));
      return;
    }
    if (!property) return;

    try {
      const hideProperties = await hideProperty(propertyId, note);
      console.log("hide property:", hideProperties);
      setProperty((prev) => ({
        ...prev!,
        deleted: hideProperties.deleted,
        status: hideProperties.status,
        hiddenNote: hideProperties.hiddenNote,
      }));
      if (hideProperties.deleted) {
        toast.success(t("toast_success_hide"));
      } else {
        toast.success(t("toast_fail_hide"));
      }
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRestoreUser = async () => {
    if (!propertyId) {
      toast.error(t("user_notFound"));
      return;
    }
    if (!property) return;

    try {
      const restoreProperties = await restoreProperty(propertyId);
      console.log("restore property:", restoreProperties);
      setProperty((prev) => ({
        ...prev!,
        deleted: restoreProperties.deleted,
        status: restoreProperties.status,
        hiddenNote: "",
      }));
      if (restoreProperties.deleted) {
        toast.success(t("toast_fail_restore"));
      } else {
        toast.success(t("toast_success_restore"));
      }
      setOpen(false);
      navigate("/admin/properties", { state: { refresh: true } });
    } catch (error) {
      toast.error(property.deleted ? t("toast_fail_restore") : "");
      console.error(error);
    }
  };

  return (
    <>
      {property && (
        <>
          <Tooltip title={property.deleted ? t("restore") : t("hide")}>
            <button
              title="button"
              onClick={handleOpen}
              className={`w-9 h-9 cursor-pointer flex items-center justify-center rounded-md text-white shadow-sm hover:shadow-md transition-all duration-200 
      ${
        property.deleted
          ? "bg-red-500 hover:bg-red-600"
          : "bg-green-500 hover:bg-green-600"
      }`}
            >
              <FontAwesomeIcon icon={property.deleted ? faLock : faLockOpen} />
            </button>
          </Tooltip>
          {property.deleted && (
            <Tooltip title={property.hiddenNote || t("no_note")}>
              <button
                title="button"
                className="w-9 h-9 flex items-center cursor-pointer justify-center bg-amber-500 text-white rounded-md hover:bg-amber-600 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <FontAwesomeIcon icon={faCircleInfo} />
              </button>
            </Tooltip>
          )}
          <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: "bold", color: "#1e293b" }}>
              {property.deleted ? t("restoreInfor") : t("hideInfor")}
            </DialogTitle>

            <DialogContent dividers>
              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src={property.images?.[0] || "image"}
                  alt={property.title?.[currentLanguage] || "Property"}
                  className="w-full sm:w-1/2 h-[180px] object-cover rounded-lg"
                />
                <div className="flex-1 space-y-2">
                  <Typography variant="h6" color="primary">
                    {property.title?.[currentLanguage] || ""}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {property.address?.[currentLanguage] || ""}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    <FontAwesomeIcon icon={faCoins} />{" "}
                    {property.price?.toLocaleString() || "0"} VND
                  </Typography>
                  <Chip
                    label={
                      property.status === "approved"
                        ? "Approved"
                        : property.status === "pending"
                        ? "Pending"
                        : property.status === "available"
                        ? "Available"
                        : "Rejected"
                    }
                    color={
                      property.status === "approved"
                        ? "success"
                        : property.status === "pending"
                        ? "warning"
                        : property.status === "available"
                        ? "info"
                        : "default"
                    }
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    <FontAwesomeIcon icon={faHouse} /> {t("city")}:
                    {property.city_id?.city_name[currentLanguage]}
                  </Typography>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-md border">
                <Typography variant="subtitle2" color="text.secondary">
                  {t("owner")}
                </Typography>
                <div className="flex items-center gap-3 mt-2">
                  <img
                    src={property.owner_id?.avatar}
                    alt={property.owner_id?.fullName}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <div>
                    <Typography fontWeight={600}>
                      {property.owner_id?.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {property.owner_id?.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {property.owner_id?.phone}
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                {property.deleted === false && (
                  <>
                    <Typography
                      variant="subtitle1"
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <FontAwesomeIcon
                        icon={faCommentDots}
                        style={{ color: "#2563eb" }}
                      />
                      {t("reasonText")}
                    </Typography>
                    <TextField
                      multiline
                      rows={3}
                      fullWidth
                      placeholder={t("reason")}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      sx={{ mt: 1 }}
                    />
                  </>
                )}
              </div>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose} color="inherit">
                {t("cancel")}
              </Button>
              {property.deleted ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    handleRestoreUser();
                  }}
                >
                  {t("confirm")}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    handleHideUser();
                  }}
                >
                  {t("confirm")}
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default HideProperties;
