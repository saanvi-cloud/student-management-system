export interface Settings {
  institution: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  academic: {
    semester: number;
    year: string;
    passing_grade: number;
    attendance_required: number;
  };
  notifications: {
    email: boolean;
    grade: boolean;
    attendance: boolean;
  };
}
