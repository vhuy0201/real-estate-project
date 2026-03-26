import React from "react";
import { useTranslation } from "react-i18next";

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

type Props = {
    city: string;
    district: string;
    ward: string;
    value: string;
    onChange: (val: string) => void;
    onSelect: (lat: number, lon: number) => void;
}

const AddressInputOnBlur: React.FC<Props> = ({
    city,
    district,
    ward,
    value,
    onChange,
    onSelect,
}) => {
    const { t } = useTranslation("addressAutocomplete");
    const handleBlur = async () => {
        if (!value.trim()) return;

        const fullAddress = `${value}, ${ward}, ${district}, ${city}`;
        console.log("Tìm kiếm địa chỉ:", fullAddress);

        try {
            const res = await fetch(
                `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
                    fullAddress
                )}&apiKey=${GEOAPIFY_KEY}`
            );

            const data = await res.json();
            const first = data.features?.[0];
            console.log("Kết quả tìm kiếm:", first);
            if (first) {
                onSelect(first.properties.lat, first.properties.lon);
            } else {
                console.warn("Không tìm thấy kết quả địa chỉ.");
            }
        } catch (err) {
            console.error("Lỗi gọi Geoapify:", err);
        }
    };

    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={t("addressAutocomplete.placeholder")}
            className="w-full h-[61%] border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
        />
    );
};

export default AddressInputOnBlur;
