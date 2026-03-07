export interface FeeAssignment {
  id: string;
  course_id: string;
  course_code?: string;
  course_name?: string;
  semester: number;
  academic_year: string;
  amount: number;
  currency?: string;
  college?: string;
}
