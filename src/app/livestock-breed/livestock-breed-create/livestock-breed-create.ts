import { Component, Input } from '@angular/core';
import { LivestockBreedForm } from '../livestock-breed-form/livestock-breed-form';
import { LivestockBreedService } from '../../_shared/service/livestock-breed-service';
import { LivestockBreed } from '../../_shared/model/livestock-breed';
import { Router } from '@angular/router';

@Component({
  selector: 'app-livestock-breed-create',
  standalone: true,
  imports: [LivestockBreedForm],
  templateUrl: './livestock-breed-create.html',
  styleUrls: ['./livestock-breed-create.css']
})
export class LivestockBreedCreate {
  isLoading = false
  @Input() initDoc!: LivestockBreed


  constructor(
    private readonly livestockBreedService: LivestockBreedService,
    private readonly router: Router,
  ) {}


  ngOnInit(): void {
    this.initDoc = this.livestockBreedService.getEmptyOrNullDoc()
  }

  onSubmit(payload: { livestockBreedData: LivestockBreed }) {
    const { livestockBreedData } = payload;
    this.isLoading = true;
    // Step 1: create livestock
    this.livestockBreedService.create(livestockBreedData).subscribe({
      next: (data) => {

        const livestockBreedId = data._id;

        this.router.navigate(['/livestock-breed/details', livestockBreedId], { replaceUrl: true });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Livestock creation failed', err);
      },
    });
  }


}
