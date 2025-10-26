import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LivestockService } from '../../_shared/service/livestock-service';
import { UserService } from '../../_shared/service/user-service';
import { LivestockGroupService } from '../../_shared/service/livestock-group-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Livestock } from '../../_shared/model/livestock';
import { UserDto } from '../../_shared/model/user-dto';
import { AuthService } from '../../_shared/service/auth-service';


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
  templateUrl: './livestock-details.html',
  styleUrls: ['./livestock-details.css']
})
export class LivestockDetails implements OnInit {
  isLoading = false;
  livestock?: Livestock;
  farmerName = '';
  livestockGroupName = '';
  photoUrls: string[] = [];
  user: UserDto | null = null; 

  constructor(
    private readonly livestockService: LivestockService,
    private readonly userService: UserService,
    private readonly livestockGroupService: LivestockGroupService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    const id = this.route.snapshot.params['id'];

    this.authService.currentUser$.subscribe({
      next: (u) => {
        if (u) {
          this.user = u
        }
      }
    })

    this.livestockService.getOne(id).subscribe({
      next: (livestock) => {
        this.livestock = livestock;

                // Load photo URLs
        if (livestock.animalPhotos?.length) {
          this.livestockService.getProfilePictures(livestock.animalPhotos)
            .subscribe(urls => this.photoUrls = urls);
        }

        // Fetch farmer name
        if (livestock.farmer) {
          this.userService.getOne(livestock.farmer).subscribe(f => {
            this.farmerName = `${f.firstName} ${f.lastName}`;
          });
        }

        // Fetch livestock group name
        if (livestock.livestockGroup) {
          this.livestockGroupService.getOne(livestock.livestockGroup).subscribe(g => {
            this.livestockGroupName = g.groupName;
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
    if (!this.livestock) return;
    this.router.navigate(['/livestock/update', this.livestock._id]);
  }

  getPhotoUrl(filename: string) {
    return `/uploads/livestock/${filename}`; // adjust according to your backend storage path
  }
}
