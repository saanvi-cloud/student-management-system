export interface Attendance {
  student_id: string; 
  student_name: string;
  course_name: string; 
  attendance_rate: number; 
  total_classes: number; 
  present: number; 
  absent: number; 
  attendance_status: string;
  status?: string;
}