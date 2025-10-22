import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LivestockBreedService } from '../../_shared/service/livestock-breed-service';
import { ActivatedRoute, Router } from '@angular/router';
import { LivestockBreed } from '../../_shared/model/livestock-breed';

@Component({
  selector: 'app-livestock-breed-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './livestock-breed-details.html',
  styleUrls: ['./livestock-breed-details.css']
})
export class LivestockBreedDetails implements OnInit {
  isLoading = false;
  livestockBreed?: LivestockBreed;

  constructor(
    private readonly livestockBreedService: LivestockBreedService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  
  get classificationName(): string {
    const c = this.livestockBreed?.classification;
    if (!c) return '—';
    return typeof c === 'object' ? c.name : c;
  }

  ngOnInit(): void {
    this.isLoading = true;
    console.log('test123');
    const id = this.route.snapshot.params['id'];
    console.log('id dawd', id)
    this.livestockBreedService.getOne(id).subscribe({
      next: (livestockBreed) => {
        this.livestockBreed = livestockBreed;
        console.log('livestockBreed', livestockBreed);
      },
      error: (err) => alert(`Something went wrong: ${err}`),
    }).add(() => (this.isLoading = false));
  }

  onUpdate() {
    if (!this.livestockBreed) return;
    this.router.navigate(['/livestock-breed/update', this.livestockBreed._id]);
  }

}
