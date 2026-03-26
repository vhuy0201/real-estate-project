import { getLanguage } from "@/utils/storage";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

interface AddressAutocompleteProps {
    value?: string;
    onSelect: (address: string, lat: number, lon: number) => void;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    value: propValue,
    onSelect,
}) => {
    const { t } = useTranslation("addressAutocomplete");
    const [inputValue, setInputValue] = useState(propValue || "");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isSelectingRef = useRef(false);
    useEffect(() => {
        setInputValue(propValue || "");
    }, [propValue]);

    useEffect(() => {
        if (isSelectingRef.current) {
            isSelectingRef.current = false;
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!inputValue.trim()) {
            setSuggestions([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
                        inputValue
                    )}&apiKey=${GEOAPIFY_KEY}`
                );
                const data = await res.json();
                setSuggestions(data.features || []);
            } catch (err) {
                console.error("Geoapify fetch error:", err);
            } finally {
                setLoading(false);
            }
        }, 500);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [inputValue]);

    const handleSelect = (item: any) => {
        isSelectingRef.current = true;
        const address = `${item.properties.address_line1 || ""}${item.properties.city ? `, ${item.properties.city}` : ""
            }`;
        setInputValue(address);
        setSuggestions([]);
        onSelect(address, item.properties.lat, item.properties.lon);
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t("addressAutocomplete.placeholder")}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />

            {(loading || suggestions.length > 0) && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {loading && (
                        <div className="px-3 py-2 text-gray-500 text-sm">{t("addressAutocomplete.loading")}</div>
                    )}

                    {!loading &&
                        suggestions.map((item) => (
                            <div
                                key={item.properties.place_id}
                                onClick={() => handleSelect(item)}
                                className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                            >
                                {item.properties.address_line1}
                                {item.properties.city && `, ${item.properties.city}`}
                            </div>
                        ))}

                    {!loading && !suggestions.length && inputValue.trim() && (
                        <div className="px-3 py-2 text-gray-500 text-sm italic">
                            {t("addressAutocomplete.notFound")}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AddressAutocomplete;
