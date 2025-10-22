import { Component, OnInit } from '@angular/core';
import { LivestockClassificationForm } from '../livestock-classification-form/livestock-classification-form';
import { LivestockClassification } from '../../_shared/model/livestock-classification';
import { LivestockClassificationService } from '../../_shared/service/livestock-classification-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-livestock-classification-update',
  standalone: true,
  imports: [LivestockClassificationForm],
  templateUrl: './livestock-classification-update.html',
  styleUrls: ['./livestock-classification-update.css']
})
export class LivestockClassificationUpdate implements OnInit {
  isLoading = false;
  id!: string;
  initDoc!: LivestockClassification;

  constructor(
    private readonly livestockClassificationService: LivestockClassificationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.initDoc = this.livestockClassificationService.getEmptyOrNullDoc();
    this.id = this.route.snapshot.params['id'];

    this.livestockClassificationService.getOne(this.id).subscribe({
      next: (doc) => {
        this.initDoc = doc;
        // patch form after fetch
      },
      error: (e) => alert(`Something went wrong: ${e}`)
    }).add(() => this.isLoading = false);
  }

  onSubmit(payload: { livestockClassificationData: LivestockClassification }) {
    const { livestockClassificationData } = payload;
    const livestockClassificationId = this.id;

    this.isLoading = true;

    this.livestockClassificationService.update(livestockClassificationId, livestockClassificationData)
      .subscribe({
        next: () => {
          alert('Livestock updated successfully!');
          this.router.navigate(['/livestock-classification/details', livestockClassificationId], { replaceUrl: true });
        },
        error: (err) => {
          console.error('Update failed', err);
          alert(`Update failed: ${err.message || err}`);
        },
        complete: () => this.isLoading = false
      });
  }

}
