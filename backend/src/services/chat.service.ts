// src/services/chat.service.ts
import { SearchCriteria } from "../types/searchCriteria";
import { aiSearchHelper } from "../utils/aiSearchHelper";
import { geocodeAddress } from "../utils/geocodingHelper";
import { propertyService } from "./property.service";

export const chatService = {
  async searchWithAi(message: string) {
    const criteria: SearchCriteria = await aiSearchHelper.parseSearchIntent(
      message
    );

    if (criteria.ignore === true) {
      return {
        ignore: true,
        properties: [],
      };
    }

    let centerPoint: { lat: number; lng: number } | null = null;

    if (criteria.location_query) {
      centerPoint = await geocodeAddress(criteria.location_query);
      if (!centerPoint) {
        console.warn(`Không thể tìm thấy tọa độ cho: ${criteria.location_query}`);
      }
    }

    // gọi PropertyService với các tiêu chí đã lọc
    const properties = await propertyService.findPropertiesByAiCriteria(
      criteria,
      centerPoint
    );

    return {
      ignore: false,
      properties,
    };
  },
};