
export type Department = "IT" | "HR" | "Finance" | "Marketing" | "Operations" | "Sales";
export type UserRole = "admin" | "user" | "supervisor";

export interface User {
  id: string;
  full_name: string;
  email: string;
  department: Department;
  role: UserRole;
  face_data: any | null;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  status: string;
  created_at: string;
}
