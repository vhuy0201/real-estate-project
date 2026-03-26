import { FaSortAmountUpAlt } from "react-icons/fa";
import { FaSortAmountDown } from "react-icons/fa";
import Select from 'react-select'
import type React from "react";
import { useEffect, useState } from "react";
import { getSessionItem, getSessionSortOrder } from "@/utils/sessionUtils";
import type { PropertyFavorite } from "@/types/FavoriteType";
import { PROPERTY_TYPES } from "@/constants/PropertyTypes";
import { useTranslation } from 'react-i18next';
type FavoriteProps = {
    properties: PropertyFavorite[],
    propertiesFiltered: PropertyFavorite[],
    setPropertiesFiltered: React.Dispatch<React.SetStateAction<PropertyFavorite[]>>
};
const NavFavorite: React.FC<FavoriteProps> = ({ properties, propertiesFiltered, setPropertiesFiltered }) => {
    const { t } = useTranslation('favorite');
    const forSale = propertiesFiltered.filter((p) => p.type?.type_name.en === PROPERTY_TYPES.FOR_SALE);
    const forRent = propertiesFiltered.filter((p) => p.type?.type_name.en === PROPERTY_TYPES.FOR_RENT);
    const [filterType, setFilterType] = useState(
        getSessionItem("fav_filter_type", "for-all")
    );
    const [sortField, setSortField] = useState(
        getSessionItem("fav_sort_field", "date")
    );
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
        getSessionSortOrder("fav_sort_order", "desc")
    );
    const optionsFilterByType = [
        { value: 'for-all', label: t('filterByType.forAll') },
        { value: 'for-sale', label: t('filterByType.forSale') },
        { value: 'for-rent', label: t('filterByType.forRent') },
    ];
    const optionsSort = [
        { value: 'price', label: t('sortBy.price') },
        { value: 'date', label: t('sortBy.date') },
        { value: 'bedrooms', label: t('sortBy.bedrooms') },
        { value: 'bathrooms', label: t('sortBy.bathrooms') },
    ];
    useEffect(() => {
        let result = [...properties];
        if (filterType === "for-sale")
            result = result.filter(p => p.type?.type_name.en === PROPERTY_TYPES.FOR_SALE);
        if (filterType === "for-rent")
            result = result.filter(p => p.type?.type_name.en === PROPERTY_TYPES.FOR_RENT);
        const dir = sortOrder === "asc" ? 1 : -1;
        result.sort((a, b) => {
            if (sortField === "date") return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
            if (sortField === "price") return (a.price - b.price) * dir;
            if (sortField === "bedrooms") return (a.bedrooms - b.bedrooms) * dir;
            if (sortField === "bathrooms") return (a.bathrooms - b.bathrooms) * dir;
            return 0;
        });
        setPropertiesFiltered(result);
        sessionStorage.setItem("fav_filter_type", filterType);
        sessionStorage.setItem("fav_sort_field", sortField);
        sessionStorage.setItem("fav_sort_order", sortOrder);
    }, [filterType, sortField, sortOrder, properties]);
    return (
        <div className='w-full h-[15vh] grid grid-cols-1 md:grid-cols-2 shadow-sm ring-2 ring-gray-100'>
            <div className='flex flex-col my-auto ml-5'>
                <h1 className="text-2xl font-semibold">{`${propertiesFiltered.length} ${t('homes')}`}</h1>
                <p className="text-lg text-gray-500">
                    {forSale.length > 0 && `${forSale.length} ${t('forSale')}`}
                    {forSale.length > 0 && forRent.length > 0 && ', '}
                    {forRent.length > 0 && `${forRent.length} ${t('forRent')}`}
                </p>
            </div>
            <div className='flex gap-7 items-center justify-end m-2'>
                <div className="w-[35%]">
                    <Select
                        options={optionsFilterByType}
                        value={optionsFilterByType.find(op => op.value === filterType)}
                        onChange={(op) => setFilterType(op?.value || "for-all")}
                    />
                </div>
                <div className="w-[35%]">
                    <Select
                        options={optionsSort}
                        value={optionsSort.find(op => op.value === sortField)}
                        onChange={(op) => setSortField(op?.value || "date")}
                    />
                </div>
                <div className="cursor-pointer text-xl">
                    {sortOrder === "asc" ? (
                        <FaSortAmountUpAlt onClick={() => setSortOrder("desc")} />
                    ) : (
                        <FaSortAmountDown onClick={() => setSortOrder("asc")} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default NavFavorite;
