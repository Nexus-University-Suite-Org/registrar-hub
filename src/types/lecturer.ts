export type LecturerStatus = "Active" | "Inactive" | "Retired";

export interface Lecturer {
  id: string;
  lecturer_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  bio?: string;
  department: string;
  specialization?: string;
  employment_date: string;
  status: LecturerStatus;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  assigned_course_units?: string[]; // Array of course unit IDs assigned to teaches
}

export interface LecturerStats {
  total: number;
  active: number;
  inactive: number;
  retired: number;
}
