import { useNavigate, useParams } from "react-router-dom";
import type { Property } from "../../../types/Property";
import { useEffect, useState } from "react";
import { getDetailPropertiesById } from "../../../services/propertyService";
import { Carousel } from "react-responsive-carousel";
import { getLanguage, type Lang } from "../../../utils/storage";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import EventNoteTwoToneIcon from "@mui/icons-material/EventNoteTwoTone";
import DescriptionTwoToneIcon from "@mui/icons-material/DescriptionTwoTone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBed, faShower, faTreeCity } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const ViewDetailProperties = () => {
  const [property, setProperty] = useState<Property>();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentLanguage: Lang = getLanguage();
  const { t } = useTranslation("detailProperty");

  useEffect(() => {
    const fetchProperty = async () => {
      const data = await getDetailPropertiesById(id!);
      console.log("getDetailPropertiesById: ", data);

      setProperty(data);
    };
    fetchProperty();
  }, [id]);

  if (!property) {
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
      <div className="relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full text-indigo-600 hover:bg-white hover:shadow-lg transition-all duration-300"
        >
          <span className="text-lg">←</span>
          <span className="font-medium hidden sm:inline">{t("button")}</span>
        </button>
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
          {property?.images?.map((item, index) => (
            <div key={index}>
              <img
                src={item}
                alt={`image ${index + 1}`}
                className="w-full h-[250px] sm:h-[400px] md:h-[500px] object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </Carousel>

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 via-black/20 to-transparent text-white px-4 sm:px-8 py-4 sm:py-6">
          <h2 className="text-xl sm:text-3xl font-bold drop-shadow-lg">
            {property.title?.[currentLanguage]}
          </h2>
          <p className="text-xs sm:text-sm text-gray-200 italic mt-1">
            {property.address?.[currentLanguage]}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-200 pb-6 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">
              {t("detailTitle")}
            </h3>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              {t("updateDate")}:
              <span className="font-medium">
                {new Date(property.updatedAt).toLocaleDateString("vi-VN")}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 lg:mt-0">
            <span className="text-2xl sm:text-3xl font-bold text-green-600">
              {property?.price?.toLocaleString()} VND
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                property.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : property.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : property.status === "sold"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {property.status === "approved"
                ? "approved"
                : property.status === "pending"
                ? "pending"
                : property.status === "sold"
                ? "sold"
                : "rejected"}
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border">
            <span className="text-green-600 text-3xl">
              <FontAwesomeIcon icon={faBed} />
            </span>
            <div>
              <p className="text-sm text-gray-500">{t("bedroom")}</p>
              <p className="text-lg font-semibold">{property.bedrooms}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border">
            <span className="text-blue-600 text-3xl">
              <FontAwesomeIcon icon={faShower} />
            </span>
            <div>
              <p className="text-sm text-gray-500">{t("bathroom")}</p>
              <p className="text-lg font-semibold">{property.bathrooms}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border">
            <span className="text-red-600 text-3xl">
              <FontAwesomeIcon icon={faTreeCity} />
            </span>
            <div>
              <p className="text-sm text-gray-500">{t("city")}</p>
              <p className="text-lg font-semibold">
                {property?.city_id?.city_name?.[currentLanguage]}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
            <DescriptionTwoToneIcon color="primary" />
            {t("detailDescription")}
          </h4>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            {property.description?.[currentLanguage]}
          </p>
        </div>

        {property.features && property.features.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
              <EventNoteTwoToneIcon color="secondary" />
              {t("featuredAmenities")}
            </h4>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {property.features?.map((f) => (
                <span
                  key={f._id}
                  className="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-indigo-100"
                >
                  {f?.feature_name?.[currentLanguage]}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <img
            src={property.owner_id?.avatar}
            alt={property.owner_id?.fullName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-md"
          />
          <div className="text-center sm:text-left">
            <h4 className="text-lg sm:text-xl font-semibold text-gray-800">
              👤 {property.owner_id?.fullName}
            </h4>
            <p className="text-gray-500 text-sm sm:text-base">
              {property.owner_id?.email}
            </p>
            <p className="text-gray-500 text-sm sm:text-base">
              {property.owner_id?.phone}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewDetailProperties;
