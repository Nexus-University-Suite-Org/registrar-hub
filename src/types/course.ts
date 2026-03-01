export interface Course {
  id: string;
  code: string;
  name: string;
  college: string;
  department: string;
  duration_years: number;
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
