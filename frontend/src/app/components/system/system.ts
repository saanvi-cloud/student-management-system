import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from '../../services/system.service';
import { Settings } from '../../models/system.model';

@Component({
  selector: 'app-system',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system.html',
})
export class SettingsComponent implements OnInit {

  private settingsSubject = new BehaviorSubject<Settings | null>(null);
  settings$ = this.settingsSubject.asObservable();

  formData!: Settings; // editable copy

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe({
      next: (data) => {
        this.settingsSubject.next(data);
        this.formData = JSON.parse(JSON.stringify(data)); // deep copy
      },
      error: err => console.error(err)
    });
  }

  saveSettings(): void {
    this.settingsService.updateSettings(this.formData).subscribe({
      next: () => {
        // update observable so async pipe stays in sync
        this.settingsSubject.next(this.formData);
        alert('Settings saved successfully');
      },
      error: err => console.error(err)
    });
  }
}
