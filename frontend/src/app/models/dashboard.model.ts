export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalCourses: number;
  totalGrades: number;
  averageGrade: number;
}

export interface TopStudent {
  student_id: string;
  name: string;
  course: string;
  grade: string | null;
  status: 'Active' | 'Inactive' | 'Graduated';
}

export interface DashboardResponse {
  stats: DashboardStats;
  topStudents: TopStudent[];
}
