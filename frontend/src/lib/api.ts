import {
  LoginRequest,
  LoginResponse,
  ApiResponse,
  Activity,
  ActivityFilter,
  PaginatedResponse,
  CreateActivityForm,
  Registration,
  DashboardStats,
  ActivityStatistics,
  User,
  CheckIn,
} from "@/types";

const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Use same-origin /api path — Next.js rewrites will proxy to backend
  return "/api";
};

// Get token from localStorage
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Set token to localStorage
const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

// Remove token from localStorage
const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

// API request wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${getApiBaseUrl()}${endpoint}`, config);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Request failed");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error occurred");
  }
}

// Authentication API
export const authAPI = {
  login: async (
    userId: string,
    password: string,
    role: string,
  ): Promise<LoginResponse> => {
    const response = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ userId, password, role }),
    });

    if (response.token) {
      setToken(response.token);
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
    }

    return response;
  },

  logout: (): void => {
    removeToken();
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiRequest<ApiResponse<User>>("/auth/profile");
  },

  registerStudent: async (data: {
    Student_ID: string;
    Student_Name: string;
    Student_Password: string;
    Faculty_ID?: string;
    Branch_ID?: string;
    Student_Email?: string;
    Student_Phone?: string;
  }): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>("/auth/register/student", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Activities API
export const activitiesAPI = {
  getAll: async (
    filters?: ActivityFilter,
  ): Promise<PaginatedResponse<Activity>> => {
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString();
    const endpoint = queryString ? `/activities?${queryString}` : "/activities";

    return apiRequest<PaginatedResponse<Activity>>(endpoint);
  },

  getById: async (id: string): Promise<ApiResponse<Activity>> => {
    return apiRequest<ApiResponse<Activity>>(`/activities/${id}`);
  },

  create: async (data: CreateActivityForm): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>("/activities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: Partial<CreateActivityForm>,
  ): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/activities/${id}`, {
      method: "DELETE",
    });
  },

  approve: async (id: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/activities/${id}/approve`, {
      method: "POST",
    });
  },

  reject: async (id: string, reason?: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/activities/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  getRegistrations: async (
    id: string,
  ): Promise<ApiResponse<Registration[]>> => {
    return apiRequest<ApiResponse<Registration[]>>(
      `/activities/${id}/registrations`,
    );
  },

  assignClub: async (id: string, clubId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/activities/${id}/assign-club`, {
      method: "POST",
      body: JSON.stringify({ Club_ID: clubId }),
    });
  },

  getAssignedClubs: async (id: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/activities/${id}/assigned-clubs`);
  },
};

// Registration API
export const registrationAPI = {
  register: async (activityId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>("/registrations/register", {
      method: "POST",
      body: JSON.stringify({ Activity_ID: activityId }),
    });
  },

  cancel: async (activityId: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>("/registrations/cancel", {
      method: "POST",
      body: JSON.stringify({ Activity_ID: activityId }),
    });
  },

  getMyRegistrations: async (
    status?: string,
  ): Promise<ApiResponse<Registration[]>> => {
    const endpoint = status
      ? `/registrations/my?status=${status}`
      : "/registrations/my";
    return apiRequest<ApiResponse<Registration[]>>(endpoint);
  },

  getQRCode: async (
    activityId: string,
  ): Promise<ApiResponse<{ qrCode: string }>> => {
    return apiRequest<ApiResponse<{ qrCode: string }>>(
      `/registrations/qr/${activityId}`,
    );
  },

  checkIn: async (qrData: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>("/registrations/checkin", {
      method: "POST",
      body: JSON.stringify({ qrData }),
    });
  },

  getCheckInHistory: async (
    activityId: string,
  ): Promise<ApiResponse<CheckIn[]>> => {
    return apiRequest<ApiResponse<CheckIn[]>>(
      `/registrations/checkin-history/${activityId}`,
    );
  },

  getCheckInStatus: async (activityId: string): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>(`/registrations/checkin-status/${activityId}`);
  },

  getActivityHistory: async (): Promise<ApiResponse<Registration[]>> => {
    return apiRequest<ApiResponse<Registration[]>>("/registrations/history");
  },
};

// Statistics API
export const statisticsAPI = {
  getOverall: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiRequest<ApiResponse<DashboardStats>>("/statistics/overall");
  },

  getActivity: async (id: string): Promise<ApiResponse<ActivityStatistics>> => {
    return apiRequest<ApiResponse<ActivityStatistics>>(
      `/statistics/activity/${id}`,
    );
  },

  getDeanApprovalHistory: async (
    status?: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<any>> => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/statistics/dean/approval-history?${queryString}`
      : "/statistics/dean/approval-history";

    return apiRequest<PaginatedResponse<any>>(endpoint);
  },

  getActivityHead: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiRequest<ApiResponse<DashboardStats>>("/statistics/activity-head");
  },

  getClub: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiRequest<ApiResponse<DashboardStats>>("/statistics/club");
  },
};

// Admin API (User Management)
export const adminAPI = {
  // Get all users by role
  getUsers: async (
    role?: string,
    search?: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<any>> => {
    const params = new URLSearchParams();
    if (role) params.append("role", role);
    if (search) params.append("search", search);
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : "/admin/users";
    return apiRequest<PaginatedResponse<any>>(endpoint);
  },

  // Get single user
  getUser: async (role: string, id: string): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>(`/admin/users/${role}/${id}`);
  },

  // Create user
  createUser: async (role: string, data: any): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/admin/users/${role}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update user
  updateUser: async (role: string, id: string, data: any): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/admin/users/${role}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete user
  deleteUser: async (role: string, id: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/admin/users/${role}/${id}`, {
      method: "DELETE",
    });
  },

  // Reset password
  resetPassword: async (role: string, id: string, newPassword: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/admin/users/${role}/${id}/reset-password`, {
      method: "PUT",
      body: JSON.stringify({ newPassword }),
    });
  },

  // Get dashboard stats
  getDashboardStats: async (): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>("/admin/dashboard");
  },
};

// Reports API
export const reportsAPI = {
  // Submit a problem report (Club)
  create: async (data: {
    Activity_ID: string;
    Report_Text: string;
  }): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>("/reports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get my reports (Club)
  getMyReports: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<ApiResponse<any[]>>("/reports/my");
  },

  // Get reports for activity head
  getForActivityHead: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<ApiResponse<any[]>>("/reports/activity-head");
  },

  // Update report status (Activity Head)
  updateStatus: async (
    reportId: number,
    status: string,
  ): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/reports/${reportId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  // Get gender options
  getGenders: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<ApiResponse<any[]>>("/reports/genders");
  },
};

// Database Management API (Admin)
export const databaseAPI = {
  getTables: async (): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>("/admin/database/tables");
  },

  getTableData: async (table: string, search?: string, page?: number, limit?: number): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    const qs = params.toString();
    return apiRequest<ApiResponse<any>>(`/admin/database/tables/${table}${qs ? `?${qs}` : ""}`);
  },

  updateRow: async (table: string, primaryKeyValues: Record<string, any>, data: Record<string, any>): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/admin/database/tables/${table}`, {
      method: "PUT",
      body: JSON.stringify({ primaryKeyValues, data }),
    });
  },

  deleteRow: async (table: string, primaryKeyValues: Record<string, any>): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/admin/database/tables/${table}`, {
      method: "DELETE",
      body: JSON.stringify({ primaryKeyValues }),
    });
  },

  executeQuery: async (sql: string): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>("/admin/database/query", {
      method: "POST",
      body: JSON.stringify({ sql }),
    });
  },
};

// Export all APIs
export default {
  auth: authAPI,
  activities: activitiesAPI,
  registration: registrationAPI,
  statistics: statisticsAPI,
  admin: adminAPI,
  reports: reportsAPI,
  database: databaseAPI,
};
