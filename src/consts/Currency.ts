export type Currency = {
  symbol: string;
  code: string;
  name: string;
};

const CURRENCIES: Record<string, Currency> = {
  USD: {
    symbol: '$',
    code: 'USD',
    name: 'United States Dollar',
  },
  ARS: {
    symbol: 'ARS$',
    code: 'ARS',
    name: 'Peso Argentino',
  },
  AUD: {
    symbol: 'A$',
    code: 'AUD',
    name: 'Australian Dollar',
  },
  BRL: {
    symbol: 'R$',
    code: 'BRL',
    name: 'Real Brasileiro',
  },
  CAD: {
    symbol: 'C$',
    code: 'CAD',
    name: 'Dollar Canadien',
  },
  CHF: {
    symbol: 'CHF',
    code: 'CHF',
    name: 'Schweizer Franken',
  },
  CNY: {
    symbol: '¥',
    code: 'CNY',
    name: '人民币 (Chinese Yuan)',
  },
  COP: {
    symbol: 'COL$',
    code: 'COP',
    name: 'Peso Colombiano',
  },
  CZK: {
    symbol: 'Kč',
    code: 'CZK',
    name: 'Česká Koruna',
  },
  DKK: {
    symbol: 'kr',
    code: 'DKK',
    name: 'Dansk Krone',
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro',
  },
  GBP: {
    symbol: '£',
    code: 'GBP',
    name: 'Pound Sterling',
  },
  HUF: {
    symbol: 'Ft',
    code: 'HUF',
    name: 'Magyar Forint',
  },
  INR: {
    symbol: '₹',
    code: 'INR',
    name: 'भारतीय रुपया (Bhāratīya Rupayā)',
  },
  ISK: {
    symbol: 'kr',
    code: 'ISK',
    name: 'Íslensk Króna',
  },
  JPY: {
    symbol: '¥',
    code: 'JPY',
    name: '日本円 (Nihon En)',
  },
  MXN: {
    symbol: 'MX$',
    code: 'MXN',
    name: 'Peso Mexicano',
  },
  NOK: {
    symbol: 'kr',
    code: 'NOK',
    name: 'Norsk Krone',
  },
  PLN: {
    symbol: 'zł',
    code: 'PLN',
    name: 'Polski Złoty',
  },
  RON: {
    symbol: 'lei',
    code: 'RON',
    name: 'Leu Românesc',
  },
  SEK: {
    symbol: 'kr',
    code: 'SEK',
    name: 'Svensk Krona',
  },
};

export type CurrencyCode = keyof typeof CURRENCIES;

export { CURRENCIES };
