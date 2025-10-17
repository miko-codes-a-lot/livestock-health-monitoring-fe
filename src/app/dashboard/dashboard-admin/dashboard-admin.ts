import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-admin',
  imports: [CommonModule],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css'
})
export class DashboardAdmin implements AfterViewInit, OnDestroy {
  reportData = {
    totalLivestock: 500,
    byType: { cattle: 200, buffalo: 50, swine: 150, goat: 80, chicken: 20 },
    healthStatus: { healthy: 450, sick: 30, quarantine: 15, deceased: 5 },
    vaccinationRate: 85,
    barangayDistribution: { Central: 150, Mangarin: 120, Mabini: 100 },
  };

  charts: Chart[] = [];

  ngAfterViewInit(): void {
    this.createCharts();
  }

  ngOnDestroy(): void {
    this.charts.forEach(chart => chart.destroy());
  }

  createCharts() {
    // Common options for bar charts
    const barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { display: false } }, // Hide legend for cleaner bar charts
    };

    // 1. Livestock by Type (Doughnut Chart)
    const byTypeData = {
      labels: Object.keys(this.reportData.byType).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
      datasets: [{
        label: 'Count',
        data: Object.values(this.reportData.byType),
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336', '#2196F3', '#9E9E9E'],
      }],
    };
    const byTypeChart = new Chart('livestockByTypeChart', {
      type: 'doughnut',
      data: byTypeData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });
    this.charts.push(byTypeChart);

    // 2. Health Status (Bar Chart)
    const healthStatusData = {
      labels: Object.keys(this.reportData.healthStatus).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
      datasets: [{
        label: 'Count',
        data: Object.values(this.reportData.healthStatus),
        backgroundColor: '#3f51b5',
      }],
    };
    const healthStatusChart = new Chart('healthStatusChart', {
      type: 'bar',
      data: healthStatusData,
      options: barChartOptions
    });
    this.charts.push(healthStatusChart);


    // 3. Barangay Distribution (Bar Chart)
    const barangayData = {
      labels: Object.keys(this.reportData.barangayDistribution),
      datasets: [{
        label: 'Head Count',
        data: Object.values(this.reportData.barangayDistribution),
        backgroundColor: '#5AA454',
      }],
    };
    const barangayChart = new Chart('barangayDistChart', {
      type: 'bar',
      data: barangayData,
      options: barChartOptions
    });
    this.charts.push(barangayChart);
  }
}
