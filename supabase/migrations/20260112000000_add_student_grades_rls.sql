Session exists: true
Results.tsx:365 Session error: null
Results.tsx:368 User ID: b6c0465e-da63-4a24-85c4-382b34d8ef70
Results.tsx:369 User email: waluube69alvin@gmail.com
Results.tsx:378 ✅ SESSION FOUND - Calling fetchResults
Results.tsx:98 🔍 FETCHING RESULTS - Starting fetchResults function...
Results.tsx:101 🧪 Testing service key client...
Results.tsx:106 Service key test result: [{…}] Error: null
Results.tsx:129 Found 2 students
Results.tsx:133 Student IDs for query: (2) ['9fc64b89-bdef-4778-bb60-2733e24f911f', '8ca6bc18-acd4-4f27-a81b-bc00b7938504']
Results.tsx:136 📊 Testing grades query with regular client...
Results.tsx:141 Grades test (regular client): [] Error: null
Results.tsx:150 Testing query for first student ID: 9fc64b89-bdef-4778-bb60-2733e24f911f
Results.tsx:155 Specific student query: 0 records, Error: null
Results.tsx:164 Testing query for ALL grades (no filter)...
Results.tsx:169 All grades query: 0 records, Error: null
Results.tsx:177 Testing different table names...
Results.tsx:190 Table 'student_grades': 0 records, Error: undefined
@supabase_supabase-js.js?v=a6bf00c2:11446  GET https://oszbmaqieyemkgcqbeap.supabase.co/rest/v1/grades?select=*&limit=1 404 (Not Found)
(anonymous) @ @supabase_supabase-js.js?v=a6bf00c2:11446
(anonymous) @ @supabase_supabase-js.js?v=a6bf00c2:11460
await in (anonymous)
then @ @supabase_supabase-js.js?v=a6bf00c2:273Understand this error
Results.tsx:190 Table 'grades': 0 records, Error: Could not find the table 'public.grades' in the schema cache
@supabase_supabase-js.js?v=a6bf00c2:11446  GET https://oszbmaqieyemkgcqbeap.supabase.co/rest/v1/studentgrades?select=*&limit=1 404 (Not Found)
(anonymous) @ @supabase_supabase-js.js?v=a6bf00c2:11446
(anonymous) @ @supabase_supabase-js.js?v=a6bf00c2:11460
await in (anonymous)
then @ @supabase_supabase-js.js?v=a6bf00c2:273Understand this error
Results.tsx:190 Table 'studentgrades': 0 records, Error: Could not find the table 'public.studentgrades' in the schema cache
@supabase_supabase-js.js?v=a6bf00c2:11446  GET https://oszbmaqieyemkgcqbeap.supabase.co/rest/v1/public.student_grades?select=*&limit=1 404 (Not Found)
(anonymous) @ @supabase_supabase-js.js?v=a6bf00c2:11446
(anonymous) @ @supabase_supabase-js.js?v=a6bf00c2:11460
await in (anonymous)
then @ @supabase_supabase-js.js?v=a6bf00c2:273Understand this error
Results.tsx:190 Table 'public.student_grades': 0 records, Error: Could not find the table 'public.public.student_grades' in the schema cache
Results.tsx:209 Raw student grades data: []
Results.tsx:210 Grades error: null
Results.tsx:246 Student Alvin David (2400711805): 0 grades
Results.tsx:324 Final calculation for Alvin David:
Results.tsx:327   Total grade points: 0
Results.tsx:328   Total credits: 0
Results.tsx:329   CGPA: 0
Results.tsx:246 Student Jane Smith (STU002): 0 grades
Results.tsx:324 Final calculation for Jane Smith:
Results.tsx:327   Total grade points: 0
Results.tsx:328   Total credits: 0
Results.tsx:329   CGPA: 0
Results.tsx:346 ✅ FETCH COMPLETE - Setting results: (2) [{…}, {…}]-- Add RLS policies for student_grades table
-- This migration adds the necessary Row Level Security policies

-- Enable RLS on student_grades table
ALTER TABLE student_grades ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read student_grades" ON student_grades
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert student_grades" ON student_grades
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update student_grades" ON student_grades
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete student_grades" ON student_grades
  FOR DELETE USING (auth.role() = 'authenticated');