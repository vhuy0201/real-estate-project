import PropertiesCompare from '../../components/Buyer/Compare/PropertiesCompare';
import { getPropertyByIds } from '@/services/buyerService';
import type { PropertyCompare } from '@/types/FavoriteType';
import { getLanguage, type Lang } from '@/utils/storage';
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useTitle from '@/hooks/useTitle';
import { FiArrowLeft, FiAlertCircle } from 'react-icons/fi';

const PropertiesComparePage = () => {
    const { t } = useTranslation('favorite');
    const navigate = useNavigate();
    const [properties, setProperties] = useState<PropertyCompare[]>([]);
    const { ids } = useParams<{ ids: string }>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const currentLanguage: Lang = getLanguage();

    useTitle(t('comparePageTitle'));

    useEffect(() => {
        if (!ids) {
            setError(t('noPropertiesSelected'));
            return;
        }
        setLoading(true);
        setError(null);
        const fetchProperties = async () => {
            try {
                const data = await getPropertyByIds(ids);
                if (!data || data.length === 0) {
                    setError(t('noPropertiesFound'));
                }
                setProperties(data);
            } catch (error: any) {
                console.error('Error fetching properties:', error);
                setError(error.message || t('errorFetchingProperties'));
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, [ids, currentLanguage, t]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header Section */}
            <div className="bg-white shadow-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
                            >
                                <FiArrowLeft className="text-xl group-hover:-translate-x-1 transition-transform duration-200" />
                                <span className="hidden sm:inline">{t('back')}</span>
                            </button>
                            <div className="h-8 w-px bg-gray-300"></div>
                            <h1 className='text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400'>
                                {t('propertiesCompare')}
                            </h1>
                        </div>
                        {properties.length > 0 && (
                            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                                    {properties.length} {t('properties')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-6 animate-fadeIn">
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
                            <div className="flex items-start">
                                <FiAlertCircle className="text-yellow-600 text-xl mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">{error}</p>
                                    <button
                                        onClick={() => navigate('/favorite')}
                                        className="mt-2 text-sm text-yellow-700 hover:text-yellow-900 underline"
                                    >
                                        {t('goToFavorites')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col justify-center items-center py-32">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100"></div>
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                        </div>
                        <span className="mt-4 text-gray-600 font-medium animate-pulse">{t('loading')}</span>
                    </div>
                ) : properties.length > 0 ? (
                    <div className="animate-fadeIn">
                        <PropertiesCompare properties={properties} />
                    </div>
                ) : !loading && !error && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-gray-400 text-6xl mb-4">🏘️</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('noPropertiesToCompare')}</h3>
                        <p className="text-gray-500 mb-6 text-center max-w-md">{t('selectPropertiesFromFavorites')}</p>
                        <button
                            onClick={() => navigate('/favorite')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                            {t('goToFavorites')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PropertiesComparePage;