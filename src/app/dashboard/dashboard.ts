import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, map, Observable } from 'rxjs';

import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AuthService } from '../_shared/service/auth-service';
import { AnalyticsService } from '../_shared/service/analytics-service';
import { MortalityCause } from '../_shared/model/mortality-cause';
import { MortalityCauseService } from '../_shared/service/mortality-cause-service';
import { Notification, NotificationType } from '../_shared/model/notification';
import { NotificationService } from '../_shared/service/notification-service';

import { HealthRecordService } from '../_shared/service/health-record-service';
import { LivestockClassificationService } from '../_shared/service/livestock-classification-service';
import { ClaimsService } from '../_shared/service/claims-service';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';

import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { LivestockService } from '../_shared/service/livestock-service';

// Define interfaces for better type safety
interface Animal {
  _id: string; // or ObjectId if using MongoDB
  healthStatus: "healthy" | "diseased"; // adjust if you have other statuses
}

interface Claim {
  _id: string; // or ObjectId
  animal: string; // animal _id
  status: "approved" | "pending" | "rejected"; // adjust if you have other statuses
}
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
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  role?: string;
  isLoading = true;
  mortalityRate = 0;
  diseaseCases = 0;
  healthyAnimals = 0;

  resourceNeeds = {
    vetsNeeded: 0,
    vaccinesNeeded: 0,
    highRiskAnimals: 0
  };

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

  dashboardData = {
    adminDashboard: {
      weeklyReport: {
        weekOf: '',
        totalAppointments: 0,
        patientRecordsChanged: 0,
        preferredServices: {} as Record<string, number>
      },
      dailyAppointmentQueue: [],
      notifications: []
    }
  };

  unreadNotificationsCount$!: Observable<number>;
  notifications$!: Observable<Notification[]>;
  showNotifications = false;

  speciesMap: any = {};
  healthRecords: any[] = [];

  private charts: Map<string, Chart> = new Map();
  private analyticsData: AdminAnalyticsData | FarmerAnalyticsData | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly analyticsService: AnalyticsService,
    private readonly mortalityCauseService: MortalityCauseService,
    private router: Router,
    private notificationService: NotificationService,
    private healthRecordService: HealthRecordService,
    private livestockClassificationService: LivestockClassificationService,
    private livestockService: LivestockService,
    private claimsService: ClaimsService,
  ) {}

  ngOnInit(): void {

    this.loadSpecies();
    this.notifications$ = this.notificationService.notifications$;

    // Calculate unread count dynamically based on the list
    this.unreadNotificationsCount$ = this.notifications$.pipe(
      map(notifications => notifications.filter(n => !n.read).length)
    );

    // We subscribe here to trigger the HTTP call, but we don't need the result
    // because the service updates the BehaviorSubject automatically.
    this.notificationService.getAll().subscribe({
      error: (err) => console.error('Failed to load notifications', err)
    });
    
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

  loadSpecies() {
    this.livestockClassificationService.getAll().subscribe((res: any[]) => {
      res.forEach(item => {
        this.speciesMap[item._id] = item.name;
      });
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
        console.log('this.analyticsData', this.analyticsData);
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

  async loadHealthRecordsAndCreateChart() {
    try {
      const records = await firstValueFrom(this.healthRecordService.getAll());
      this.createBodyConditionBySpeciesChart(records);
    } catch (err) {
      console.error('Failed to load health records', err);
    }
  }

  private destroyCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }

  private async initializeCharts(): Promise<any> {
    if (!this.analyticsData) return;
    const records = await firstValueFrom(this.healthRecordService.getAll());

    if (this.role === 'admin' || this.role === 'technician' || this.role === 'vet') {
      const data = this.analyticsData as AdminAnalyticsData;
      // fix here
      const mortalityName = await this.getMortalityName(data.mortalityCauses);

      this.createLivestockBySpeciesChart(data.livestockBySpecies);
      this.createClaimsByStatusChart(data.claimsByStatus);
      this.createHealthRecordsTrendChart(data.monthlyHealthRecords);
      // this.createBodyConditionChart(data.bodyConditions);
      await this.loadHealthRecordsAndCreateChart();
      this.createMortalityCausesChart(mortalityName);
      this.createLivestockByLocationChart(data.livestockByLocation);
      this.createClaimsTrendChart(data.claimsTrend);
      await this.generateAdvancedReports();
    } else if (this.role === 'farmer') {
      const data = this.analyticsData as FarmerAnalyticsData;
      this.createFarmerLivestockChart(data.livestockBySpecies);
      this.createFarmerClaimsChart(data.claimsByStatus);
      this.createFarmerHealthTrendChart(data.monthlyHealthRecords);
      this.createFarmerInsuranceChart(data.insuranceCoverage);
      await this.loadHealthRecordsAndCreateChart(); // still fetches all records
      this.createFarmerBodyConditionChart(records); // filtered by farmer
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
    console.log('config admin', config)
    this.createOrUpdateChart('livestockBySpecies', canvas, config);
    // this.charts.set('livestockBySpecies', new Chart(canvas, config));
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
    this.createOrUpdateChart('claimsByStatus', canvas, config);
    // this.charts.set('claimsByStatus', new Chart(canvas, config));
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
    this.createOrUpdateChart('healthRecordsTrend', canvas, config);
    // this.charts.set('healthRecordsTrend', new Chart(canvas, config));
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
    this.createOrUpdateChart('bodyCondition', canvas, config);

    // this.charts.set('bodyCondition', new Chart(canvas, config));
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
    this.createOrUpdateChart('mortalityCauses', canvas, config);

    // this.charts.set('mortalityCauses', new Chart(canvas, config));
  }

  private createLivestockByLocationChart(chartData: ChartData): void {
    const canvas = document.getElementById('livestockByLocationChart') as HTMLCanvasElement;
    if (!canvas) return;

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: chartData.labels, // now Barangays
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
    this.createOrUpdateChart('livestockByLocation', canvas, config);

    // this.charts.set('livestockByLocation', new Chart(canvas, config));
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
    this.createOrUpdateChart('claimsTrend', canvas, config);

    // this.charts.set('claimsTrend', new Chart(canvas, config));
  }

  private createFarmerLivestockChart(chartData: ChartData): void {
    console.log('chartData farmer: ', chartData)
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
    console.log('farmer config', config)
    this.createOrUpdateChart('farmerLivestock', canvas, config);
  }

  private createOrUpdateChart(key: string, canvas: HTMLCanvasElement, config: ChartConfiguration): void {
    // Destroy existing chart on same key
    const existingChart = this.charts.get(key);
    if (existingChart) {
      existingChart.destroy();
      this.charts.delete(key);
    }

    // Create new chart
    const chart = new Chart(canvas, config);
    this.charts.set(key, chart);
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
    this.createOrUpdateChart('farmerClaims', canvas, config);

    // this.charts.set('farmerClaims', new Chart(canvas, config));
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
    this.createOrUpdateChart('farmerHealthTrend', canvas, config);

    // this.charts.set('farmerHealthTrend', new Chart(canvas, config));
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
    this.createOrUpdateChart('farmerInsurance', canvas, config);

    // this.charts.set('farmerInsurance', new Chart(canvas, config));
  }

  get weeklyReport() {
    return this.dashboardData.adminDashboard.weeklyReport;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  get notifications() {
    return this.dashboardData.adminDashboard.notifications;
  }
  
  getNotificationTypeClass(type: NotificationType): string {
    return type === NotificationType.SCHEDULE_CREATED ? 'booking' : 'cancellation';
  }

  redirectToDetails(id: string, link: string | undefined) {
    this.markAsRead(id);
    if (link) this.router.navigate([link]);
  }

  formatNotificationType(type: NotificationType): string {
    switch (type) {
      case NotificationType.SCHEDULE_CREATED: return 'New Booking';
      case NotificationType.SCHEDULE_STATUS_UPDATED: return 'Status Update';
      case NotificationType.SCHEDULE_REMINDER: return 'Reminder';
      default: return 'Notification';
    }
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        console.log(`Notification ${notificationId} marked as read`);
      },
      error: (err) => console.error(`Failed to mark notification ${notificationId} as read`, err)
    });
  }

  // Process body condition data, optionally filtering by farmer
  processBodyConditionData(records: any[], farmerId?: string) {
    const latestPerAnimal = new Map();

    records.forEach(record => {
      const animal = record.animal;
      if (!animal?._id) return;

      // Skip animals not belonging to the farmer (if farmerId is provided)
      if (farmerId && animal.farmer !== farmerId) return;

      const existing = latestPerAnimal.get(animal._id);

      if (!existing || new Date(record.visitDate) > new Date(existing.visitDate)) {
        latestPerAnimal.set(animal._id, record);
      }
    });

    const result: any = {};

    latestPerAnimal.forEach(record => {
      const speciesId = record.animal?.species;
      const species = this.speciesMap[speciesId] || 'Unknown';

      const condition = record.bodyCondition || 'Unknown';
      const isDeceased = record.animal?.isDeceased;

      if (!result[species]) {
        result[species] = { conditions: {}, deceased: 0 };
      }

      if (!result[species].conditions[condition]) {
        result[species].conditions[condition] = 0;
      }

      result[species].conditions[condition]++;
      if (isDeceased) result[species].deceased++;
    });

    return result;
  }


  createBodyConditionBySpeciesChart(records: any[]) {
    const canvas = document.getElementById('bodyConditionChart') as HTMLCanvasElement;
    if (!canvas) return;

    const data = this.processBodyConditionData(records);
    const speciesList = Object.keys(data);

    const conditionSet = new Set<string>();
    speciesList.forEach(species => {
      Object.keys(data[species].conditions).forEach(c => conditionSet.add(c));
    });

    const datasets = Array.from(conditionSet).map(condition => ({
      label: condition,
      data: speciesList.map(s => data[s].conditions[condition] || 0)
    }));

    datasets.push({
      label: 'Deceased',
      data: speciesList.map(s => data[s].deceased || 0)
    });

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: speciesList,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    };

    this.createOrUpdateChart('bodyCondition', canvas, config);
  }

  private createFarmerBodyConditionChart(records: any[]) {
    const canvas = document.getElementById('farmerBodyConditionChart') as HTMLCanvasElement;
    if (!canvas) return;

    const farmerId = this.authService.currentUserValue?._id;
    const data = this.processBodyConditionData(records, farmerId);

    const speciesList = Object.keys(data);
    const conditionSet = new Set<string>();
    speciesList.forEach(species => {
      Object.keys(data[species].conditions).forEach(c => conditionSet.add(c));
    });

    const conditionList = Array.from(conditionSet);
    const datasets = conditionList.map(condition => ({
      label: condition,
      data: speciesList.map(species => data[species].conditions[condition] || 0),
      backgroundColor: '#' + Math.floor(Math.random()*16777215).toString(16)
    }));

    // Add deceased
    datasets.push({
      label: 'Deceased',
      data: speciesList.map(species => data[species].deceased || 0),
      backgroundColor: '#ef4444'
    });

    const config: ChartConfiguration = {
      type: 'bar',
      data: { labels: speciesList, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
      }
    };

    this.createOrUpdateChart('farmerBodyCondition', canvas, config);
  }

  private async generateAdvancedReports() {
    try {
      const livestocks = await firstValueFrom(this.livestockService.getAll());
      const healthRecords = await firstValueFrom(this.healthRecordService.getAll());
      const claims = await firstValueFrom(this.claimsService.getAll());

      this.createPopulationTrendChart(livestocks);
      this.createMortalityTrendChart(livestocks, claims);
      this.createDiseaseIncidenceChart(healthRecords);
      // ✅ ADD IT HERE
      this.computeResourcePlanning(livestocks, healthRecords, claims);
        const snapshot = this.computeHealthSnapshot(
          livestocks as any,
          claims as any,
          healthRecords as any
        );
        this.mortalityRate = snapshot.mortalityRate;
        this.diseaseCases = snapshot.diseaseCases;
        this.healthyAnimals = snapshot.healthyAnimals;
      // this.claimsService.getAll().subscribe(claims => {


      // });
    } catch (err) {
      console.error('Error generating reports', err);
    }
  }

  private createPopulationTrendChart(livestocks: any[]) {
    const monthly = this.groupByPeriod(livestocks, 'createdAt', 'month');
    const yearly = this.groupByPeriod(livestocks, 'createdAt', 'year');

    const canvas = document.getElementById('populationTrendChart') as HTMLCanvasElement;

    this.createOrUpdateChart('populationTrend', canvas, {
      type: 'line',
      data: {
        labels: monthly.labels,
        datasets: [
          {
            label: 'Monthly Population',
            data: monthly.data,
            borderColor: '#3b82f6',
            fill: true
          },
          {
            label: 'Yearly Population',
            data: yearly.data,
            borderColor: '#10b981',
            fill: false
          }
        ]
      },
      options: { responsive: true }
    });
  }

  private createMortalityTrendChart(livestocks: any[], claims: any[]) {
    // 1. Filter approved death claims
    const approvedDeaths = claims.filter(c => c.status === 'approved');

    // 2. Normalize IDs and get dates
    const deceasedData = approvedDeaths.map(c => {
      let animalId = '';
      if (typeof c.animal === 'string') {
        animalId = c.animal;
      } else if (c.animal?._id) {
        animalId = c.animal._id.toString();
      }

      // Use claim approval date or visit date
      const date = c.approvalDate || c.createdAt || new Date();

      return { animalId, date };
    });

    if (deceasedData.length === 0) return;

    // 3. Group by period
    const monthlyMap: Record<string, number> = {};
    const yearlyMap: Record<string, number> = {};

    deceasedData.forEach(d => {
      const date = new Date(d.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const yearKey = `${date.getFullYear()}`;

      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + 1;
      yearlyMap[yearKey] = (yearlyMap[yearKey] || 0) + 1;
    });

    const monthlyLabels = Object.keys(monthlyMap).sort();
    const yearlyLabels = Object.keys(yearlyMap).sort();

    const monthlyData = monthlyLabels.map(l => monthlyMap[l]);
    const yearlyData = yearlyLabels.map(l => yearlyMap[l]);

    const canvas = document.getElementById('mortalityTrendChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.createOrUpdateChart('mortalityTrend', canvas, {
      type: 'bar',
      data: {
        labels: monthlyLabels,
        datasets: [
          {
            label: 'Monthly Deaths',
            data: monthlyData,
            backgroundColor: '#ef4444'
          },
          {
            label: 'Yearly Deaths',
            data: yearlyData,
            backgroundColor: '#f87171'
          }
        ]
      },
      options: { responsive: true }
    });
  }

  private createDiseaseIncidenceChart(records: any[]) {
    const validRecords = records.filter(r => r.diagnosis && r.diagnosis.trim() !== '');

    const monthly = this.groupByPeriod(validRecords, 'visitDate', 'month');
    const yearly = this.groupByPeriod(validRecords, 'visitDate', 'year');

    const canvas = document.getElementById('diseaseIncidenceChart') as HTMLCanvasElement;

    this.createOrUpdateChart('diseaseIncidence', canvas, {
      type: 'bar',
      data: {
        labels: monthly.labels,
        datasets: [
          {
            label: 'Monthly Cases',
            data: monthly.data,
            backgroundColor: '#f59e0b'
          },
          {
            label: 'Yearly Cases',
            data: yearly.data,
            backgroundColor: '#fbbf24'
          }
        ]
      },
      options: { responsive: true }
    });
  }

  private computeHealthSnapshot(livestocks: any[], claims: any[], records: any[]) {
    const approvedDeaths = new Set(
      claims
        .filter(c => c.status === "approved")
        .map(c => c.animal?.toString())
    );

    const diseasedAnimals = new Set(
      records
        .filter(r => r.diagnosis && r.diagnosis.trim() !== '')
        .map(r => typeof r.animal === 'string' ? r.animal : r.animal?._id?.toString())
    );

    let numDeaths = approvedDeaths.size;
    let numDiseased = 0;
    let numHealthy = 0;

    livestocks.forEach(l => {
      const id = l._id.toString();

      if (approvedDeaths.has(id)) return;

      if (diseasedAnimals.has(id)) {
        numDiseased++;
      } else {
        numHealthy++;
      }
    });

    const total = numHealthy + numDiseased + numDeaths;

    const mortalityRate = total > 0
      ? ((numDeaths / total) * 100).toFixed(2)
      : "0.00";

    this.mortalityRate = parseFloat(mortalityRate);
    this.diseaseCases = numDiseased;
    this.healthyAnimals = numHealthy;

    return {
      mortalityRate: parseFloat(mortalityRate),
      diseaseCases: numDiseased,
      healthyAnimals: numHealthy
    };
  }

  private groupByPeriod(items: any[], dateField: string, type: 'month' | 'year') {
    const map: Record<string, number> = {};

    items.forEach(item => {
      const date = new Date(item[dateField]);
      const key = type === 'year'
        ? `${date.getFullYear()}`
        : `${date.getFullYear()}-${date.getMonth() + 1}`;

      map[key] = (map[key] || 0) + 1;
    });

    const labels = Object.keys(map).sort();
    const data = labels.map(l => map[l]);

    return { labels, data };
  }

  private computeResourcePlanning(livestocks: any[], records: any[], claims: any[]) {
    // 1. Filter out records with diagnosis
    const diseasedRecords = records.filter(r => r.diagnosis && r.diagnosis.trim() !== '');

    // 2. Get IDs of animals that are marked as dead (approved claims)
    const deathIds = new Set(
      claims
        .filter(c => c.status === 'approved')
        .map(c => c.animal?.toString())
    );

    // 3. High-risk animals = diseased animals excluding those already dead
    const highRiskAnimals = new Set(
      diseasedRecords
        .map(r => r.animal?._id?.toString() || r.animal?.toString())
        .filter(id => !deathIds.has(id))
    ).size;

    this.resourceNeeds = {
      vetsNeeded: Math.ceil(highRiskAnimals / 10), // 1 vet per 10 high-risk animals
      vaccinesNeeded: livestocks.length * 2,       // simple estimate
      highRiskAnimals
    };
  }
}