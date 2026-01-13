
-- SQL to create student_grades table in Supabase
CREATE TABLE IF NOT EXISTS student_grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  course_id VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  marks INTEGER CHECK (marks >= 0 AND marks <= 100),
  grade VARCHAR(5),
  grade_point DECIMAL(3,2),
  course_title VARCHAR(100) NOT NULL,
  course_code VARCHAR(20) NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  semester_remark VARCHAR(50),
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE student_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY \
Allow
authenticated
users
to
read
student_grades\ ON student_grades
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY \Allow
authenticated
users
to
insert
student_grades\ ON student_grades
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY \Allow
authenticated
users
to
update
student_grades\ ON student_grades
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY \Allow
authenticated
users
to
delete
student_grades\ ON student_grades
  FOR DELETE USING (auth.role() = 'authenticated');

