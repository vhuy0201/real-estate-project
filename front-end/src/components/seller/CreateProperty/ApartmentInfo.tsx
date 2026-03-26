import React from "react";
import { useTranslation } from "react-i18next";
import type { PropertyData } from "@/types/PropertyData";

interface ApartmentInfoProps {
    formData: PropertyData;
    setFormData: React.Dispatch<React.SetStateAction<PropertyData>>;
    apartmentTypeId?: string;
}

const ApartmentInfo: React.FC<ApartmentInfoProps> = ({ formData, setFormData, apartmentTypeId }) => {
    const { t } = useTranslation("createPropertyPage");
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    if (!apartmentTypeId || formData.category_id !== apartmentTypeId) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
                <label className="block text-gray-700 font-medium mb-1 text-xs md:text-sm">
                    {t("formProperty.apartmentInfo.floorNumber")}
                </label>
                <input
                    type="text"
                    name="floor_number"
                    value={formData.floor_number || ""}
                    onChange={handleChange}
                    placeholder={t("formProperty.apartmentInfo.placeholder.floorNumber")}
                    className="w-full border border-gray-300 rounded-lg p-1.5 md:p-2 text-xs md:text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-gray-700 font-medium mb-1 text-xs md:text-sm">
                    {t("formProperty.apartmentInfo.buildingBlock")}
                </label>
                <input
                    type="text"
                    name="building_block"
                    value={formData.building_block || ""}
                    onChange={handleChange}
                    placeholder={t("formProperty.apartmentInfo.placeholder.buildingBlock")}
                    className="w-full border border-gray-300 rounded-lg p-1.5 md:p-2 text-xs md:text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-gray-700 font-medium mb-1 text-xs md:text-sm">
                    {t("formProperty.apartmentInfo.apartmentNumber")}
                </label>
                <input
                    type="text"
                    name="apartment_number"
                    value={formData.apartment_number || ""}
                    onChange={handleChange}
                    placeholder={t("formProperty.apartmentInfo.placeholder.apartmentNumber")}
                    className="w-full border border-gray-300 rounded-lg p-1.5 md:p-2 text-xs md:text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    required
                />
            </div>
        </div>
    );
};

export default ApartmentInfo;
