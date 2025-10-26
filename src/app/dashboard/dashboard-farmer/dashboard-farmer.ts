import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LivestockService } from '../../_shared/service/livestock-service';
import { HealthRecordService } from '../../_shared/service/health-record-service';
import { UserService } from '../../_shared/service/user-service';
import { AuthService } from '../../_shared/service/auth-service';
import { Livestock } from '../../_shared/model/livestock';
import { HealthRecord } from '../../_shared/model/health-record';
import { UserDto } from '../../_shared/model/user-dto';
import { Chart } from 'chart.js/auto';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-farmer',
  imports: [CommonModule],
  templateUrl: './dashboard-farmer.html',
  styleUrl: './dashboard-farmer.css'
})
export class DashboardFarmer implements AfterViewInit, OnDestroy {
  reportData = {
    totalLivestock: 0,
    byType: {} as Record<string, number>,
    healthStatus: {} as Record<string, number>,
    vaccinationRate: 0,
    barangayDistribution: {} as Record<string, number>,
  };

  charts: Chart[] = [];
  currentUser: UserDto | null = null;

  constructor(
    private readonly livestockService: LivestockService,
    private readonly healthRecordService: HealthRecordService,
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  ngAfterViewInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if(user)
      this.currentUser = user;
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.charts.forEach(chart => chart.destroy());
  }

  loadData() {
    forkJoin({
      livestocks: this.livestockService.getAll(),
      healthRecords: this.healthRecordService.getAll()
    }).subscribe(({ livestocks, healthRecords }) => {

      // Only include livestock owned by this farmer
      if (this.currentUser && this.currentUser.role === 'farmer') {
        livestocks = livestocks.filter(l => l.farmer === this.currentUser!._id);
      }

      this.processData(livestocks, healthRecords);
      this.createCharts();
    });
  }

  processData(livestocks: Livestock[], healthRecords: HealthRecord[]) {
    this.reportData.totalLivestock = livestocks.length;

    // Livestock by Type
    this.reportData.byType = {};
    livestocks.forEach(l => {
      const type = l.species || 'Unknown';
      this.reportData.byType[type] = (this.reportData.byType[type] || 0) + 1;
    });

    // Health Status
    this.reportData.healthStatus = { healthy: 0, sick: 0, quarantine: 0, deceased: 0 };
    livestocks.forEach(l => {
      const records = healthRecords
        .filter(r => r.animal._id === l._id)
        .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

      const latest = records[0];

      if (l.isDeceased) this.reportData.healthStatus['deceased']++;
      else if (!latest) this.reportData.healthStatus['healthy']++;
      else if (latest.diagnosis?.toLowerCase().includes('sick')) this.reportData.healthStatus['sick']++;
      else this.reportData.healthStatus['healthy']++;
    });

    // Vaccination Rate
    const vaccinated = healthRecords.filter(r => !!r.vaccinationDate).length;
    this.reportData.vaccinationRate = livestocks.length
      ? Math.round((vaccinated / livestocks.length) * 100)
      : 0;

    // Barangay Distribution
    const barangay = this.currentUser?.address?.barangay || 'Unknown';
    this.reportData.barangayDistribution = {};
    this.reportData.barangayDistribution[barangay] = livestocks.length;
  }

  createCharts() {
    const barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { display: false } },
    };

    // 1. Livestock by Type
    const byTypeData = {
      labels: Object.keys(this.reportData.byType).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
      datasets: [{
        label: 'Count',
        data: Object.values(this.reportData.byType),
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336', '#2196F3', '#9E9E9E'],
      }],
    };
    this.charts.push(new Chart('livestockByTypeChart', { type: 'doughnut', data: byTypeData }));

    // 2. Health Status
    const healthStatusData = {
      labels: Object.keys(this.reportData.healthStatus).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
      datasets: [{ label: 'Count', data: Object.values(this.reportData.healthStatus), backgroundColor: '#3f51b5' }],
    };
    this.charts.push(new Chart('healthStatusChart', { type: 'bar', data: healthStatusData, options: barChartOptions }));

    // 3. Barangay Distribution
    const barangayData = {
      labels: Object.keys(this.reportData.barangayDistribution),
      datasets: [{ label: 'Head Count', data: Object.values(this.reportData.barangayDistribution), backgroundColor: '#5AA454' }],
    };
    this.charts.push(new Chart('barangayDistChart', { type: 'bar', data: barangayData, options: barChartOptions }));
  }
}
