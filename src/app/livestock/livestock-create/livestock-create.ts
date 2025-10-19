import { Component, Input } from '@angular/core';
import { LivestockForm } from '../livestock-form/livestock-form';
import { LivestockService } from '../../_shared/service/livestock-service';
import { Livestock } from '../../_shared/model/livestock';
import { Router } from '@angular/router';

@Component({
  selector: 'app-livestock-create',
  standalone: true,
  imports: [LivestockForm],
  templateUrl: './livestock-create.html',
  styleUrl: './livestock-create.css'
})
export class LivestockCreate {
  isLoading = false
  @Input() initDoc!: Livestock


  constructor(
    private readonly livestockService: LivestockService,
    private readonly router: Router,
  ) {}


  ngOnInit(): void {
    this.initDoc = this.livestockService.getEmptyOrNullDoc()

  }

  onSubmit(payload: { livestockData: Livestock; files: File[] }) {
    const { livestockData, files } = payload;
    this.isLoading = true;
    // Step 1: create livestock
    this.livestockService.create(livestockData).subscribe({
      next: (data) => {

        const livestockId = data._id;

        if (files && files.length > 0) {
          // Step 2: upload photos
          this.livestockService.uploadPhotos(livestockId, files).subscribe({
            next: () => {
              this.isLoading = false;
              this.router.navigate(['/livestock/details', livestockId], { replaceUrl: true });
            },
            error: (err) => {
              this.isLoading = false;
              console.error('Photo upload failed', err);
            },
          });
        } else {
          this.isLoading = false;
          this.router.navigate(['/livestock/details', livestockId], { replaceUrl: true });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Livestock creation failed', err);
      },
    });
  }


}
