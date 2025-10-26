import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InsurancePolicyService } from '../../_shared/service/insurance-policy-service';
import { UserService } from '../../_shared/service/user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { InsurancePolicy } from '../../_shared/model/insurance-policy';
import { UserDto } from '../../_shared/model/user-dto';
import { LivestockGroup } from '../../_shared/model/livestock-group';
import { AuthService } from '../../_shared/service/auth-service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-insurance-policy-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './insurance-policy-details.html',
  styleUrls: ['./insurance-policy-details.css']
})
export class InsurancePolicyDetails implements OnInit {
  isLoading = false;
  insurancePolicy?: InsurancePolicy;
  farmerName = '';
  farmer: UserDto | undefined;
  livestockGroup: LivestockGroup | undefined;
  photoUrls: string = ''; // <-- store converted URLs here
  policyDocumentUrl: string | null = null;
  user: UserDto | null = null; 

  constructor(
    private readonly insurancePolicyService: InsurancePolicyService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
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

    this.insurancePolicyService.getOne(id).subscribe({
      next: (insurancePolicy) => {
        this.insurancePolicy = insurancePolicy;

        // Load photo URLs
        if (insurancePolicy.policyDocument) {
          this.insurancePolicyService.getPolicyDocument(insurancePolicy.policyDocument)
            .subscribe(url => {
              this.policyDocumentUrl = url
          });
        }

        if (insurancePolicy.farmer && typeof insurancePolicy.farmer !== 'string') {
          this.farmer = insurancePolicy.farmer as UserDto;
        }

        if (insurancePolicy.livestockGroup && typeof insurancePolicy.livestockGroup !== 'string') {
          this.livestockGroup = insurancePolicy.livestockGroup as LivestockGroup;
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

  isImageFile(filename: string | undefined): boolean {
    return !!filename && /\.(jpg|jpeg|png)$/i.test(filename);
  }

  openDocument(url: string | null) {
    if (url) window.open(url, '_blank');
  }

  onUpdate() {
    if (!this.insurancePolicy) return;
    this.router.navigate(['/insurance-policy/update', this.insurancePolicy._id]);
  }

  getPhotoUrl(filename: string) {
    return `/uploads/insurance-policy/${filename}`; // adjust according to your backend storage path
  }

  onApprove() {
    const status = {
      status: "approved"
    }
      if (this.insurancePolicy?._id) {
        this.insurancePolicyService.updateStatus(this.insurancePolicy._id, status)
          .subscribe({
            next: (res) => {
              alert('Successfully Approved')
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate(['/insurance-policy/details', this.insurancePolicy!._id]);
              });
            },
            error: (err) => {
              console.error('Error updating status:', err);
            }
          });
      }
  }

  onReject() {
    // TODO: Add logic to approve the policy
    const status = {
      status: "rejected"
    }
    if (this.insurancePolicy?._id) {
      this.insurancePolicyService.updateStatus(this.insurancePolicy._id, status)
        .subscribe({
          next: (res) => {
            alert('Successfully Rejected')
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/insurance-policy/details', this.insurancePolicy!._id]);
            });
          },
          error: (err) => {
            console.error('Error updating status:', err);
          }
        });
    }
  }
}
