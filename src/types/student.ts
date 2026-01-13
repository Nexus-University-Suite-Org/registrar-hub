export type StudentStatus = "Active" | "Inactive" | "Graduated" | "Suspended";

export interface Student {
  id: string;
  student_number: string;
  registration_number: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  program: string;
  year_of_study: number;
  status: StudentStatus;
  admission_date: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  graduated: number;
  suspended: number;
}
