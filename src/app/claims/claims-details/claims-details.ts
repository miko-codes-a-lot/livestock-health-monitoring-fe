import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClaimsService } from '../../_shared/service/claims-service';
import { UserService } from '../../_shared/service/user-service';
import { LivestockGroupService } from '../../_shared/service/livestock-group-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Claims } from '../../_shared/model/claims';

import { LivestockService } from '../../_shared/service/livestock-service';
import { LivestockBreedService } from '../../_shared/service/livestock-breed-service';
import { LivestockClassificationService } from '../../_shared/service/livestock-classification-service';
import { AuthService } from '../../_shared/service/auth-service';
import { MatIconModule } from '@angular/material/icon';
import { UserDto } from '../../_shared/model/user-dto';

@Component({
  selector: 'app-claims-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './claims-details.html',
  styleUrls: ['./claims-details.css']
})
export class ClaimsDetails implements OnInit {
  isLoading = false;
  claims?: Claims;
  farmerName = '';
  livestockGroupName = '';
  breedName = '';
  speciesName = '';
  animalTag: string | null = null;
  policy: string | null = null;
  photoUrls?: string[] = [];

  fullScreenPhotoUrl: string | null = null;
  user: UserDto | null = null; 

  constructor(
    private readonly claimsService: ClaimsService,
    private readonly userService: UserService,
    private readonly livestockService: LivestockService,
    private readonly livestockBreedService: LivestockBreedService,
    private readonly livestockClassificationService: LivestockClassificationService,
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

    this.claimsService.getOne(id).subscribe({
      next: (claims) => {
        this.claims = claims;
        // Farmer
        if (claims.farmer) {
          let farmerId: string;

          farmerId = this.getField(this.claims.farmer, '_id')
 
          this.userService.getOne(farmerId).subscribe(f => {
            this.farmerName = `${f.firstName} ${f.lastName}`;
          });
        }

        // Livestock / Animal
        if (claims.animal) {
          // then
          this.animalTag =  this.getField(claims.animal, 'tagNumber')
         
          this.photoUrls = claims?.evidencePhotos?.map(p => this.getPhotoUrl(p));
          if(claims?.evidencePhotos?.length) {
            this.claimsService.getProfilePictures(claims.evidencePhotos)
            .subscribe(urls => this.photoUrls = urls);
          }

          // this.livestockService.getOne(claims.animal).subscribe(a => {
          //   // this.animalTag = a.tagNumber;
          //   console.log('animaltag', this.animalTag)
          //   // Breed
          //   if (a.breed) {
          //     this.livestockBreedService.getOne(a.breed).subscribe(b => this.breedName = b.name);
          //   }

          //   // Species / Classification
          //   if (a.species) {
          //     this.livestockClassificationService.getOne(a.species)
          //       .subscribe(c => this.speciesName = c.name);
          //   }

          //   // Animal Photos
          //   if (a.animalPhotos?.length) {
          //     this.photoUrls = a.animalPhotos.map(p => this.getPhotoUrl(p));
          //   }
          // });
        }

        this.policy =  this.getField(claims.policy, 'policyNumber')

        // Livestock Group
        // if (claims.livestockGroup) {
        //   this.livestockGroupService.getOne(claims.livestockGroup)
        //     .subscribe(g => this.livestockGroupName = g.groupName);
        // }
      },
      error: (err) => alert(`Something went wrong: ${err}`),
    }).add(() => (this.isLoading = false));
  }

  getField(field: any, prop: string): any {
    if (field && typeof field === 'object' && prop in field) {
      return field[prop];
    } else if (typeof field === 'string') {
      return field;
    }
    return null;
  }

  openPhoto(url: string) {
    this.fullScreenPhotoUrl = url;
  }

  closePhoto() {
    this.fullScreenPhotoUrl = null;
  }

  onUpdate() {
    if (!this.claims) return;
    this.router.navigate(['/claims/update', this.claims._id]);
  }

  getPhotoUrl(filename: string) {
    return `/uploads/claims/${filename}`; // adjust according to backend path
  }

  toReview() {
    if (this.claims?._id) {
      this.processStatus(this.claims._id, 'pending', 'Successfully Submitted for Review')
    }
  }

  onApprove() {
    if (this.claims?._id) {
      this.processStatus(this.claims._id, 'approved')
    }
  }

  onReject() {
    if (this.claims?._id) {
      this.processStatus(this.claims._id, 'rejected')
    }
  }

  processStatus(claimsId: string, statusValue: string, customMessage?: string) {
    this.claimsService.updateStatus(claimsId, {status: statusValue})
      .subscribe({
        next: (res) => {
          if(customMessage) {
            alert(customMessage)
          } else {
            alert(`Claim Successfully ${statusValue}`)
          }
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/claims/details', this.claims!._id]);
          });
        },
        error: (err) => {
          console.error('Error updating status:', err);
        }
      });
  }
}
