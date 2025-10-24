import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LivestockGroupService } from '../../_shared/service/livestock-group-service';
import { UserService } from '../../_shared/service/user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { LivestockGroup } from '../../_shared/model/livestock-group';

@Component({
  selector: 'app-livestock-group-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './livestock-group-details.html',
  styleUrls: ['./livestock-group-details.css']
})
export class LivestockGroupDetails implements OnInit {
  isLoading = false;
  livestockGroup?: LivestockGroup;
  farmerName = '';
  livestockGroupName = '';
  photoUrls: string[] = []; // <-- store converted URLs here


  constructor(
    private readonly livestockGroupService: LivestockGroupService,
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    const id = this.route.snapshot.params['id'];

    this.livestockGroupService.getOne(id).subscribe({
      next: (livestockGroup) => {
        this.livestockGroup = livestockGroup;

                // Load photo URLs
        if (livestockGroup.groupPhotos?.length) {
          this.livestockGroupService.getGroupPhotos(livestockGroup.groupPhotos)
            .subscribe(urls => this.photoUrls = urls);
        }

        // Fetch farmer name
        if (livestockGroup.farmer) {
          this.userService.getOne(livestockGroup.farmer).subscribe(f => {
            this.farmerName = `${f.firstName} ${f.lastName}`;
          });
        }

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
    if (!this.livestockGroup) return;
    this.router.navigate(['/livestock-group/update', this.livestockGroup._id]);
  }

  getPhotoUrl(filename: string) {
    return `/uploads/livestock-group/${filename}`; // adjust according to your backend storage path
  }
}
