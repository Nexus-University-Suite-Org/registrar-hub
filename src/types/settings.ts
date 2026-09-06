export interface SiteBranding {
  id: number;
  site_name: string;
  tagline?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  meta_description?: string;
  og_image_url?: string;
  updated_at?: string;
}

export interface RegistrarProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  employee_id: string;
  department: string;
  college: string;
  phone_number?: string;
  role?: string;
}

export interface NotificationPreference {
  category: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  updated_at?: string;
}

export interface AuthSession {
  id: number;
  created_at: string;
  expires_at: string;
  active: boolean;
}

export interface EmailTemplate {
  id: number;
  template_key: string;
  name: string;
  subject: string;
  body: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type SurveyQuestionType = "RATING" | "TEXT" | "CHOICE";
export type SurveyStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export interface SurveyQuestion {
  id?: number;
  text: string;
  type: SurveyQuestionType;
  required: boolean;
  sort_order: number;
  options?: string;
}

export interface Survey {
  id: number;
  title: string;
  description?: string;
  year: number;
  semester: number;
  course_unit_id: number | null;
  course_unit_code?: string | null;
  course_unit_name?: string | null;
  status: SurveyStatus;
  deadline: string | null;
  questions: SurveyQuestion[];
  created_at?: string;
  updated_at?: string;
}

export interface CourseUnitOption {
  id: number;
  code: string;
  name: string;
  course_id?: number;
  course_name?: string;
  semester?: number;
  year?: number;
  credits?: number;
}

export interface DatabaseStats {
  students: number;
  courses: number;
  course_units: number;
  lecturers: number;
  fee_assignments: number;
  departments: number;
  service_requests: number;
  calendar_events: number;
  university_services: number;
}