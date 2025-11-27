import { Component, OnInit } from '@angular/core';
import { ClaimsForm } from '../claims-form/claims-form';
import { Claims } from '../../_shared/model/claims';
import { ClaimsService } from '../../_shared/service/claims-service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-claims-update',
  standalone: true,
  imports: [ClaimsForm],
  templateUrl: './claims-update.html',
  styleUrls: ['./claims-update.css']
})
export class ClaimsUpdate implements OnInit {
  isLoading = false;
  id!: string;
  initDoc!: Claims;

  constructor(
    private readonly claimsService: ClaimsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.initDoc = this.claimsService.getEmptyOrNullDoc();
    this.id = this.route.snapshot.params['id'];

    this.claimsService.getOne(this.id).subscribe({
      next: (doc) => {
        this.initDoc = doc;
        // patch form after fetch
      },
      error: (e) => alert(`Something went wrong: ${e}`)
    }).add(() => this.isLoading = false);
  }

  onSubmit(payload: { claimsData: Claims; files: File[] }) {
    const { claimsData, files } = payload;
    const claimsId = this.id;

    this.isLoading = true;

    this.claimsService.update(claimsId, claimsData)
      .pipe(
        concatMap(() => {
          if (files && files.length > 0) {
            return this.claimsService.uploadPhotos(claimsId, files);
          }
          return of(null); // no files to upload
        })
      )
      .subscribe({
        next: () => {
          this.processStatus(claimsId, 'pending')
          alert('Claim updated successfully!');
          this.router.navigate(['/claims/details', claimsId], { replaceUrl: true });
        },
        error: (err) => {
          alert(err.error.message)
          console.error('Update failed', err);
          this.isLoading = false;
          // alert(`Update failed: ${err.message || err}`);
        },
        complete: () => this.isLoading = false
      });
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
            this.router.navigate(['/claims/details', claimsId]);
          });
        },
        error: (err) => {
          console.error('Error updating status:', err);
        }
      });
  }

}
