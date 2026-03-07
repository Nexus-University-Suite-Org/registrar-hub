export interface CourseFeeEntry {
  academic_year: string;
  semester_1_tuition: number;
  semester_2_tuition: number;
  recess: number;
  semester_1_functional: number;
  semester_2_functional: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  college: string;
  department: string;
  duration_years: number;
  fee_structure?: CourseFeeEntry[];
}

export interface CourseUnit {
  id: string;
  code: string;
  name: string;
  course_id: string;
  course_name?: string;
  semester: number;
  year: number;
  credits: number;
}
