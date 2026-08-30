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
