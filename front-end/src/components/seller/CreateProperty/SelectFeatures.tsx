import React, { useState, useEffect } from 'react'
import type { Feature } from '@/types/Feature'
import { getLanguage, type Lang } from '@/utils/storage'
import { useTranslation } from 'react-i18next'

interface SelectFeaturesProps {
    selectedFeatures: string[];
    onChange: (features: string[]) => void;
    availableFeatures: Feature[];
    loading?: boolean;
}

const SelectFeatures: React.FC<SelectFeaturesProps> = ({ selectedFeatures, onChange, availableFeatures, loading = false }) => {
    const [features, setFeatures] = useState<string[]>(selectedFeatures);
    const currentLanguage: Lang = getLanguage();
    const { t } = useTranslation("createPropertyPage");
    useEffect(() => {
        setFeatures(selectedFeatures);
    }, [selectedFeatures]);

    const toggleFeature = (featureId: string) => {
        const newFeatures = features.includes(featureId)
            ? features.filter(f => f !== featureId)
            : [...features, featureId];
        setFeatures(newFeatures);
        onChange(newFeatures);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">{t("selectFeatures.loading")}</span>
            </div>
        );
    }

    return (
        <div className="mt-4">
            <p className='text-sm text-gray-600 mb-4'> {t("selectFeatures.selected", { count: features.length })} </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-3">
                {availableFeatures.map((feature) => (
                    <button
                        key={feature._id}
                        type='button'
                        onClick={() => toggleFeature(feature._id)}
                        className={`border-2 rounded-2xl cursor-pointer w-full h-full flex flex-col items-center justify-center transition-all hover:scale-105 ${features.includes(feature._id)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                            }`}
                    >
                        <span className='text-sm font-medium text-center px-1'>
                            {feature.feature_name[currentLanguage]}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default SelectFeatures;
