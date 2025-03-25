// Configure API URL based on environment
const getApiUrl = () => {
    try {
      // @ts-ignore - Vite-specific environment variables
      const envApiUrl = import.meta.env?.VITE_MYFIN_BASE_API_URL;
      if (envApiUrl) return envApiUrl as string;
      
      // @ts-ignore - Vite-specific environment variables
      const mode = import.meta.env?.MODE || 'production';
      if (mode === 'development') return 'http://localhost:3001';
      
      return '/api';
    } catch (e) {
      console.warn('Error getting API URL, using default', e);
      return '/api';
    }
  };
  
  export const MYFIN_BASE_API_URL = getApiUrl();