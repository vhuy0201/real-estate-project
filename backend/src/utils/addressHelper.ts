export const getFullAddress = (property: any, lang: "vi" | "en" = "vi") => {
  if (!property) return "";

  const addressPart = property.address?.[lang] || "";
  const wardName = property.ward_id?.ward_name?.[lang] || "";
  const districtName = property.district_id?.district_name?.[lang] || "";
  const cityName =
    property.city_id?.city_name?.[lang] || property.city_id?.name?.[lang] || "";

  return [addressPart, wardName, districtName, cityName]
    .filter(Boolean)
    .join(", ");
};
