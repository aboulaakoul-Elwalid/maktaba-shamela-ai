import { API_URL } from "./constants";

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    status?: number;
    details?: any;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`API GET error (${endpoint}):`, errorData);
        return {
          error: {
            message:
              errorData.detail ||
              `Request failed with status ${response.status}`,
            status: response.status,
            details: errorData,
          },
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`API GET exception (${endpoint}):`, error);
      return {
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async post<T, D = any>(endpoint: string, body?: D): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: this.getAuthHeader(),
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`API POST error (${endpoint}):`, errorData);
        return {
          error: {
            message:
              errorData.detail ||
              `Request failed with status ${response.status}`,
            status: response.status,
            details: errorData,
          },
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`API POST exception (${endpoint}):`, error);
      return {
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "DELETE",
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`API DELETE error (${endpoint}):`, errorData);
        return {
          error: {
            message:
              errorData.detail ||
              `Request failed with status ${response.status}`,
            status: response.status,
            details: errorData,
          },
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`API DELETE exception (${endpoint}):`, error);
      return {
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_URL);
