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
  years: string[] = [];

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();

    this.years = [];
    for (let i = 0; i < 5; i++) {
      const start = currentYear - i;
      const end = currentYear - i + 1;
      this.years.push(`${start}-${end}`);
    }

    // trigger load
    this.settingsService.loadSettings();

    // subscribe pipeline
    this.settings$ = this.settingsService.settings$.pipe(
      filter((settings): settings is Settings => settings !== null),
      map(settings => {
        this.formData = structuredClone(settings);

        // safe default
        if (!this.formData.academic.year) {
          this.formData.academic.year = this.years[0];
        }

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

  onReset() {
    if (!confirm('This will delete all your data and reload demo data. Continue?')) return;

    this.settingsService.resetDemo().subscribe({
      next: () => {
        alert('Demo data reset successfully');
        window.location.reload();
      },
      error: () => alert('Reset failed')
    });
  }
}
