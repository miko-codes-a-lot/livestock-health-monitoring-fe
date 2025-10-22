import { Component, Input } from '@angular/core';
import { LivestockClassificationForm } from '../livestock-classification-form/livestock-classification-form';
import { LivestockClassificationService } from '../../_shared/service/livestock-classification-service';
import { LivestockClassification } from '../../_shared/model/livestock-classification';
import { Router } from '@angular/router';

@Component({
  selector: 'app-livestock-create',
  standalone: true,
  imports: [LivestockClassificationForm],
  templateUrl: './livestock-classification-create.html',
  styleUrls: ['./livestock-classification-create.css']
})
export class LivestockClassificationCreate {
  isLoading = false
  @Input() initDoc!: LivestockClassification


  constructor(
    private readonly livestockClassificationService: LivestockClassificationService,
    private readonly router: Router,
  ) {}


  ngOnInit(): void {
    this.initDoc = this.livestockClassificationService.getEmptyOrNullDoc()
  }

  onSubmit(payload: { livestockClassificationData: LivestockClassification }) {
    const { livestockClassificationData } = payload;
    this.isLoading = true;
    // Step 1: create livestock
    this.livestockClassificationService.create(livestockClassificationData).subscribe({
      next: (data) => {
        const livestockClassificationId = data._id;
     
        this.isLoading = false;
        this.router.navigate(['/livestock-classification/details', livestockClassificationId], { replaceUrl: true });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Livestock creation failed', err);
      },
    });
  }


}
