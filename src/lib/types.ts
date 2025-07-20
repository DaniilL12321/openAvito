export interface City {
  id: number;
  name: string;
  url: string;
}

export interface AvitoItem {
  category: {
    id: number;
    slug: string;
  };
  id: number;
  images: {
    '208x208': string;
    '236x236': string;
    '240x240': string;
    '416x416': string;
    '432x432': string;
    '472x472': string;
    '864x864': string;
  }[];
  imagesAlt: string;
  imagesCount: number;
  location: {
    id: number;
    name: string;
    namePrepositional: string;
  };
  locationId: number;
  priceDetailed: {
    postfix: string;
    string: string;
    value: number;
    valueOld: string;
    wasLowered: boolean;
  };
  title: string;
  urlPath: string;
  hasDiscount?: boolean;
  delivery?: Record<string, unknown>;
  bannerId?: string;
}

export interface AvitoResponse {
  context: string;
  features: {
    imageAspectRatio: string;
  };
  items: AvitoItem[];
}

export interface AppState {
  selectedCity: City;
  recommendations: AvitoItem[];
  items: AvitoItem[];
} 