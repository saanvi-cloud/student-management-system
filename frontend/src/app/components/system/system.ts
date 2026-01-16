import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/system.service';
import { Settings } from '../../models/system.model';
import { Observable, filter, map } from 'rxjs';

@Component({
  selector: 'app-system',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system.html',
})
export class SettingsComponent implements OnInit {

  settings$!: Observable<Settings>;
  formData!: Settings;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    // Trigger API load
    this.settingsService.loadSettings();

    // Ignore initial null emission
    this.settings$ = this.settingsService.settings$.pipe(
      filter((settings): settings is Settings => settings !== null),
      map(settings => {
        // deep copy to avoid mutating store
        this.formData = structuredClone(settings);
        return settings;
      })
    );
  }

  saveSettings(): void {
    this.settingsService.updateSettings(this.formData).subscribe({
      next: () => alert('Settings saved successfully'),
      error: (err) => console.error(err)
    });
  }
}
