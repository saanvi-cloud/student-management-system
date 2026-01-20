export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalGrades: number;
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
