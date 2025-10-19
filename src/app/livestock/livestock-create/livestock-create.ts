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

  onSubmit(livestock: Livestock) {
    this.livestockService.create(livestock).subscribe({
      next: data => this.router.navigate(['/livestock/details', data._id], { replaceUrl: true }),
      error: err => console.log(`Something went wrong: ${err}`)
    })
  }

}
