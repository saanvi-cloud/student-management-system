export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO format: 2026-02-12
  type: 'exam' | 'competition' | 'celebration';
}
