export interface CourseFeeEntry {
  academic_year: string;
  semester_1_tuition: number | null;
  semester_2_tuition: number | null;
  recess: number | null;
  semester_1_functional: number | null;
  semester_2_functional: number | null;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  college: string;
  department: string;
  duration_years: number;
  fee_structure?: string | CourseFeeEntry[];
}

export interface CourseUnit {
  id: number;
  code: string;
  name: string;
  course_id: number;
  course_name?: string;
  semester: number;
  year: number;
  credits: number;
}

export interface TimetableEntry {
  id: number;
  program: string;
  program_code?: string | null;
  academic_year: string;
  semester: number;
  year_of_study: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
  session_type?: string | null;
  is_online: boolean;
  lecturer_name?: string | null;
  course_unit_id?: number | null;
  course_unit_code?: string | null;
  course_unit_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
