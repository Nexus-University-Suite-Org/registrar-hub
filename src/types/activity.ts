export interface Activity {
  id?: string;
  action: string;
  entity: string; // e.g., "student", "lecturer"
  entityId: string;
  entityName: string; // e.g., student name
  details?: string;
  timestamp: Date;
  userId: string;
  userName?: string;
}