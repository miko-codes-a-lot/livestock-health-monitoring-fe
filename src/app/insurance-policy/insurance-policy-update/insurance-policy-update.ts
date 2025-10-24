import { Component, OnInit } from '@angular/core';
import { InsurancePolicyForm } from '../insurance-policy-form/insurance-policy-form';
import { LivestockGroup } from '../../_shared/model/livestock-group';
import { InsurancePolicy } from '../../_shared/model/insurance-policy';
import { InsurancePolicyService } from '../../_shared/service/insurance-policy-service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-insurance-policy-update',
  standalone: true,
  imports: [InsurancePolicyForm],
  templateUrl: './insurance-policy-update.html',
  styleUrls: ['./insurance-policy-update.css']
})
export class InsurancePolicyUpdate implements OnInit {
  isLoading = false;
  id!: string;
  initDoc!: InsurancePolicy;

  constructor(
    private readonly insurancePolicyService: InsurancePolicyService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.initDoc = this.insurancePolicyService.getEmptyOrNullDoc();
    this.id = this.route.snapshot.params['id'];

    this.insurancePolicyService.getOne(this.id).subscribe({
      next: (doc) => {
        console.log('doc', doc)
        this.initDoc = doc;
        // patch form after fetch
      },
      error: (e) => alert(`Something went wrong: ${e}`)
    }).add(() => this.isLoading = false);
  }

// Instead of files: File[], use single file
onSubmit(payload: { insurancePolicyData: InsurancePolicy; file: File | null }) {
  const { insurancePolicyData, file } = payload;
  const insurancePolicyId = this.id;

  this.isLoading = true;

  this.insurancePolicyService.update(insurancePolicyId, insurancePolicyData)
    .pipe(
      concatMap(() => {
        if (file) {
          // upload single file
          return this.insurancePolicyService.uploadPolicyDocument(insurancePolicyId, file);
        }
        return of(null); // no file to upload
      })
    )
    .subscribe({
      next: () => {
        alert('Insurance Policy updated successfully!');
        this.router.navigate(['/insurance/details', insurancePolicyId], { replaceUrl: true });
      },
      error: (err) => {
        console.error('Update failed', err);
        alert(`Update failed: ${err.message || err}`);
      },
      complete: () => this.isLoading = false
    });
}


}
