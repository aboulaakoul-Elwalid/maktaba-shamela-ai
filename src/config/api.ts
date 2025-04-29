export const API_CONFIG = {
  // Remove trailing slash to be safe
  BACKEND_URL: (
    process.env.NEXT_PUBLIC_API_URL ||
    "https://server-maktaba-shamela.onrender.com"
  ).replace(/\/$/, ""),
  // Set a 15 second timeout for API requests
  TIMEOUT: 15000,
  // Enable logging
  DEBUG: process.env.NODE_ENV === "development",
};

// Helper function for API debugging
export const logApiCall = (endpoint: string, method: string, data?: any) => {
  if (API_CONFIG.DEBUG) {
    console.log(`🔄 API ${method}: ${endpoint}`, data || "");
  }
};

// Helper function for API responses
export const logApiResponse = (endpoint: string, status: number, data: any) => {
  if (API_CONFIG.DEBUG) {
    console.log(`✅ API Response (${status}): ${endpoint}`, data);
  }
};

// Helper function for API errors
export const logApiError = (endpoint: string, error: any) => {
  if (API_CONFIG.DEBUG) {
    console.error(`❌ API Error: ${endpoint}`, error);
  }
};
