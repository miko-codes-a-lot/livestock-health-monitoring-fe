import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LivestockService } from '../../_shared/service/livestock-service';
import { HealthRecordService } from '../../_shared/service/health-record-service';
import { UserService } from '../../_shared/service/user-service';
import { Livestock } from '../../_shared/model/livestock';
import { HealthRecord } from '../../_shared/model/health-record';
import { Chart } from 'chart.js/auto';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-dashboard-veterinarian',
  imports: [CommonModule],
  templateUrl: './dashboard-veterinarian.html',
  styleUrl: './dashboard-veterinarian.css'
})
export class DashboardVeterinarian implements AfterViewInit, OnDestroy {
 reportData = {
    totalLivestock: 0,
    byType: {} as Record<string, number>,
    healthStatus: {} as Record<string, number>,
    vaccinationRate: 0,
    barangayDistribution: {} as Record<string, number>,
  };

  charts: Chart[] = [];

  constructor(
    private readonly livestockService: LivestockService,
    private readonly healthRecordService: HealthRecordService,
    private readonly userService: UserService
  ) {}

  ngAfterViewInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.charts.forEach(chart => chart.destroy());
  }

  loadData() {
    forkJoin({
      livestocks: this.livestockService.getAll(),
      healthRecords: this.healthRecordService.getAll()
    }).subscribe(({ livestocks, healthRecords }) => {
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
        .sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        });

      const latest = records[0];

      if (l.isDeceased) this.reportData.healthStatus['deceased']++;
      else if (!latest) this.reportData.healthStatus['healthy']++;
      else if (latest.diagnosis?.toLowerCase().includes('sick')) this.reportData.healthStatus['sick']++;
      else this.reportData.healthStatus['healthy']++;
    });


    // Vaccination Rate
    const vaccinated = healthRecords.filter(r => !!r.vaccinationDate).length;
    this.reportData.vaccinationRate = Math.round((vaccinated / this.reportData.totalLivestock) * 100);

    // Barangay Distribution
    const farmerIds = Array.from(new Set(livestocks.map(l => l.farmer)));
    forkJoin(farmerIds.map(id => this.userService.getOne(id)))
      .pipe(
        map(users => {
          const distribution: Record<string, number> = {};
          livestocks.forEach(l => {
            const user = users.find(u => u._id === l.farmer);
            const barangay = user?.address?.barangay || 'Unknown';
            distribution[barangay] = (distribution[barangay] || 0) + 1;
          });
          return distribution;
        })
      )
      .subscribe(distribution => {
        this.reportData.barangayDistribution = distribution;
        // After this, you can call this.createCharts() if needed
        this.createCharts();
      });
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
    const byTypeChart = new Chart('livestockByTypeChart', { type: 'doughnut', data: byTypeData });
    this.charts.push(byTypeChart);

    // 2. Health Status
    const healthStatusData = {
      labels: Object.keys(this.reportData.healthStatus).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
      datasets: [{ label: 'Count', data: Object.values(this.reportData.healthStatus), backgroundColor: '#3f51b5' }],
    };
    const healthStatusChart = new Chart('healthStatusChart', { type: 'bar', data: healthStatusData, options: barChartOptions });
    this.charts.push(healthStatusChart);

    // 3. Barangay Distribution
    const barangayData = {
      labels: Object.keys(this.reportData.barangayDistribution),
      datasets: [{ label: 'Head Count', data: Object.values(this.reportData.barangayDistribution), backgroundColor: '#5AA454' }],
    };
    const barangayChart = new Chart('barangayDistChart', { type: 'bar', data: barangayData, options: barChartOptions });
    this.charts.push(barangayChart);
  }
}
