-- Database schema for Registrar Hub
-- This script creates the necessary tables for the registrar system

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_number VARCHAR(50) UNIQUE NOT NULL,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  program VARCHAR(100) NOT NULL,
  year_of_study INTEGER NOT NULL CHECK (year_of_study > 0),
  status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Inactive', 'Graduated', 'Suspended')),
  admission_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lecturers table (for future integration with lecturer system)
CREATE TABLE IF NOT EXISTS lecturers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lecturer_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  specialization VARCHAR(100),
  employment_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Retired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create registrars table
CREATE TABLE IF NOT EXISTS registrars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Registrar',
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
  hire_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  academic_year VARCHAR(20) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  course_code VARCHAR(20) NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  grade VARCHAR(5),
  grade_point DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
CREATE INDEX IF NOT EXISTS idx_lecturers_email ON lecturers(email);
CREATE INDEX IF NOT EXISTS idx_lecturers_department ON lecturers(department);
CREATE INDEX IF NOT EXISTS idx_registrars_email ON registrars(email);
CREATE INDEX IF NOT EXISTS idx_registrars_auth_id ON registrars(auth_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_student_id ON transcripts(student_id);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrars ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Students table policies
CREATE POLICY "Allow authenticated users to read students" ON students
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert students" ON students
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update students" ON students
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete students" ON students
  FOR DELETE USING (auth.role() = 'authenticated');

-- Lecturers table policies
CREATE POLICY "Allow authenticated users to read lecturers" ON lecturers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert lecturers" ON lecturers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update lecturers" ON lecturers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete lecturers" ON lecturers
  FOR DELETE USING (auth.role() = 'authenticated');

-- Registrars table policies
CREATE POLICY "Users can read their own registrar profile" ON registrars
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert their own registrar profile" ON registrars
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can update their own registrar profile" ON registrars
  FOR UPDATE USING (auth.uid() = auth_id);

-- Transcripts table policies
CREATE POLICY "Allow authenticated users to read transcripts" ON transcripts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert transcripts" ON transcripts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update transcripts" ON transcripts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete transcripts" ON transcripts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lecturers_updated_at BEFORE UPDATE ON lecturers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrars_updated_at BEFORE UPDATE ON registrars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transcripts_updated_at BEFORE UPDATE ON transcripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();