import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LivestockClassificationService } from '../../_shared/service/livestock-classification-service';
import { UserService } from '../../_shared/service/user-service';
import { LivestockGroupService } from '../../_shared/service/livestock-group-service';
import { ActivatedRoute, Router } from '@angular/router';
import { LivestockClassification } from '../../_shared/model/livestock-classification';

@Component({
  selector: 'app-livestock-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './livestock-classification-details.html',
  styleUrls: ['./livestock-classification-details.css']
})
export class LivestockClassificationDetails implements OnInit {
  isLoading = false;
  livestockClassification?: LivestockClassification;
  farmerName = '';
  livestockGroupName = '';
  photoUrls: string[] = []; // <-- store converted URLs here


  constructor(
    private readonly livestockClassificationService: LivestockClassificationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    const id = this.route.snapshot.params['id'];

    this.livestockClassificationService.getOne(id).subscribe({
      next: (livestockClssification) => {
        this.livestockClassification = livestockClssification;
      },
      error: (err) => alert(`Something went wrong: ${err}`),
    }).add(() => (this.isLoading = false));
  }

  fullScreenPhotoUrl: string | null = null;

  openPhoto(url: string) {
    this.fullScreenPhotoUrl = url;
  }

  closePhoto() {
    this.fullScreenPhotoUrl = null;
  }

  onUpdate() {
    if (!this.livestockClassification) return;
    this.router.navigate(['/livestock-classification/update', this.livestockClassification._id]);
  }
}
