import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StudentTable } from '@/components/students/StudentTable';
import { StudentFormModal } from '@/components/students/StudentFormModal';
import { DeleteConfirmModal } from '@/components/students/DeleteConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Student, StudentStatus } from '@/types/student';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';

// Sample data for demonstration
const sampleStudents: Student[] = [
  {
    id: '1',
    student_number: 'STU-2024-001',
    registration_number: 'REG-2024-001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@university.edu',
    department: 'Computer Science',
    program: 'Bachelor of Science',
    year_of_study: 3,
    status: 'Active',
    admission_date: '2022-09-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    student_number: 'STU-2024-002',
    registration_number: 'REG-2024-002',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@university.edu',
    department: 'Business Administration',
    program: 'Master of Arts',
    year_of_study: 2,
    status: 'Active',
    admission_date: '2023-09-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    student_number: 'STU-2023-045',
    registration_number: 'REG-2023-045',
    first_name: 'Michael',
    last_name: 'Johnson',
    email: 'michael.j@university.edu',
    department: 'Engineering',
    program: 'Bachelor of Science',
    year_of_study: 4,
    status: 'Graduated',
    admission_date: '2020-09-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('registrar_authenticated');
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Load students from localStorage or use sample data
    const savedStudents = localStorage.getItem('registrar_students');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      setStudents(sampleStudents);
      localStorage.setItem('registrar_students', JSON.stringify(sampleStudents));
    }
  }, [navigate]);

  useEffect(() => {
    let filtered = students;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.first_name.toLowerCase().includes(query) ||
          s.last_name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.student_number.toLowerCase().includes(query) ||
          s.department.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    setFilteredStudents(filtered);
  }, [students, searchQuery, statusFilter]);

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setFormMode('add');
    setIsFormOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleViewStudent = (student: Student) => {
    toast.info(`Viewing ${student.first_name} ${student.last_name}'s profile`);
    // Could navigate to a detail page
  };

  const handleFormSubmit = (data: Partial<Student>) => {
    if (formMode === 'add') {
      const newStudent: Student = {
        ...data,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Student;

      const updatedStudents = [...students, newStudent];
      setStudents(updatedStudents);
      localStorage.setItem('registrar_students', JSON.stringify(updatedStudents));
      toast.success('Student added successfully');
    } else {
      const updatedStudents = students.map((s) =>
        s.id === selectedStudent?.id
          ? { ...s, ...data, updated_at: new Date().toISOString() }
          : s
      );
      setStudents(updatedStudents);
      localStorage.setItem('registrar_students', JSON.stringify(updatedStudents));
      toast.success('Student updated successfully');
    }

    setIsFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedStudent) {
      const updatedStudents = students.filter((s) => s.id !== selectedStudent.id);
      setStudents(updatedStudents);
      localStorage.setItem('registrar_students', JSON.stringify(updatedStudents));
      toast.success('Student deleted successfully');
    }
    setIsDeleteOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Students</h1>
            <p className="mt-1 text-muted-foreground">
              Manage student records and enrollment
            </p>
          </div>
          <Button onClick={handleAddStudent} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Add Student
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search students by name, email, or student number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StudentStatus | 'all')}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Graduated">Graduated</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredStudents.length} of {students.length} students
        </p>

        {/* Student Table */}
        {filteredStudents.length > 0 ? (
          <StudentTable
            students={filteredStudents}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
            onView={handleViewStudent}
          />
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">No students found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first student'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={handleAddStudent} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        student={selectedStudent}
        mode={formMode}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        student={selectedStudent}
      />
    </DashboardLayout>
  );
}
