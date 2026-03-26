import { useEffect, useMemo, useState } from 'react';
import type { Property } from '../../types/Property';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import { getAllPropertiesByUser } from '../../services/propertyService';
import { useSearchParams } from 'react-router-dom';
import PropertyMap from '../../components/Property/PropertyMap';
import PropertyCard from '../../components/Property/PropertyCard';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Map as MapIcon, List as ListIcon } from '@mui/icons-material';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { getLanguage, type Lang } from '../../utils/storage';
import { useTranslation } from 'react-i18next';
import useTitle from '@/hooks/useTitle';
const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { t } = useTranslation('propertyPage');
    const currentLanguage: Lang = getLanguage();
    useTitle(t("titlePage"));
    const query = searchParams.get('q') || '';
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : '';
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : '';
    const bedrooms = searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : '';
    const bathrooms = searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : '';
    const type = searchParams.get('type') || '';
    const sortBy = searchParams.get('sortBy') || '';

    const [searchInput, setSearchInput] = useState(query);

    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
        lat: 16.0748,
        lng: 108.2240,
    });
    const [page, setPage] = useState(1);
    const itemsPerPage = 6;
    const [mapView, setMapView] = useState(false);
    const slug = (str: string) =>
        str.toLowerCase().trim().replace(/\s+/g, "-");
    const typeSlug = type.toLowerCase();
    useEffect(() => {
        setSearchInput(query);
    }, [query]);

    const updateSearchParams = (updates: Record<string, string | number | undefined>) => {
        const newParams = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            if (value === '' || value === null || value === undefined) {
                newParams.delete(key);
            } else {
                newParams.set(key, String(value));
            }
        });

        setSearchParams(newParams);
    };

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                const data = await getAllPropertiesByUser();
                setProperties(data);
                console.log(data);
            } catch (error: any) {
                setError(error.message || t("propertyPage.errorData"));
            } finally {
                setLoading(false);
            }
        }
        fetchProperties();
    }, [])

    const filteredProperties = useMemo(() => {
        const removeVietnameseTones = (str: string) => {
            if (!str) return '';
            return str
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d").replace(/Đ/g, "D")
                .replace(/\s+/g, "")
                .toLowerCase().trim();
        };
        const normalizedQuery = removeVietnameseTones(query);
        let result = properties.filter((p) => {
            const title = removeVietnameseTones(p.title?.[currentLanguage] || '');
            const address = removeVietnameseTones(`${p.address?.[currentLanguage]} ${p.city_id?.city_name?.[currentLanguage]}` || '');
            const matchesQuery =
                title.includes(normalizedQuery) || address.includes(normalizedQuery);
            const matchesPrice = (minPrice === '' || p.price >= minPrice) && (maxPrice === '' || p.price <= maxPrice);
            const matchesBed = bedrooms === '' || p.bedrooms >= bedrooms;
            const matchesBath = bathrooms === '' || p.bathrooms >= bathrooms;
            const matchesStatus =
                !type ||
                (p.type_id?.type_name?.en &&
                    slug(p.type_id.type_name.en) === typeSlug);
            return matchesPrice && matchesBed && matchesBath && matchesStatus && matchesQuery;
        })
        if (sortBy === 'priceAsc') result = [...result].sort((a, b) => a.price - b.price);
        if (sortBy === 'priceDesc') result = [...result].sort((a, b) => b.price - a.price);
        if (sortBy === 'titleAsc') result = [...result].sort((a, b) => (a.title?.[currentLanguage] || '').localeCompare(b.title?.[currentLanguage] || ''));
        if (sortBy === 'titleDesc') result = [...result].sort((a, b) => (b.title?.[currentLanguage] || '').localeCompare(a.title?.[currentLanguage] || ''));
        if (sortBy === 'bedAsc') result = [...result].sort((a, b) => a.bedrooms - b.bedrooms);
        if (sortBy === 'bedDesc') result = [...result].sort((a, b) => b.bedrooms - a.bedrooms);
        if (sortBy === 'bathAsc') result = [...result].sort((a, b) => a.bathrooms - b.bathrooms);
        if (sortBy === 'bathDesc') result = [...result].sort((a, b) => b.bathrooms - a.bathrooms);
        return result;
    }, [query, minPrice, maxPrice, bedrooms, bathrooms, type, properties, sortBy, currentLanguage]);

    const paginatedProperties = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredProperties.slice(start, end);
    }, [filteredProperties, page]);

    useEffect(() => {
        setPage(1);
    }, [filteredProperties]);

    const handleSearch = async (searchValue: string) => {
        if (!searchValue.trim()) return;
        updateSearchParams({ q: searchValue.trim() });
        try {
            const openCaseApiKey = import.meta.env.VITE_OPENCASE_API_KEY;
            const res = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(searchValue)}&key=${openCaseApiKey}&limit=1&countrycode=vn`
            )
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry;
                setMapCenter({ lat, lng });
            } else {
                alert(t("propertyPage.errorSearchPosition"));
            }
        } catch (error) {
            console.log(t("propertyPage.errorGeocoding"), error);
        }
    }
    useEffect(() => {
        if (query) {
            handleSearch(query);
        }
    }, []);

    const clearSearch = () => {
        setSearchInput('');
        setSearchParams({});
        setMapCenter({ lat: 21.0285, lng: 105.8542 });
    };

    const handleMinPriceChange = (event: SelectChangeEvent<number | '' | any>) => {
        const value = event.target.value === '' ? undefined : Number(event.target.value);
        updateSearchParams({ minPrice: value });
    };

    const handleMaxPriceChange = (event: SelectChangeEvent<number | '' | any>) => {
        const value = event.target.value === '' ? undefined : Number(event.target.value);
        updateSearchParams({ maxPrice: value });
    };

    const handleBedroomsChange = (event: SelectChangeEvent<number | '' | any>) => {
        const value = event.target.value === '' ? undefined : Number(event.target.value);
        updateSearchParams({ bedrooms: value });
    };

    const handleBathroomsChange = (event: SelectChangeEvent<number | '' | any>) => {
        const value = event.target.value === '' ? undefined : Number(event.target.value);
        updateSearchParams({ bathrooms: value });
    };

    const handleSortByChange = (event: SelectChangeEvent<string>) => {
        updateSearchParams({ sortBy: event.target.value || undefined });
    };

    return (
        <>
            <div className="fixed inset-x-0 top-20 md:top-[85px] bottom-0 overflow-hidden flex flex-col">
                <div className="w-full flex flex-col md:flex-row md:items-center md:justify-center gap-3 p-3 bg-white shadow-sm sticky top-0 z-10">
                    <div className="flex items-center border rounded-lg px-3 py-2 bg-white transition focus-within:ring-2 focus-within:ring-gray-300 w-full md:w-[53%]">
                        <input
                            type="text"
                            placeholder={t("propertyPage.placeholderSearch")}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearch(searchInput);
                                }
                            }}
                            className="w-full outline-none bg-transparent text-gray-700"
                        />
                        <div className="flex items-center gap-1 ml-2 text-gray-500">
                            {searchInput && (
                                <button
                                    onClick={clearSearch}
                                    aria-label="cancel-icon"
                                    className="hover:text-red-500 transition"
                                >
                                    <CancelIcon fontSize="small" />
                                </button>
                            )}
                            <button
                                aria-label="search-icon"
                                className="hover:text-blue-600 transition"
                                onClick={() => handleSearch(searchInput)}
                            >
                                <SearchOutlinedIcon fontSize="small" />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full md:w-auto justify-center ">

                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel>{t("propertyPage.minPrice")}</InputLabel>
                            <Select value={minPrice} label={t("propertyPage.minPrice")} onChange={handleMinPriceChange}>
                                <MenuItem value=""><em>{t("propertyPage.minPrice")}</em></MenuItem>
                                <MenuItem value={500000000}>500 Triệu</MenuItem>
                                <MenuItem value={800000000}>800 Triệu</MenuItem>
                                <MenuItem value={1000000000}>1 Tỷ</MenuItem>
                                <MenuItem value={2000000000}>2 Tỷ</MenuItem>
                                <MenuItem value={3000000000}>3 Tỷ</MenuItem>
                                <MenuItem value={5000000000}>5 Tỷ</MenuItem>
                                <MenuItem value={8000000000}>8 Tỷ</MenuItem>
                                <MenuItem value={10000000000}>10 Tỷ</MenuItem>
                                <MenuItem value={15000000000}>15 Tỷ</MenuItem>
                                <MenuItem value={20000000000}>20 Tỷ</MenuItem>
                                <MenuItem value={30000000000}>30 Tỷ</MenuItem>
                                <MenuItem value={50000000000}>50 Tỷ</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel>{t("propertyPage.maxPrice")}</InputLabel>
                            <Select value={maxPrice} label={t("propertyPage.maxPrice")} onChange={handleMaxPriceChange}>
                                <MenuItem value=""><em>{t("propertyPage.maxPrice")}</em></MenuItem>
                                <MenuItem value={500000000}>500 Triệu</MenuItem>
                                <MenuItem value={800000000}>800 Triệu</MenuItem>
                                <MenuItem value={1000000000}>1 Tỷ</MenuItem>
                                <MenuItem value={2000000000}>2 Tỷ</MenuItem>
                                <MenuItem value={3000000000}>3 Tỷ</MenuItem>
                                <MenuItem value={5000000000}>5 Tỷ</MenuItem>
                                <MenuItem value={8000000000}>8 Tỷ</MenuItem>
                                <MenuItem value={10000000000}>10 Tỷ</MenuItem>
                                <MenuItem value={15000000000}>15 Tỷ</MenuItem>
                                <MenuItem value={20000000000}>20 Tỷ</MenuItem>
                                <MenuItem value={30000000000}>30 Tỷ</MenuItem>
                                <MenuItem value={50000000000}>50 Tỷ</MenuItem>
                                <MenuItem value={100000000000}>100 Tỷ</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>{t("propertyPage.bedrooms")}</InputLabel>
                            <Select value={bedrooms} label={t("propertyPage.bedrooms")} onChange={handleBedroomsChange}>
                                <MenuItem value=""><em>{t("propertyPage.bedrooms")}</em></MenuItem>
                                <MenuItem value={1}>1+</MenuItem>
                                <MenuItem value={2}>2+</MenuItem>
                                <MenuItem value={3}>3+</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>{t("propertyPage.bathrooms")}</InputLabel>
                            <Select value={bathrooms} label={t("propertyPage.bathrooms")} onChange={handleBathroomsChange}>
                                <MenuItem value=""><em>{t("propertyPage.bathrooms")}</em></MenuItem>
                                <MenuItem value={1}>1+</MenuItem>
                                <MenuItem value={2}>2+</MenuItem>
                                <MenuItem value={3}>3+</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0">
                    <div className={`h-full min-h-0 ${mapView ? 'block' : 'hidden'} md:block`}>
                        {loading ? (
                            <div className='flex justify-center items-center h-full' >{t("propertyPage.loadMap")}</div>
                        ) : error ? (
                            <div className='flex justify-center items-center h-full text-red-500'>{error}</div>
                        ) : (
                            <PropertyMap properties={filteredProperties} center={mapCenter} />
                        )}
                    </div>
                    <div className={`h-full flex-col p-3 overflow-y-auto ${mapView ? 'hidden' : 'flex'} md:flex`}>
                        {loading ? (
                            <div className='flex justify-center items-center h-full' >{t("propertyPage.loadProperty")}</div>
                        ) : error ? (
                            <div className='flex justify-center items-center h-full text-red-500'>{error}</div>
                        ) : (
                            <>
                                <h1 className="text-xl font-semibold mb-2">{t("propertyPage.searchResults")}</h1>
                                <div className="flex justify-between items-center mb-3 text-gray-600">
                                    <p>{filteredProperties.length} {t("propertyPage.resultsFound")}</p>
                                    <FormControl size="small" sx={{ minWidth: 150 }}>
                                        <InputLabel>{t("propertyPage.sortBy")}</InputLabel>
                                        <Select value={sortBy} label={t("propertyPage.sortBy")} onChange={handleSortByChange}>
                                            <MenuItem value=""><em>{t("propertyPage.sortBy")}</em></MenuItem>
                                            <MenuItem value="priceAsc">{t("propertyPage.price")} ↑</MenuItem>
                                            <MenuItem value="priceDesc">{t("propertyPage.price")} ↓</MenuItem>
                                            <MenuItem value="titleAsc">{t("propertyPage.title")} A–Z</MenuItem>
                                            <MenuItem value="titleDesc">{t("propertyPage.title")} Z–A</MenuItem>
                                            <MenuItem value="bedAsc">{t("propertyPage.bedrooms")} ↑</MenuItem>
                                            <MenuItem value="bedDesc">{t("propertyPage.bedrooms")} ↓</MenuItem>
                                            <MenuItem value="bathAsc">{t("propertyPage.bathrooms")} ↑</MenuItem>
                                            <MenuItem value="bathDesc">{t("propertyPage.bathrooms")} ↓</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {paginatedProperties.map((property: Property) => (
                                        <PropertyCard key={property._id} property={property} />
                                    ))}
                                </div>
                            </>
                        )}
                        <div className="mt-auto">
                            <Pagination
                                count={Math.ceil(filteredProperties.length / itemsPerPage)}
                                page={page}
                                onChange={(_, value) => setPage(value)}
                                renderItem={(item) => (
                                    <PaginationItem
                                        slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                                        {...item}
                                    />
                                )}
                                className="flex justify-center mt-4"
                            />
                        </div>
                    </div>
                </div>
                <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <button
                        onClick={() => setMapView(!mapView)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-1"
                    >
                        {mapView ? <ListIcon fontSize='small' /> : <MapIcon fontSize='small' />}
                        <span className='text-sm'>{mapView ? 'List' : 'Map'}</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default SearchPage;
