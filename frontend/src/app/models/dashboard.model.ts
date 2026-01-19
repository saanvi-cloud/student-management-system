export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
}

export interface TopStudent {
  student_id: string;
  name: string;
  course: string;
  grade: number;
  status: 'Active' | 'Inactive';
}

export interface DashboardResponse {
  stats: DashboardStats;
  topStudents: TopStudent[];
}
