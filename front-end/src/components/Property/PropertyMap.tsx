import type { Property } from '../../types/Property';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import React, { useState } from 'react';
import PropertyCard from './PropertyCard';
import { useTranslation } from 'react-i18next';

type PropertyMapProps = {
    properties: Property[];
    center: {
        lat: number,
        lng: number
    }
}
const mapContainerStyle = {
    width: "100%",
    height: "100%",
};


const PropertyMap: React.FC<PropertyMapProps> = ({ properties, center }) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY as string,
    });
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const { t } = useTranslation('propertyPage');
    if (loadError) return <div>{t("propertyMap.errorMap")}</div>;
    if (!isLoaded) return <div>{t("propertyMap.loading")}</div>;

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={12}
            center={center}
        >
            {properties.map((property) => (
                <Marker
                    key={property._id}
                    position={{
                        lat: property.coordinates?.coordinates[1] ?? 0,
                        lng: property.coordinates?.coordinates[0] ?? 0,
                    }}
                    label={{
                        text:
                            property.price >= 1_000_000
                                ? `$${(property.price / 1_000_000).toFixed(1)}M`
                                : property.price >= 1_000 ? `$${(property.price / 1_000).toFixed(1)}K` : `$${property.price}`,
                        className:
                            'bg-white text-white font-semibold text-xs px-2 py-1 rounded-md shadow-md',
                    }}
                    onClick={() => setSelectedProperty(property)}
                />
            ))}
            {selectedProperty && (
                <InfoWindow
                    position={{
                        lat: selectedProperty.coordinates?.coordinates[1] ?? 0,
                        lng: selectedProperty.coordinates?.coordinates[0] ?? 0,
                    }}
                    onCloseClick={() => setSelectedProperty(null)}
                >
                    <div className="max-w-[320px] rounded-xl overflow-hidden shadow-lg">
                        <PropertyCard property={selectedProperty} />
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
}

export default PropertyMap;
