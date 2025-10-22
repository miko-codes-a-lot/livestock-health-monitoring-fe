import { Component, OnInit } from '@angular/core';
import { LivestockBreedForm } from '../livestock-breed-form/livestock-breed-form';
import { LivestockBreed } from '../../_shared/model/livestock-breed';
import { LivestockBreedService } from '../../_shared/service/livestock-breed-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-livestock-breed-update',
  standalone: true,
  imports: [LivestockBreedForm],
  templateUrl: './livestock-breed-update.html',
  styleUrls: ['./livestock-breed-update.css']
})
export class LivestockBreedUpdate implements OnInit {
  isLoading = false;
  id!: string;
  initDoc!: LivestockBreed;

  constructor(
    private readonly livestockBreedService: LivestockBreedService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.initDoc = this.livestockBreedService.getEmptyOrNullDoc();
    this.id = this.route.snapshot.params['id'];

    this.livestockBreedService.getOne(this.id).subscribe({
      next: (doc) => {
        console.log('doc', doc)
        this.initDoc = doc;
        // patch form after fetch
      },
      error: (e) => alert(`Something went wrong: ${e}`)
    }).add(() => this.isLoading = false);
  }

  onSubmit(payload: { livestockBreedData: LivestockBreed}) {
    const { livestockBreedData } = payload;
    const livestockBreedId = this.id;

    this.isLoading = true;

    this.livestockBreedService.update(livestockBreedId, livestockBreedData)
      .subscribe({
        next: () => {
          alert('Livestock updated successfully!');
          this.router.navigate(['/livestock-breed/details', livestockBreedId], { replaceUrl: true });
        },
        error: (err) => {
          console.error('Update failed', err);
          alert(`Update failed: ${err.message || err}`);
        },
        complete: () => this.isLoading = false
      });
  }

}
