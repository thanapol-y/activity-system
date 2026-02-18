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
export interface Student {
  Student_ID: string;
  Student_Name: string;
  Student_Password: string;
  Faculty_ID: string;
  Branch_ID: string;
  Student_Email: string;
  Student_Phone: string;
  Gender_ID: string;
}

export interface Dean {
  Dean_ID: string;
  Dean_Name: string;
  Dean_Password: string;
  Department_ID: string;
  Dean_Email: string;
}

export interface ActivityHead {
  Activity_Head_ID: string;
  Activity_Head_Name: string;
  Activity_Head_Password: string;
  Department_ID: string;
  Activity_Head_Email: string;
  Activity_Head_Phone: string;
}

export interface Club {
  Club_ID: string;
  Club_Name: string;
  Club_Password: string;
  Faculty_ID: string;
  Branch_ID: string;
  Club_Email: string;
}

// Other Entities
export interface Faculty {
  Faculty_ID: string;
  Faculty_Name: string;
}

export interface Branch {
  Branch_ID: string;
  Branch_Name: string;
}

export interface Department {
  Department_ID: string;
  Department_Name: string;
}

export interface ActivityType {
  Activity_Type_ID: string;
  Activity_Type_Name: string;
}

export interface Activity {
  Activity_ID: string;
  Activity_Name: string;
  Activity_Details: string;
  Academic_Year: number;
  Activity_Type_ID: string;
  Activity_Date: Date;
  Activity_Time: string;
  Activity_Location: string;
  Maximum_Capacity: number;
  Deadline: Date;
  Activity_Status: ActivityStatus;
  Dean_ID: string | null;
  Activity_Head_ID: string;
  Created_At?: Date;
  Updated_At?: Date;
}

export interface Registration {
  Student_ID: string;
  Activity_ID: string;
  Registration_Date: Date;
  QR_Code_Data: string | null;
  Registration_Status: RegistrationStatus;
}

export interface CheckIn {
  Student_ID: string;
  Activity_ID: string;
  Club_ID: string;
  CheckIn_Time: Date;
}

export interface ActivityAssignment {
  Activity_ID: string;
  Club_ID: string;
  Assigned_Date: Date;
}

// Request/Response Types
export interface LoginRequest {
  userId: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface CreateActivityRequest {
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
  Activity_Head_ID: string;
}

export interface UpdateActivityRequest {
  Activity_Name?: string;
  Activity_Details?: string;
  Activity_Type_ID?: string;
  Activity_Date?: string;
  Activity_Time?: string;
  Activity_Location?: string;
  Maximum_Capacity?: number;
  Activity_Hours?: number;
  Deadline?: string;
}

export interface RegisterActivityRequest {
  Student_ID: string;
  Activity_ID: string;
}

export interface QRCodeData {
  studentId: string;
  activityId: string;
  timestamp: number;
}

export interface CheckInRequest {
  qrData: string;
  Club_ID: string;
}

export interface ActivityStatistics {
  totalActivities: number;
  pendingActivities: number;
  approvedActivities: number;
  rejectedActivities: number;
  totalRegistrations: number;
  totalCheckIns: number;
  activitiesByType: {
    type: string;
    count: number;
  }[];
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  role: UserRole;
  name: string;
  iat?: number;
  exp?: number;
}

// Express Request with User
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
