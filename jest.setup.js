// jest.setup.js
require('@testing-library/jest-dom');

// ==================== PRIMERO: MOCK DE NEXT/NAVIGATION ====================
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
  })),
  usePathname: jest.fn(() => '/mock-path'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
}));

// ==================== SEGUNDO: MOCKS CRÍTICOS ====================
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  connection: { 
    readyState: 1,
    on: jest.fn(),
    close: jest.fn(),
    db: { collection: jest.fn() }
  },
  Schema: jest.fn().mockImplementation(() => ({
    index: jest.fn(),
    pre: jest.fn(),
    post: jest.fn(),
    statics: {},
    methods: {},
  })),
  model: jest.fn().mockImplementation(() => ({
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    deleteOne: jest.fn().mockResolvedValue({}),
    updateOne: jest.fn().mockResolvedValue({}),
  })),
  Types: {
    ObjectId: jest.fn().mockReturnValue('mock-object-id-123'),
  },
  Document: class MockDocument {},
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn().mockReturnValue({
    currentUser: { 
      uid: 'test-uid', 
      getIdToken: jest.fn().mockResolvedValue('mock-firebase-token'),
    },
  }),
}));

jest.mock('@/lib/services/itinerary-generator.service', () => ({
  itineraryGeneratorService: {
    generateItinerary: jest.fn(),
    generateItineraries: jest.fn(),
  },
}));

// ==================== TERCERO: MOCKS DE STORAGE ====================
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.fetch = jest.fn();

// ==================== CUARTO: EXTENSIONES ====================
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be within range ${floor} - ${ceiling}`,
      pass,
    };
  },
});