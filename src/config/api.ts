const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();

// Normalize trailing slash so endpoint joins are consistent.
export const API_BASE_URL = (rawApiBaseUrl || 'https://ecommerce-application-uat.onrender.com')
  .replace(/\/+$/, '');
