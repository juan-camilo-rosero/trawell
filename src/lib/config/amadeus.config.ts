export const AMADEUS_CONFIG = {
  // Endpoints
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.amadeus.com' 
    : 'https://test.api.amadeus.com',
  
  TOKEN_ENDPOINT: '/v1/security/oauth2/token',
  HOTEL_LIST_ENDPOINT: '/v1/reference-data/locations/hotels/by-geocode',
  HOTEL_SEARCH_ENDPOINT: '/v3/shopping/hotel-offers',
  
  // Credentials
  API_KEY: process.env.AMADEUS_API_KEY || '',
  API_SECRET: process.env.AMADEUS_API_SECRET || '',
  
  // Defaults
  DEFAULT_RADIUS_KM: 15,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
  DEFAULT_CURRENCY: 'COP',
  
  // API Limits
  MAX_HOTEL_IDS_PER_REQUEST: 30, // Amadeus permite hasta 30 hotelIds en una llamada
  TOKEN_EXPIRY_BUFFER: 300, // 5 minutos de buffer antes de expiración
  
  // Rate limiting
  RATE_LIMIT_DELAY: 100, // ms entre llamadas
} as const;

export const HOTEL_CHAIN_CODES = {
  // Cadenas principales
  MARRIOTT: 'MC',
  HILTON: 'HI',
  HYATT: 'HY',
  IHG: 'IC', // InterContinental Hotels Group
  ACCOR: 'AC',
  WYNDHAM: 'WY',
  CHOICE: 'CH',
  BEST_WESTERN: 'BW',
  RADISSON: 'RD',
  // Añade más según necesites
} as const;