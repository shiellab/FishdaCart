const readEnv = (key) => {
  if (typeof process === 'undefined' || !process.env) {
    return undefined;
  }

  return process.env[key];
};

const valueOrFallback = (key, fallback) => {
  const value = readEnv(key);
  return value && value.trim() ? value.trim() : fallback;
};

export const API_BASE_URL = valueOrFallback(
  'FISHDACART_API_BASE_URL',
  'http://192.168.11.185:8000/api',
);

export const ADMIN_DASHBOARD_URL = valueOrFallback(
  'FISHDACART_ADMIN_DASHBOARD_URL',
  'http://192.168.11.185:8000/dashboard',
);

export const GOOGLE_WEB_CLIENT_ID = valueOrFallback(
  'FISHDACART_GOOGLE_WEB_CLIENT_ID',
  'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
);
