import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddStudentService } from '../../services/add-student.service';
import { AddStudent } from '../../models/add-student.model';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-student.html',
  styleUrl: './add-student.css',
})
export class AddStudentComponent {

  student: AddStudent = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    status: 'Active'
  };

  constructor(
    private addStudentService: AddStudentService,
    private courseService: CourseService
  ) {}

  courseInput = '';
  allCourses: any[] = [];
  filteredCourses: any[] = [];
  selectedCourses: any[] = [];

  private debounceTimer: any;

  ngOnInit() {
    this.courseService.loadCourses();

    this.courseService.courses$.subscribe((res) => {
      if (!res) {
        this.allCourses = [];
        return;
      }
      this.allCourses = res;
    });
  }

  onCourseInput() {
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      const lastToken = this.courseInput
        .split(',')
        .pop()
        ?.trim()
        .toLowerCase();

      if (!lastToken) {
        this.filteredCourses = [];
        return;
      }

      this.filteredCourses = this.allCourses.filter(c =>
        c.course_name.toLowerCase().includes(lastToken)
      );
    }, 300);
  }

  selectCourse(course: any) {
    if (!this.selectedCourses.find(c => c.course_id === course.course_id)) {
      this.selectedCourses.push(course);
    }

    this.courseInput = '';
    this.filteredCourses = [];
  }


  removeCourse(course: any) {
    this.selectedCourses = this.selectedCourses.filter(
      c => c.course_id !== course.course_id
    );
  }

  onSubmit() {
    if (this.selectedCourses.length === 0) {
      alert('Please select at least one course');
      return;
    }

    const payload = {
      ...this.student,
      course_ids: this.selectedCourses.map(c => c.course_id)
    };

    this.addStudentService.addStudent(payload).subscribe({
      next: () => alert('Student added successfully'),
      error: err => console.error(err)
    });
  }
}
