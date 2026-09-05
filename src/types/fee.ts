export interface FeeAssignment {
  id: string;
  item_name: string;
  category: string;
  year_level: number;
  semester: number;
  academic_year: string;
  amount: number;
  currency?: string;
  college?: string;
  notes?: string;
}

// Mirrors the NAD admissions-server /api/v1/public/fees/program-semesters payload.
export interface ProgramSemesterFees {
  programCode: string;
  programName: string;
  facultySchool: string;
  campus: string;
  currency: string;
  years: FeeYear[];
}

export interface FeeYear {
  year: number;
  semesters: FeeSemester[];
}

export interface FeeSemester {
  name: string;
  termType: string;
  tuition: number;
  registration: number;
  examination: number;
  functional: number;
  ict: number;
  library: number;
  medical: number;
  accommodation: number;
  other: number;
  total: number;
}
