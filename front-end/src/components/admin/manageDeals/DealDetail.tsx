import { useNavigate, useParams } from "react-router-dom";
import { getDealById } from "../../../services/dealService";
import type { Deal } from "../../../types/Deal";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Carousel } from "react-responsive-carousel";
import { useTranslation } from "react-i18next";
import { getLanguage, type Lang } from "../../../utils/storage";

const DealDetail = () => {
  const [deal, setDeal] = useState<Deal | null>(null);
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { t } = useTranslation("deal");
  const currentLanguage: Lang = getLanguage();

  useEffect(() => {
    const fetchDetailDeal = async () => {
      const data = await getDealById(id!);
      console.log("deal detail: ", data);
      setDeal(data);
      setLoading(false);
    };
    fetchDetailDeal();
  }, [id]);

  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center">
          <div>loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Button sx={{ mb: 2 }} variant="outlined" onClick={() => navigate(-1)}>
        {t("Back")}
      </Button>
      {deal && (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 max-w-5xl mx-auto">
          <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 uppercase ">
              {deal.property_id.title?.[currentLanguage]}
            </h1>
          </div>
          <div className="mb-5">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                deal.status === "completed"
                  ? "bg-green-50 text-green-700 ring-1 ring-green-100"
                  : deal.status === "cancelled"
                  ? "bg-red-50 text-red-700 ring-1 ring-red-100"
                  : deal.status === "awaiting_contract"
                  ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-100"
                  : deal.status === "contract_under_review"
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                  : deal.status === "awaiting_escrow_payment"
                  ? "bg-purple-50 text-purple-700 ring-1 ring-purple-100"
                  : deal.status === "escrow_funded"
                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                  : "bg-orange-50 text-orange-700 ring-1 ring-orange-100"
              }`}
            >
              {t("Status")}:{" "}
              {deal.status === "completed"
                ? t("Completed")
                : deal.status === "cancelled"
                ? t("Cancelled")
                : deal.status === "awaiting_contract"
                ? t("Awaiting")
                : deal.status === "contract_under_review"
                ? t("UnderReview")
                : deal.status === "awaiting_escrow_payment"
                ? t("EscrowPayment")
                : deal.status === "escrow_funded"
                ? t("EscrowFunded")
                : deal.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold text-gray-600 mb-2">{t("Agent")}</h3>
              <div className="text-gray-800">{deal.agent_id?.fullName}</div>
              <div className="text-gray-500 text-sm">
                {deal.agent_id?.email}
              </div>
              <div className="text-gray-500 text-sm">
                {deal.agent_id?.phone}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold text-gray-600 mb-2">
                {t("Seller")}
              </h3>
              <div className="text-gray-800">{deal.buyer_id.fullName}</div>
              <div className="text-gray-500 text-sm">{deal.buyer_id.email}</div>
              <div className="text-gray-500 text-sm">
                {deal.buyer_id?.phone}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold text-gray-600 mb-2">{t("Buyer")}</h3>
              <div className="text-gray-800">{deal.seller_id.fullName}</div>
              <div className="text-gray-500 text-sm">
                {deal.seller_id.email}
              </div>
              <div className="text-gray-500 text-sm">
                {deal.seller_id.phone}
              </div>
            </div>
          </div>
          <div className="mb-1">
            <span className="bg-green-500 p-2 rounded-2xl">
              {t("Price")}: {deal.property_id.price.toLocaleString()} VND
            </span>
          </div>
          <div>
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
              {deal.property_id.images.map((item, index) => (
                <div key={index}>
                  <img
                    src={item}
                    alt={`${t("Property_alt")} ${index + 1}`}
                    className="w-full h-[220px] sm:h-[350px] md:h-[450px] object-cover rounded-lg mt-4"
                  />
                </div>
              ))}
            </Carousel>

            <div className="flex justify-end mt-4">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                onClick={() => navigate(`property/${deal.property_id._id}`)}
              >
                {t("Property_detail_btn")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DealDetail;
