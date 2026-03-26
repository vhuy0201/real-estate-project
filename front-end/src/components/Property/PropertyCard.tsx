import React, { } from "react";
import type { Property } from "../../types/Property";
import Carousel from "./Carousel";
import { useNavigate } from "react-router-dom";
import ImageWithFallback from "../common/ImageWithFallback";
import { getLanguage, type Lang } from "../../utils/storage";
import { useTranslation } from "react-i18next";
import Favorite from "./FavoriteIconProps";

type PropertyCardProps = {
    property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
    const navigate = useNavigate();
    const currentLanguage: Lang = getLanguage();
    const { t } = useTranslation('propertyPage');
    const handleDetail = () => {
        navigate(`/property/detail/${property._id}`);
    };

    return (
        <div className="bg-white rounded-md shadow hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="w-full h-48 md:h-56 relative overflow-hidden bg-gray-100">
                {property.type_id?.type_name?.[currentLanguage] && (
                    <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {property.type_id.type_name[currentLanguage]}
                    </div>
                )}
                <div className="absolute top-1 right-2 z-10">
                    <Favorite property_id={property._id} mode="normal" />
                </div>
                <Carousel autoSlide={true} autoSlideInterval={5000}>
                    {property.images.map((imageUrl, index) => (
                        <ImageWithFallback
                            key={index}
                            src={imageUrl}
                            alt={`Ảnh ${index + 1}`}
                            className="w-full h-full object-cover"
                            height="100%"
                        />
                    ))}
                </Carousel>
            </div>
            <div className="p-3 space-y-1">
                <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-1">
                    {property.title[currentLanguage]}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1">{property.address[currentLanguage]}</p>
                <p className="text-blue-600 font-bold text-sm">
                    {property.price >= 1_000_000_000
                        ? `${(property.price / 1_000_000_000).toFixed(1)} Tỷ`
                        : property.price >= 1_000_000
                            ? `${(property.price / 1_000_000).toFixed(1)} Triệu`
                            : property.price >= 1_000 ? `${(property.price / 1_000).toFixed(1)} Nghìn` : `${property.price}`} VNĐ
                </p>
                <p className="text-xs text-gray-600">
                    {property.bedrooms} {t("propertyCard.bedrooms")} · {property.bathrooms} {t("propertyCard.bathrooms")}
                </p>
                <button
                    onClick={handleDetail}
                    className="mt-2 w-full py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    {t("propertyCard.viewDetail")}
                </button>
            </div>
        </div>
    );
}

export default PropertyCard;