import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLanguage, type Lang } from "@/utils/storage";
import Favorite from "@/components/Property/FavoriteIconProps";
import type { PropertyFavorite } from "@/types/FavoriteType";
import { FiMapPin } from 'react-icons/fi';
import { MdBathtub } from 'react-icons/md';
import { IoBed } from 'react-icons/io5';

type PropertyCardProps = {
    property: PropertyFavorite;
    onRemoveFavorite?: (property: PropertyFavorite) => void;
    onToggleCompare?: () => void;
    isCompared?: boolean;
    disabledCompare?: boolean;
}

const PropertyCardFavorite: React.FC<PropertyCardProps> = ({ property, onRemoveFavorite, onToggleCompare, isCompared, disabledCompare }) => {
    const navigate = useNavigate();
    const currentLanguage: Lang = getLanguage();
    const { t } = useTranslation('propertyPage');

    const handleDetail = () => {
        navigate(`/property/detail/${property.property_id}`);
    };

    const formatPrice = (price: number) => {
        if (price >= 1_000_000_000) {
            return `${(price / 1_000_000_000).toFixed(2)} ${t('billion')}`;
        } else if (price >= 1_000_000) {
            return `${(price / 1_000_000).toFixed(2)} ${t('million')}`;
        } else if (price >= 1_000) {
            return `${(price / 1_000).toFixed(2)} ${t('thousand')}`;
        }
        return price.toLocaleString();
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 transform hover:-translate-y-1">
            {/* Compare Checkbox Section */}
            <div className="flex items-center p-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                {!disabledCompare ? (
                    <label className="flex items-center space-x-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={isCompared}
                            onChange={onToggleCompare}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-all"
                        />
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                            {t('compare')}
                        </span>
                    </label>
                ) : (
                    <label className="flex items-center space-x-2 cursor-not-allowed">
                        <input
                            type="checkbox"
                            disabled
                            aria-label={t('cannotCompare')}
                            className="w-5 h-5 text-gray-300 border-gray-300 rounded opacity-50 cursor-not-allowed"
                        />
                        <span className="text-sm text-gray-400 italic">{t('cannotCompare')}</span>
                    </label>
                )}
            </div>

            {/* Image Section */}
            <div className="aspect-video w-full relative overflow-hidden group cursor-pointer" onClick={handleDetail}>
                {property.type?.type_name[currentLanguage] && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
                        {property.type?.type_name[currentLanguage]}
                    </div>
                )}
                <div className="absolute right-3 top-3 z-10">
                    <Favorite
                        property_id={property.property_id}
                        onRemove={() => onRemoveFavorite && onRemoveFavorite(property)}
                        mode="delayed"
                    />
                </div>
                <img
                    src={property.images[0]}
                    alt={property.title[currentLanguage]}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Content Section */}
            <div className="p-4 space-y-3">
                <h3 className="font-bold text-gray-900 text-base line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer min-h-[3rem]" onClick={handleDetail}>
                    {property.title[currentLanguage]}
                </h3>

                <div className="flex items-start space-x-2 text-gray-500">
                    <FiMapPin className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs line-clamp-2">{property.address[currentLanguage]}</p>
                </div>

                <div className="pt-2 border-t border-gray-100">
                    <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-500">
                        {formatPrice(property.price)} VNĐ
                    </p>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 pt-2">
                    <div className="flex items-center space-x-1">
                        <IoBed className="text-blue-500" />
                        <span className="font-medium">{property.bedrooms}</span>
                    </div>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <div className="flex items-center space-x-1">
                        <MdBathtub className="text-blue-500" />
                        <span className="font-medium">{property.bathrooms}</span>
                    </div>
                </div>

                <button
                    onClick={handleDetail}
                    className="mt-3 w-full py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    {t("propertyCard.viewDetail")}
                </button>
            </div>
        </div>
    );
}

export default PropertyCardFavorite;