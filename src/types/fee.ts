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
