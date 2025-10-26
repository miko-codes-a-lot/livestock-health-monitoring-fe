import { Component, Input } from '@angular/core';
import { InsurancePolicyForm } from '../insurance-policy-form/insurance-policy-form';
import { InsurancePolicyService } from '../../_shared/service/insurance-policy-service';
import { InsurancePolicy } from '../../_shared/model/insurance-policy';
import { Router } from '@angular/router';

@Component({
  selector: 'app-insurance-policy-create',
  standalone: true,
  imports: [InsurancePolicyForm],
  templateUrl: './insurance-policy-create.html',
  styleUrl: './insurance-policy-create.css'
})
export class InsurancePolicyCreate {
  isLoading = false
  @Input() initDoc!: InsurancePolicy

  constructor(
    private readonly insurancePolicyService: InsurancePolicyService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.initDoc = this.insurancePolicyService.getEmptyOrNullDoc()

  }

  onSubmit(payload: { insurancePolicyData: InsurancePolicy; file: File | null }) {
    const { insurancePolicyData, file } = payload;
    this.isLoading = true;
    // insurancePolicyData.status = 'pending'
    // Step 1: create insurance policy
    this.insurancePolicyService.create(insurancePolicyData).subscribe({
      next: (data) => {
        const policyId = data._id;
     
        // Step 2: upload file if selected
        if (file) {
          this.insurancePolicyService.uploadPolicyDocument(policyId, file).subscribe({
            next: () => {
              this.isLoading = false;
              this.router.navigate(['/insurance-policy/details', policyId], { replaceUrl: true });
            },
            error: (err) => {
              this.isLoading = false;
              console.error('File upload failed', err);
            },
          });
        } else {
          this.isLoading = false;
          this.router.navigate(['/insurance-policy/details', policyId], { replaceUrl: true });
        }
      },
      error: (err) => {
        this.isLoading = false;
        alert('Policy number is already in use')
        console.error('Insurance policy creation failed', err);
      },
    });
  }



}
