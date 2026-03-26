import type { PropertyCompare } from '@/types/FavoriteType'
import { getLanguage, type Lang } from '@/utils/storage';
import React from 'react'
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiHome, FiCalendar, FiMapPin, FiDollarSign } from 'react-icons/fi';
import { MdBathtub } from 'react-icons/md';
import { IoBed } from 'react-icons/io5';

type PropertiesComparePageProps = {
    properties: PropertyCompare[];
}

const PropertiesCompare: React.FC<PropertiesComparePageProps> = ({ properties }) => {
    const currentLanguage: Lang = getLanguage();
    const { t } = useTranslation(['favorite']);
    const navigate = useNavigate();

    const formatPrice = (price: number) => {
        if (price >= 1_000_000_000) {
            return `${(price / 1_000_000_000).toFixed(2)} ${t('favorite:billion')} VNĐ`;
        } else if (price >= 1_000_000) {
            return `${(price / 1_000_000).toFixed(2)} ${t('favorite:million')} VNĐ`;
        } else if (price >= 1_000) {
            return `${(price / 1_000).toFixed(2)} ${t('favorite:thousand')} VNĐ`;
        }
        return `${price.toLocaleString()} VNĐ`;
    };

    const formatArea = (area: number | undefined) => {
        if (!area) return "-";
        return `${area.toLocaleString()} m²`;
    };

    const fields = [
        {
            label: t('favorite:compareFields.status'),
            icon: <FiBriefcase className="inline mr-2" />,
            value: (p: PropertyCompare) => p.type_id.type_name[currentLanguage],
            type: 'badge'
        },
        {
            label: t('favorite:compareFields.price'),
            icon: <FiDollarSign className="inline mr-2" />,
            value: (p: PropertyCompare) => formatPrice(p.price),
            type: 'price'
        },
        {
            label: t('favorite:compareFields.bedrooms'),
            icon: <IoBed className="inline mr-2" />,
            value: (p: PropertyCompare) => `${p.bedrooms} ${t('favorite:rooms')}`,
            type: 'number'
        },
        {
            label: t('favorite:compareFields.bathrooms'),
            icon: <MdBathtub className="inline mr-2" />,
            value: (p: PropertyCompare) => `${p.bathrooms}`,
            type: 'number'
        },
        {
            label: t('favorite:compareFields.square'),
            icon: <FiHome className="inline mr-2" />,
            value: (p: PropertyCompare) => formatArea(p.area),
            type: 'area'
        },
        {
            label: t('favorite:compareFields.homeType'),
            icon: <FiHome className="inline mr-2" />,
            value: (p: PropertyCompare) => p.category_id.category_name[currentLanguage],
            type: 'text'
        },
        {
            label: t('favorite:compareFields.yearBuilt'),
            icon: <FiCalendar className="inline mr-2" />,
            value: (p: PropertyCompare) => p.yearBuilt ?? "-",
            type: 'text'
        },
    ];

    const handleDetail = (property: PropertyCompare) => {
        navigate(`/property/detail/${property._id}`);
    };

    return (
        <div className='bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200'>
            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
                <table className='w-full'>
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <th className='w-48 p-4 text-left font-semibold text-gray-700 sticky left-0 bg-gradient-to-r from-blue-50 to-indigo-50 z-10'></th>
                            {properties.map((property) => (
                                <th key={property._id} className="p-4 min-w-[280px]">
                                    <div
                                        className='flex flex-col group cursor-pointer transition-all duration-300 hover:scale-[1.02]'
                                        onClick={() => handleDetail(property)}
                                    >
                                        <div className="relative overflow-hidden rounded-lg shadow-md mb-3">
                                            <img
                                                src={property.images[0]}
                                                alt={property.title[currentLanguage]}
                                                className='w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110'
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <p className="text-sm font-semibold line-clamp-1">{property.title[currentLanguage]}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start text-left bg-white p-2 rounded-md shadow-sm">
                                            <FiMapPin className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                                            <span className='text-xs text-gray-600 line-clamp-2'>
                                                {property.address[currentLanguage]}, {property.ward_id.ward_name[currentLanguage]}, {property.district_id.district_name[currentLanguage]}, {property.city_id.city_name[currentLanguage]}
                                            </span>
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map((field, index) => (
                            <tr
                                key={field.label}
                                className={`transition-colors duration-200 hover:bg-blue-50 ${index % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
                            >
                                <th className='text-left p-4 font-semibold text-gray-700 border-r border-gray-200 sticky left-0 bg-inherit z-10'>
                                    <div className="flex items-center">
                                        <span className="text-blue-500">{field.icon}</span>
                                        <span className="text-sm">{field.label}</span>
                                    </div>
                                </th>
                                {properties.map((property) => (
                                    <td key={property._id} className="p-4 text-center border-l border-gray-100">
                                        {field.type === 'badge' ? (
                                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                                {field.value(property)}
                                            </span>
                                        ) : field.type === 'price' ? (
                                            <span className="text-lg font-bold text-green-600">
                                                {field.value(property)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-700 font-medium">
                                                {field.value(property)}
                                            </span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile/Tablet View */}
            <div className="lg:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    {properties.map((property) => (
                        <div
                            key={property._id}
                            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                        >
                            <div
                                className="relative cursor-pointer group"
                                onClick={() => handleDetail(property)}
                            >
                                <img
                                    src={property.images[0]}
                                    alt={property.title[currentLanguage]}
                                    className='w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105'
                                />
                                <div className="absolute top-2 left-2">
                                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold shadow-lg">
                                        {property.type_id.type_name[currentLanguage]}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-start mb-2">
                                    <FiMapPin className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                        {property.address[currentLanguage]}, {property.ward_id.ward_name[currentLanguage]}, {property.district_id.district_name[currentLanguage]}, {property.city_id.city_name[currentLanguage]}
                                    </p>
                                </div>
                                <div className="border-t pt-3 space-y-2">
                                    {fields.map((field) => (
                                        <div key={field.label} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 flex items-center">
                                                <span className="text-blue-500 text-base">{field.icon}</span>
                                                <span className="text-xs">{field.label}</span>
                                            </span>
                                            <span className={`font-semibold ${field.type === 'price' ? 'text-green-600' : 'text-gray-800'}`}>
                                                {field.value(property)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PropertiesCompare;
