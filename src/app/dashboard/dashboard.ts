import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AuthService } from '../_shared/service/auth-service';
import { AnalyticsService } from '../_shared/service/analytics-service';
import { MortalityCause } from '../_shared/model/mortality-cause';
import { MortalityCauseService } from '../_shared/service/mortality-cause-service';

interface DashboardStats {
  totalLivestock: number;
  totalFarmers: number;
  totalTechnicians: number;
  activeClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  activeInsurancePolicies: number;
  healthRecordsThisMonth: number;
}

interface FarmerStats {
  myLivestock: number;
  myClaims: number;
  pendingClaims: number;
  healthCheckups: number;
}

interface ChartData {
  labels: string[];
  data: number[];
}

interface TrendData {
  labels: string[];
  filed: number[];
  processed: number[];
}

interface AdminAnalyticsData {
  stats: DashboardStats;
  livestockBySpecies: ChartData;
  claimsByStatus: ChartData;
  monthlyHealthRecords: ChartData;
  bodyConditions: ChartData;
  mortalityCauses: ChartData;
  livestockByLocation: ChartData;
  claimsTrend: TrendData;
}

interface FarmerAnalyticsData {
  stats: FarmerStats;
  livestockBySpecies: ChartData;
  claimsByStatus: ChartData;
  monthlyHealthRecords: ChartData;
  insuranceCoverage: ChartData;
}

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  role?: string;
  isLoading = true;

  dashboardStats: DashboardStats = {
    totalLivestock: 0,
    totalFarmers: 0,
    totalTechnicians: 0,
    activeClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    activeInsurancePolicies: 0,
    healthRecordsThisMonth: 0
  };

  mortalityCauses: MortalityCause[] = [];
  

  farmerStats: FarmerStats = {
    myLivestock: 0,
    myClaims: 0,
    pendingClaims: 0,
    healthCheckups: 0
  };

  private charts: Map<string, Chart> = new Map();
  private analyticsData: AdminAnalyticsData | FarmerAnalyticsData | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly analyticsService: AnalyticsService,
    private readonly mortalityCauseService: MortalityCauseService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: user => {
        if (!user) {
          console.error('Please login again');
          return;
        }

        this.role = user.role as any;
        this.loadAnalyticsData();
      },
      error: err => {
        console.error('Error getting current user:', err);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }

  onRoleChange(): void {
    this.loadAnalyticsData();
  }

  private loadAnalyticsData(): void {
    this.isLoading = true;
    this.destroyCharts();

    this.analyticsService.getData().subscribe({
      next: data => {
        this.analyticsData = data;
        // Update stats based on role
        if (this.role === 'farmer') {
          this.farmerStats = (data as FarmerAnalyticsData).stats;
        } else {
          this.dashboardStats = (data as AdminAnalyticsData).stats;
        }

        this.isLoading = false;

        // Wait for DOM to update before creating charts
        setTimeout(() => {
          this.initializeCharts();
        }, 100);
      },
      error: err => {
        console.error('Error loading analytics data:', err);
        this.isLoading = false;
      }
    });
  }

  private destroyCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }

  private async initializeCharts(): Promise<any> {
    if (!this.analyticsData) return;

    if (this.role === 'admin' || this.role === 'technician') {
      const data = this.analyticsData as AdminAnalyticsData;
      // fix here
      const mortalityName = await this.getMortalityName(data.mortalityCauses);

      this.createLivestockBySpeciesChart(data.livestockBySpecies);
      this.createClaimsByStatusChart(data.claimsByStatus);
      this.createHealthRecordsTrendChart(data.monthlyHealthRecords);
      this.createBodyConditionChart(data.bodyConditions);
      this.createMortalityCausesChart(mortalityName);
      this.createLivestockByLocationChart(data.livestockByLocation);
      this.createClaimsTrendChart(data.claimsTrend);
    } else if (this.role === 'farmer') {
      const data = this.analyticsData as FarmerAnalyticsData;
      this.createFarmerLivestockChart(data.livestockBySpecies);
      this.createFarmerClaimsChart(data.claimsByStatus);
      this.createFarmerHealthTrendChart(data.monthlyHealthRecords);
      this.createFarmerInsuranceChart(data.insuranceCoverage);
    }
  }

  private async getMortalityName(mortalityCauses: any): Promise<any> {
    if (!mortalityCauses || !Array.isArray(mortalityCauses.labels)) return;
      try {
        const causes = await firstValueFrom(this.mortalityCauseService.getAll());
        const idToName = new Map<string, string>(
          causes.map((c: any) => [ (c._id ?? c.id).toString(), c.label ])
        );

        mortalityCauses.labels = mortalityCauses.labels.map((id: string) =>
          idToName.get(id) ?? id ?? 'Unknown'
        );

        return mortalityCauses; // ✅ return updated object
      } catch (err) {
        console.error('Failed to load mortality causes', err);
        return mortalityCauses;
      }
  }

  private createLivestockBySpeciesChart(chartData: ChartData): void {
    const canvas = document.getElementById('livestockBySpeciesChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.data,
          backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    };

    this.charts.set('livestockBySpecies', new Chart(canvas, config));
  }

  private createClaimsByStatusChart(chartData: ChartData): void {
    const canvas = document.getElementById('claimsByStatusChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Number of Claims',
          data: chartData.data,
          backgroundColor: ['#94a3b8', '#fbbf24', '#10b981', '#ef4444'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    };

    this.charts.set('claimsByStatus', new Chart(canvas, config));
  }

  private createHealthRecordsTrendChart(chartData: ChartData): void {
    const canvas = document.getElementById('healthRecordsTrendChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Total Health Records',
          data: chartData.data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    };

    this.charts.set('healthRecordsTrend', new Chart(canvas, config));
  }

  private createBodyConditionChart(chartData: ChartData): void {
    const canvas = document.getElementById('bodyConditionChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.data,
          backgroundColor: ['#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    };

    this.charts.set('bodyCondition', new Chart(canvas, config));
  }

  private createMortalityCausesChart(chartData: ChartData): void {
    const canvas = document.getElementById('mortalityCausesChart') as HTMLCanvasElement;
    if (!canvas) return;
    console.log('chartData', chartData)
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Number of Cases',
          data: chartData.data,
          backgroundColor: '#ef4444',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { beginAtZero: true }
        }
      }
    };

    this.charts.set('mortalityCauses', new Chart(canvas, config));
  }

  private createLivestockByLocationChart(chartData: ChartData): void {
    const canvas = document.getElementById('livestockByLocationChart') as HTMLCanvasElement;
    if (!canvas) return;

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Number of Animals',
          data: chartData.data,
          backgroundColor: colors.slice(0, chartData.labels.length),
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    };

    this.charts.set('livestockByLocation', new Chart(canvas, config));
  }

  private createClaimsTrendChart(trendData: TrendData): void {
    const canvas = document.getElementById('claimsTrendChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: trendData.labels,
        datasets: [
          {
            label: 'Claims Filed',
            data: trendData.filed,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4
          },
          {
            label: 'Claims Processed',
            data: trendData.processed,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    };

    this.charts.set('claimsTrend', new Chart(canvas, config));
  }

  private createFarmerLivestockChart(chartData: ChartData): void {
    const canvas = document.getElementById('farmerLivestockChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.data,
          backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    };

    this.charts.set('farmerLivestock', new Chart(canvas, config));
  }

  private createFarmerClaimsChart(chartData: ChartData): void {
    const canvas = document.getElementById('farmerClaimsChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'My Claims',
          data: chartData.data,
          backgroundColor: ['#94a3b8', '#fbbf24', '#10b981', '#ef4444'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    };

    this.charts.set('farmerClaims', new Chart(canvas, config));
  }

  private createFarmerHealthTrendChart(chartData: ChartData): void {
    const canvas = document.getElementById('farmerHealthTrendChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'My Health Checkups',
          data: chartData.data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    };

    this.charts.set('farmerHealthTrend', new Chart(canvas, config));
  }

  private createFarmerInsuranceChart(chartData: ChartData): void {
    const canvas = document.getElementById('farmerInsuranceChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.data,
          backgroundColor: ['#10b981', '#94a3b8'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    };

    this.charts.set('farmerInsurance', new Chart(canvas, config));
  }
}