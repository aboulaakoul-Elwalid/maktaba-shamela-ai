import { toast } from 'sonner';

// lib/base.ts
// Ensure this points to your actual API server
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server-maktaba-shamela.onrender.com';

export async function apiRequest<T>(endpoint: string, options: any = {}): Promise<T> {
  // Get token for authentication
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  // Determine if we need to return the raw response
  const returnRaw = options.raw === true;
  if (options.raw) {
    delete options.raw; // Remove the 'raw' property before sending
  }
  
  // Make sure endpoint starts with '/'
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  try {
    const response = await fetch(`${API_URL}${formattedEndpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    
    // Return raw response if requested
    if (returnRaw) {
      return response as unknown as T;
    }
    
    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status} ${response.statusText}`);
    }
    
    // For HTTP 204 No Content, just return an empty object
    if (response.status === 204) {
      return {} as T;
    }
    
    // Parse and return the JSON response
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}