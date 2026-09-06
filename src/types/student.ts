export type StudentStatus = "Active" | "Inactive" | "Graduated" | "Suspended";

export type ApplicationStatus =
  | "SUBMITTED"
  | "ADMITTED"
  | "REJECTED"
  | "WAITLISTED"
  | "DRAFT";

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
  status: StudentStatus | ApplicationStatus;
  admission_date: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;

  source?: "registrar" | "nap";
  prn?: string;
  other_names?: string;
  phone_number?: string;
  gender?: string;
  date_of_birth?: string;
  marital_status?: string;
  nationality?: string;
  address?: string;
  postal_address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  district?: string;
  subcounty?: string;
  village?: string;
  has_national_id_or_passport?: string;
  birth_certificate_or_national_id_details?: string;
  passport_photo_uploaded?: boolean;
  passport_photo_url?: string;
  guardian_name?: string;
  guardian_type?: string;
  guardian_phone?: string;
  next_of_kin_relationship?: string;
  is_ugandan?: string;
  application_type?: string;
  entry_scheme?: string;
  program_choice_1?: string;
  program_choice_2?: string;
  program_choice_3?: string;
  program_choice_4?: string;
  assigned_programme?: string;
  total_weight_score?: number;
  qualification_results?: string;
  start_date?: string;
  previous_institution?: string;
  highest_qualification?: string;
  academic_credential_level?: string;
  academic_credentials_details?: string;
  study_mode?: string;
  academic_year?: string;
  semester?: string;
  email_verified?: boolean;
  review_status?: string;
  submitted_at?: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  uce_result?: string;
  uace_result?: string;
  documents?: string;
  extras?: string;
  uce_index_number?: string;
  uce_year_of_sitting?: string;
  uce_total_aggregates?: string;
  uce_division?: string;
  o_level_school_name?: string;
  uace_index_number?: string;
  uace_year_of_sitting?: string;
  uace_total_points?: string;
  uace_principal_subjects?: string;
  uace_general_paper_grade?: string;
  uace_ict_or_sub_math_subject?: string;
  uace_ict_or_sub_math_grade?: string;
  o_level_subjects?: string;
  certificate_subjects?: string;
  gpa?: string;
  personal_statement?: string;
  how_did_you_hear?: string;
  documents_confirmed?: boolean;
  application_fee_paid?: boolean;
  payment_method?: string;
  payment_reference?: string;
  interview_preference?: string;
  terms_accepted?: boolean;
}

export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  graduated: number;
  suspended: number;
}
