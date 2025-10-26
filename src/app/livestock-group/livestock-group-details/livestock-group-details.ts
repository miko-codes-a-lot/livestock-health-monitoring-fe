import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LivestockGroupService } from '../../_shared/service/livestock-group-service';
import { UserService } from '../../_shared/service/user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDto } from '../../_shared/model/user-dto';
import { AuthService } from '../../_shared/service/auth-service';
import { MatIconModule } from '@angular/material/icon';
import { LivestockService } from '../../_shared/service/livestock-service';
import { MatTableModule } from '@angular/material/table'; // <-- Import MatTableModule
import { FullLivestockGroup } from '../../_shared/model/response/full-livestock-group';
import { FullLivestock } from '../../_shared/model/response/full-livestock';

export type LivestockGroupStatus = 'draft' | 'pending' | 'verified' | 'rejected';
@Component({
  selector: 'app-livestock-group-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTableModule // <-- Add MatTableModule here
  ],
  templateUrl: './livestock-group-details.html',
  styleUrls: ['./livestock-group-details.css']
})
export class LivestockGroupDetails implements OnInit {
  isLoading = false;
  livestockGroup?: FullLivestockGroup;
  farmerName = '';
  livestockGroupName = '';
  photoUrls: string[] = [];
  user: UserDto | null = null; 

  livestocks: FullLivestock[] = [];
  // displayedColumns: string[] = ['tagNumber', 'species', 'breed', 'sex', 'age', 'status'];
  displayedColumns: string[] = ['tagNumber', 'species', 'breed', 'sex', 'age'];


  constructor(
    private readonly livestockGroupService: LivestockGroupService,
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly livestockService: LivestockService, // Keep this for status updates
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

    this.livestockGroupService.getOne(id).subscribe({
      next: (livestockGroup) => {
        this.livestockGroup = livestockGroup;
        
        if (livestockGroup.livestocks) {
          this.livestocks = livestockGroup.livestocks;
        }

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
    }).add(() => (this.isLoading = false)); // <-- Your original loading logic is correct now
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
  
  toReview() {
    if (this.livestockGroup?._id) {
      this.processStatus(this.livestockGroup._id, 'pending', 'Successfully Submitted for Review')
      this.updateStatus(this.livestockGroup._id, 'pending')
    }
  }
  
  onApprove() {
    if (this.livestockGroup?._id) {
      this.processStatus(this.livestockGroup._id, 'verified')
      this.updateStatus(this.livestockGroup._id, 'verified')
    }
  }
  
  onReject() {
    if (this.livestockGroup?._id) {
      this.processStatus(this.livestockGroup._id, 'rejected')
      this.updateStatus(this.livestockGroup._id, 'rejected')
    }
  }
  
  updateStatus(groupId: string, status: LivestockGroupStatus) {
    this.isLoading = true;
    this.livestockService.updateGroupStatus(groupId, status).subscribe({
      next: (res) => {
        alert(res.message);
        this.isLoading = false;
        // optionally reload the group details here
      },
      error: (err) => {
        console.error('Failed to update status', err);
        // alert('Failed to update status');
        this.isLoading = false;
      }
    });
  }
  
  processStatus(livestockGroupsId: string, statusValue: string, customMessage?: string) {
    this.livestockGroupService.updateStatus(livestockGroupsId, {status: statusValue})
      .subscribe({
        next: (res) => {
          if(customMessage) {
            alert(customMessage)
          } else {
            alert(`Livestock Successfully ${statusValue}`)
          }
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/livestock-group/details', this.livestockGroup!._id]);
          });
        },
        error: (err) => {
          console.error('Error updating status:', err);
        }
      });
  }

}