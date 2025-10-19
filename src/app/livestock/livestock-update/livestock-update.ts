import { Component, OnInit } from '@angular/core';
import { LivestockForm } from '../livestock-form/livestock-form';
import { Livestock } from '../../_shared/model/livestock';
import { LivestockService } from '../../_shared/service/livestock-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-livestock-update',
  standalone: true,
  imports: [LivestockForm],
  templateUrl: './livestock-update.html',
  styleUrls: ['./livestock-update.css']
})
export class LivestockUpdate implements OnInit {
  isLoading = false;
  id!: string;
  initDoc!: Livestock;

  constructor(
    private readonly livestockService: LivestockService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.initDoc = this.livestockService.getEmptyOrNullDoc();
    this.id = this.route.snapshot.params['id'];

    this.livestockService.getOne(this.id).subscribe({
      next: (doc) => {
        console.log('doc', doc)
        this.initDoc = doc;
        // patch form after fetch
      },
      error: (e) => alert(`Something went wrong: ${e}`)
    }).add(() => this.isLoading = false);
  }

  onSubmit(updatedLivestock: Livestock) {
    this.isLoading = true;
    this.livestockService.update(this.id, updatedLivestock).subscribe({
      next: () => {
        alert('Livestock updated successfully!');
        this.router.navigate(['/livestock/list']);
      },
      error: (e) => alert(`Update failed: ${e}`)
    }).add(() => this.isLoading = false);
  }
}
