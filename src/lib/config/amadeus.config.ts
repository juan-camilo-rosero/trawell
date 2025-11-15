export const AMADEUS_CONFIG = {
  // Endpoints
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.amadeus.com' 
    : 'https://test.api.amadeus.com',
  
  TOKEN_ENDPOINT: '/v1/security/oauth2/token',
  HOTEL_LIST_ENDPOINT: '/v1/reference-data/locations/hotels/by-geocode',
  HOTEL_SEARCH_ENDPOINT: '/v3/shopping/hotel-offers',
  
  // Flight endpoints - CORREGIDO
  AIRPORT_NEAREST_ENDPOINT: '/v1/reference-data/locations/airports', // Aeropuertos más cercanos
  FLIGHT_OFFERS_ENDPOINT: '/v2/shopping/flight-offers',
  
  // Credentials
  API_KEY: process.env.AMADEUS_API_KEY || '',
  API_SECRET: process.env.AMADEUS_API_SECRET || '',
  
  // Defaults
  DEFAULT_RADIUS_KM: 15,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
  DEFAULT_CURRENCY: 'COP',
  
  // Flight specific defaults
  DEFAULT_AIRPORT_RADIUS_KM: 500, // Máximo 500km según documentación
  DEFAULT_CABIN_CLASS: 'ECONOMY' as const,
  MAX_FLIGHT_RESULTS: 50,
  
  // API Limits
  MAX_HOTEL_IDS_PER_REQUEST: 30,
  TOKEN_EXPIRY_BUFFER: 300,
  
  // Rate limiting
  RATE_LIMIT_DELAY: 100,
} as const;

export const HOTEL_CHAIN_CODES = {
  MARRIOTT: 'MC',
  HILTON: 'HI',
  HYATT: 'HY',
  IHG: 'IC',
  ACCOR: 'AC',
  WYNDHAM: 'WY',
  CHOICE: 'CH',
  BEST_WESTERN: 'BW',
  RADISSON: 'RD',
} as const;

export const AIRLINE_NAMES: Record<string, string> = {
  'AA': 'American Airlines',
  'DL': 'Delta Air Lines',
  'UA': 'United Airlines',
  'AV': 'Avianca',
  'LA': 'LATAM Airlines',
  'CM': 'Copa Airlines',
  'AM': 'Aeroméxico',
  'BA': 'British Airways',
  'IB': 'Iberia',
  'AF': 'Air France',
  'KL': 'KLM',
  'LH': 'Lufthansa',
  'EK': 'Emirates',
  'QR': 'Qatar Airways',
  'TK': 'Turkish Airlines',
  'SQ': 'Singapore Airlines',
  'JJ': 'TAM Linhas Aéreas',
  '4M': 'LATAM Argentina',
  'XL': 'LATAM Ecuador',
  'PZ': 'LATAM Paraguay',
  'LP': 'LATAM Peru',
  'JL': 'Japan Airlines',
  'NH': 'All Nippon Airways',
  'AC': 'Air Canada',
  'WN': 'Southwest Airlines',
  'B6': 'JetBlue Airways',
  'AS': 'Alaska Airlines',
  'F9': 'Frontier Airlines',
  'NK': 'Spirit Airlines',
  'G3': 'Gol Linhas Aéreas',
  'AD': 'Azul Brazilian Airlines',
};