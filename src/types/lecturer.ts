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
  assigned_course_units?: number[]; // Array of course unit IDs assigned to teaches
  invite_link?: string;
  invite_expires_at?: string;
  email_sent?: boolean;
}

export interface LecturerStats {
  total: number;
  active: number;
  inactive: number;
  retired: number;
}
