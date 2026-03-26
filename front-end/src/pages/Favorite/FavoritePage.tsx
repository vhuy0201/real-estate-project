import FavoriteList from '@/components/Buyer/Favorite/FavoriteList';
import NavFavorite from '@/components/Buyer/Favorite/NavFavorite';
import useTitle from '@/hooks/useTitle';
import { getAllFavoriteProperties } from '@/services/buyerService';
import type { PropertyFavorite } from '@/types/FavoriteType';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiHeart, FiAlertCircle } from 'react-icons/fi';

const FavoritePage = () => {
    const { t } = useTranslation('favorite');
    const [properties, setProperties] = useState<PropertyFavorite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [propertiesFiltered, setPropertiesFiltered] = useState<PropertyFavorite[]>([]);

    useTitle(t('pageTitle'));

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getAllFavoriteProperties();
                setProperties(data);
                console.log('Fetched favorite properties:', data);
                setPropertiesFiltered(data);
            } catch (error: any) {
                console.error('Error fetching favorite properties:', error);
                setError(error.message || t('errorFetchingProperties'));
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, [t]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header Section */}
            <div className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                            <FiHeart className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className='text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400'>
                                {t('saveHomes')}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">{t('manageYourFavorites')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Section */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 pt-6 sm:px-6 lg:px-8">
                    <div className="animate-fadeIn">
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
                            <div className="flex items-start">
                                <FiAlertCircle className="text-yellow-600 text-xl mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="mt-2 text-sm text-yellow-700 hover:text-yellow-900 underline"
                                    >
                                        {t('retry')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="flex flex-col justify-center items-center py-32">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                    </div>
                    <span className="mt-4 text-gray-600 font-medium animate-pulse">{t('loading')}</span>
                </div>
            ) : properties.length === 0 && !error ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 px-4">
                    <div className="text-gray-300 text-8xl mb-6">
                        <FiHeart />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-3">{t('noFavoritesYet')}</h3>
                    <p className="text-gray-500 mb-8 text-center max-w-md">{t('startAddingFavorites')}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        {t('browseProperties')}
                    </button>
                </div>
            ) : (
                /* Content Section */
                <div className="animate-fadeIn">
                    <NavFavorite
                        properties={properties}
                        propertiesFiltered={propertiesFiltered}
                        setPropertiesFiltered={setPropertiesFiltered}
                    />
                    <FavoriteList properties={propertiesFiltered} />
                </div>
            )}
        </div>
    )
}

export default FavoritePage;