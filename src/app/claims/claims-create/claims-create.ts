import { Component, Input } from '@angular/core';
import { ClaimsForm } from '../claims-form/claims-form';
import { ClaimsService } from '../../_shared/service/claims-service';
import { Claims } from '../../_shared/model/claims';
import { Router } from '@angular/router';

@Component({
  selector: 'app-claims-create',
  standalone: true,
  imports: [ClaimsForm],
  templateUrl: './claims-create.html',
  styleUrl: './claims-create.css'
})
export class ClaimsCreate {
  isLoading = false
  @Input() initDoc!: Claims


  constructor(
    private readonly claimsService: ClaimsService,
    private readonly router: Router,
  ) {}


  ngOnInit(): void {
    this.initDoc = this.claimsService.getEmptyOrNullDoc()

  }

  onSubmit(payload: { claimsData: Claims; files: File[] }) {
    const { claimsData, files } = payload;
    this.isLoading = true;
    // Step 1: create livestock
    this.claimsService.create(claimsData).subscribe({
      next: (data) => {

        const claimsId = data._id;

        if (files && files.length > 0) {
          // Step 2: upload photos
          this.claimsService.uploadPhotos(claimsId, files).subscribe({
            next: () => {
              this.isLoading = false;
              this.router.navigate(['/claims/details', claimsId], { replaceUrl: true });
            },
            error: (err) => {
              this.isLoading = false;
              console.error('Photo upload failed', err);
            },
          });
        } else {
          this.isLoading = false;
          this.router.navigate(['/claims/details', claimsId], { replaceUrl: true });
        }
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error.message)
        console.error('Claims creation failed', err);
      },
    });
  }


}
