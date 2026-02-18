// User Roles
export enum UserRole {
  ADMIN = 'admin',
  DEAN = 'dean',
  ACTIVITY_HEAD = 'activity_head',
  CLUB = 'club',
  STUDENT = 'student',
}

// Activity Status
export enum ActivityStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Registration Status
export enum RegistrationStatus {
  REGISTERED = 'registered',
  CANCELLED = 'cancelled',
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Student {
  Student_ID: string;
  Student_Name: string;
  Faculty_ID: string;
  Branch_ID: string;
  Student_Email: string;
  Student_Phone: string;
  Gender_ID?: string;
  Gender_Name?: string;
  Faculty_Name?: string;
  Branch_Name?: string;
}

export interface Dean {
  Dean_ID: string;
  Dean_Name: string;
  Department_ID: string;
  Dean_Email: string;
}

export interface ActivityHead {
  Activity_Head_ID: string;
  Activity_Head_Name: string;
  Department_ID: string;
  Activity_Head_Email: string;
  Activity_Head_Phone: string;
}

export interface Club {
  Club_ID: string;
  Club_Name: string;
  Faculty_ID: string;
  Branch_ID: string;
  Club_Email: string;
}

// Activity
export interface Activity {
  Activity_ID: string;
  Activity_Name: string;
  Activity_Details: string;
  Academic_Year: number;
  Activity_Type_ID: string;
  Activity_Type_Name?: string;
  Activity_Date: string;
  Activity_Time: string;
  Activity_Location: string;
  Maximum_Capacity: number;
  Activity_Hours?: number;
  Current_Registrations?: number;
  Deadline: string;
  Activity_Status: ActivityStatus;
  Dean_ID: string | null;
  Dean_Name?: string;
  Activity_Head_ID: string;
  Activity_Head_Name?: string;
  Activity_Head_Email?: string;
  Created_At?: string;
  Updated_At?: string;
}

export interface ActivityType {
  Activity_Type_ID: string;
  Activity_Type_Name: string;
}

// Registration
export interface Registration {
  Student_ID: string;
  Activity_ID: string;
  Registration_Date: string;
  QR_Code_Data: string | null;
  Registration_Status: RegistrationStatus;
  Activity_Name?: string;
  Activity_Details?: string;
  Activity_Date?: string;
  Activity_Time?: string;
  Activity_Location?: string;
  Activity_Type_Name?: string;
  Activity_Hours?: number;
  Maximum_Capacity?: number;
  Current_Registrations?: number;
  Activity_Head_Name?: string;
  Has_CheckedIn?: boolean;
  CheckIn_Time?: string;
}

export interface CheckIn {
  Student_ID: string;
  Activity_ID: string;
  Club_ID: string;
  CheckIn_Time: string;
  Student_Name?: string;
  Student_Email?: string;
}

// API Request/Response Types
export interface LoginRequest {
  userId: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Statistics
export interface DashboardStats {
  summary: {
    totalActivities: number;
    totalRegistrations: number;
    totalCheckIns: number;
    totalStudents?: number;
    activeStudents?: number;
  };
  activitiesByStatus?: Array<{
    Activity_Status: string;
    count: number;
  }>;
  activitiesByType?: Array<{
    type: string;
    count: number;
  }>;
  topActivities?: Array<{
    Activity_ID: string;
    Activity_Name: string;
    Activity_Date: string;
    registration_count: number;
    Maximum_Capacity: number;
  }>;
  monthlyTrend?: Array<{
    month: string;
    count: number;
  }>;
  upcomingActivities?: Array<Activity>;
  recentCheckIns?: Array<{
    date: string;
    count: number;
  }>;
}

export interface ActivityStatistics {
  activity: {
    Activity_ID: string;
    Activity_Name: string;
    Activity_Date: string;
    Activity_Time: string;
    Activity_Location: string;
    Activity_Type_Name: string;
    Activity_Head_Name: string;
    Maximum_Capacity: number;
    Activity_Status: string;
  };
  statistics: {
    totalRegistrations: number;
    totalCheckIns: number;
    attendanceRate: number;
    capacityUtilization: number;
  };
  registrationByFaculty: Array<{
    Faculty_Name: string;
    count: number;
  }>;
  registrationByBranch: Array<{
    Branch_Name: string;
    count: number;
  }>;
}

// Form Types
export interface CreateActivityForm {
  Activity_Name: string;
  Activity_Details: string;
  Academic_Year: number;
  Activity_Type_ID: string;
  Activity_Date: string;
  Activity_Time: string;
  Activity_Location: string;
  Maximum_Capacity: number;
  Activity_Hours: number;
  Deadline: string;
}

export interface RegisterActivityForm {
  Activity_ID: string;
}

export interface QRCodeData {
  studentId: string;
  activityId: string;
  timestamp: number;
}

// Filter Types
export interface ActivityFilter {
  status?: ActivityStatus;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Context Types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userId: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Table Column Types
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ProblemReport {
  Report_ID: number;
  Activity_ID: string;
  Club_ID: string;
  Report_Text: string;
  Report_Status: 'pending' | 'acknowledged' | 'resolved';
  Created_At: string;
  Updated_At?: string;
  Activity_Name?: string;
  Club_Name?: string;
}

export interface Gender {
  Gender_ID: string;
  Gender_Name: string;
}
