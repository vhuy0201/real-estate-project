import type { PropertyFavorite } from '@/types/FavoriteType'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getLanguage, type Lang } from '@/utils/storage'
import { FiX, FiCheckCircle } from 'react-icons/fi'
import { MdCompare } from 'react-icons/md'

type CompareBarProps = {
    compareList: PropertyFavorite[],
    removeFromCompare: (propertyId: string) => void
}

const CompareBar: React.FC<CompareBarProps> = ({ compareList, removeFromCompare }) => {
    const { t } = useTranslation('favorite');
    const navigate = useNavigate();
    const currentLanguage: Lang = getLanguage();

    const handleCompare = () => {
        if (compareList.length < 2) {
            alert(t('compareMinAlert'));
            return;
        }
        if (compareList.length > 5) {
            alert(t('compareMaxAlert'));
            return;
        }
        const ids = compareList.map(p => p.property_id).join(",");
        navigate(`/compare/${ids}`);
    }

    if (compareList.length === 0) return null;

    const isValidCompareCount = compareList.length >= 2 && compareList.length <= 5;

    return (
        <div className='fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white to-blue-50 shadow-2xl border-t-2 border-blue-200 z-50 animate-slideUp'>
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Left Section - Selected Properties */}
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className="flex items-center space-x-2 bg-blue-100 px-3 py-2 rounded-lg flex-shrink-0">
                            <MdCompare className="text-blue-600 text-xl" />
                            <span className="font-semibold text-blue-700 text-sm">
                                {compareList.length}/5
                            </span>
                        </div>

                        {/* Scrollable Property List */}
                        <div className="flex items-center space-x-2 overflow-x-auto flex-1 pb-1 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
                            {compareList.map((property) => (
                                <div
                                    key={property.property_id}
                                    className="flex items-center space-x-2 bg-white border-2 border-gray-200 p-2 rounded-lg relative group hover:border-blue-400 transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md"
                                >
                                    <img
                                        src={property.images[0]}
                                        alt={property.title[currentLanguage]}
                                        className="w-14 h-14 object-cover rounded-md"
                                    />
                                    <div className="max-w-[120px] hidden sm:block">
                                        <p className="text-xs font-semibold text-gray-700 line-clamp-1">
                                            {property.title[currentLanguage]}
                                        </p>
                                        <p className="text-xs text-gray-500 line-clamp-1">
                                            {property.price >= 1_000_000_000
                                                ? `${(property.price / 1_000_000_000).toFixed(1)}B`
                                                : property.price >= 1_000_000
                                                    ? `${(property.price / 1_000_000).toFixed(1)}M`
                                                    : `${(property.price / 1_000).toFixed(1)}K`} VNĐ
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCompare(property.property_id)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                        title={t('remove')}
                                    >
                                        <FiX className="text-sm" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Section - Compare Button */}
                    <div className="flex items-center space-x-3 flex-shrink-0">
                        {isValidCompareCount && (
                            <div className="hidden sm:flex items-center space-x-1 text-green-600 text-sm font-medium">
                                <FiCheckCircle />
                                <span>{t('readyToCompare')}</span>
                            </div>
                        )}
                        <button
                            onClick={handleCompare}
                            disabled={!isValidCompareCount}
                            className={`
                                px-6 py-3 rounded-lg font-semibold text-white shadow-lg transition-all duration-200 flex items-center space-x-2
                                ${isValidCompareCount
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 hover:shadow-xl transform hover:-translate-y-0.5'
                                    : 'bg-gray-400 cursor-not-allowed opacity-60'
                                }
                            `}
                        >
                            <MdCompare className="text-xl" />
                            <span>{t('compare')}</span>
                        </button>
                    </div>
                </div>

                {/* Helper Text */}
                {!isValidCompareCount && (
                    <div className="mt-2 text-center">
                        <p className="text-xs text-gray-600">
                            {compareList.length < 2
                                ? t('selectAtLeastTwo')
                                : t('maxFiveProperties')
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CompareBar
