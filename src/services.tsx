import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

export const cookieUtils = {
  // Set cookie
  setCookie: (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  },

  // Get cookie
  getCookie: (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  // Delete cookie
  deleteCookie: (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  },

  // Check if cookie exists
  hasCookie: (name: string): boolean => {
    return cookieUtils.getCookie(name) !== null;
  },
};

// API Base URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Create axios instance WITHOUT withCredentials initially
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  // REMOVED: withCredentials: true - This was causing the network error
  // Only enable if your backend has proper CORS setup with:
  // - Access-Control-Allow-Credentials: true
  // - Access-Control-Allow-Origin: (your frontend URL, NOT *)
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Try COOKIES_USER_ACCESS_TOKEN first, fallback to authToken
    const token = cookieUtils.getCookie("COOKIES_USER_ACCESS_TOKEN") ||
      cookieUtils.getCookie("authToken");

    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = ` ${token}`;
      //config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request for debugging (remove in production)
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
      hasToken: !!token,
    });

    return config;
  },
  (error: AxiosError) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Extract token from response headers if present
    const token =
      response.headers["authorization"] ||
      response.headers["Authorization"] ||
      response.headers["x-auth-token"] ||
      response.headers["token"];

    if (token) {
      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace(/^Bearer\s+/i, "");

      // Save to both cookie names for compatibility
      cookieUtils.setCookie("COOKIES_USER_ACCESS_TOKEN", cleanToken, 7);
      cookieUtils.setCookie("authToken", cleanToken, 7);
      console.log("[Token Saved] Token stored in cookies");
    }

    // Log response for debugging (remove in production)
    console.log(
      `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url
      }`,
      {
        status: response.status,
        data: response.data,
        hasToken: !!token,
      }
    );

    return response;
  },
  async (error: AxiosError) => {
    // Log error for debugging
    console.error("[API Response Error]", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      errorDetails: error,
    });

    // Handle different error status codes
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized - clear auth data and redirect to login
          console.error("[401 Unauthorized] Redirecting to login...");

          // Clear cookies
          cookieUtils.deleteCookie("authToken");
          cookieUtils.deleteCookie("COOKIES_USER_ACCESS_TOKEN");
          cookieUtils.deleteCookie("user");

          // Redirect to login page
          if (window.location.pathname !== "/login") {
            window.location.href = "/admin/login";
          }
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.error("[403 Forbidden] Access denied");
          break;

        case 404:
          // Not found
          console.error("[404 Not Found] Resource not found");
          break;

        case 422:
          // Validation error
          console.error("[422 Validation Error]", error.response.data);
          break;

        case 429:
          // Too many requests
          console.error("[429 Too Many Requests] Rate limit exceeded");
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          console.error(`[${status} Server Error]`, error.response.data);
          break;

        default:
          console.error(`[${status} Error]`, error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("[Network Error] No response received", error.request);
      console.error("Possible causes:");
      console.error("1. CORS issue - check backend CORS configuration");
      console.error("2. Backend server is not running");
      console.error("3. Wrong API_BASE_URL:", API_BASE_URL);
    } else {
      // Something else happened
      console.error("[Error]", error.message);
    }

    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // GET request
  get: async <T = any,>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },

  // POST request
  post: async <T = any,>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },

  // POST request with full response
  postWithHeaders: async <T = any,>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    const response = await apiClient.post<T>(url, data, config);
    return response;
  },

  // PUT request
  put: async <T = any,>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async <T = any,>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T = any,>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },

  // Upload file
  uploadFile: async <T = any,>(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<T> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
    return response.data;
  },

  // Upload multiple files
  uploadFiles: async <T = any,>(
    url: string,
    files: File[],
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<T> => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    const response = await apiClient.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
    return response.data;
  },
};

// Auth helper functions (Cookie-based)
export const authService = {
  // Set auth token
  setToken: (token: string, days: number = 7) => {
    cookieUtils.setCookie("COOKIES_USER_ACCESS_TOKEN", token, days);
    cookieUtils.setCookie("authToken", token, days);
  },

  // Get auth token
  getToken: (): string | null => {
    return cookieUtils.getCookie("COOKIES_USER_ACCESS_TOKEN") ||
      cookieUtils.getCookie("authToken");
  },

  // Remove auth token
  removeToken: () => {
    cookieUtils.deleteCookie("COOKIES_USER_ACCESS_TOKEN");
    cookieUtils.deleteCookie("authToken");
  },

  // Set user data
  setUser: (user: any, days: number = 7) => {
    cookieUtils.setCookie("user", JSON.stringify(user), days);
  },

  // Get user data
  getUser: () => {
    const user = cookieUtils.getCookie("user");
    return user ? JSON.parse(user) : null;
  },

  // Remove user data
  removeUser: () => {
    cookieUtils.deleteCookie("user");
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return cookieUtils.hasCookie("COOKIES_USER_ACCESS_TOKEN") ||
      cookieUtils.hasCookie("authToken");
  },

  // Logout
  logout: () => {
    cookieUtils.deleteCookie("COOKIES_USER_ACCESS_TOKEN");
    cookieUtils.deleteCookie("authToken");
    cookieUtils.deleteCookie("user");
    window.location.href = "/admin/login";
  },
};

export default apiClient;