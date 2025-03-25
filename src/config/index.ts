// For Vercel deployment with proxy
// When in development, use the full API URL from env
// When in production/preview, use the relative /api path which will be proxied

// Safely access environment variables
const getEnv = () => {
  // @ts-ignore - Vite-specific environment variables
  const env = import.meta.env || {};
  return {
    mode: env.MODE as string || 'production',
    apiUrl: env.VITE_MYFIN_BASE_API_URL as string || 'http://localhost:3001'
  };
};

const env = getEnv();
const isDev = env.mode === 'development';

export const MYFIN_BASE_API_URL = isDev ? env.apiUrl : '/api';