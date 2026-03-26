export interface SearchCriteria {
  location_query?: string; 
  min_price?: number;
  max_price?: number;
  category?: string;   
  features?: string[];  
  ignore?: boolean;
}