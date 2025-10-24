import { Component, Input } from '@angular/core';
import { LivestockGroupForm } from '../livestock-group-form/livestock-group-form';
import { LivestockGroupService } from '../../_shared/service/livestock-group-service';
import { LivestockGroup } from '../../_shared/model/livestock-group';
import { Router } from '@angular/router';

@Component({
  selector: 'app-livestock-create',
  standalone: true,
  imports: [LivestockGroupForm],
  templateUrl: './livestock-group-create.html',
  styleUrl: './livestock-group-create.css'
})
export class LivestockGroupCreate {
  isLoading = false
  @Input() initDoc!: LivestockGroup


  constructor(
    private readonly livestockGroupService: LivestockGroupService,
    private readonly router: Router,
  ) {}


  ngOnInit(): void {
    this.initDoc = this.livestockGroupService.getEmptyOrNullDoc()

  }

  onSubmit(payload: { livestockGroupData: LivestockGroup; files: File[] }) {
    const { livestockGroupData, files } = payload;
    this.isLoading = true;
    // Step 1: create livestock
    this.livestockGroupService.create(livestockGroupData).subscribe({
      next: (data) => {

        const livestockGroupId = data._id;

        if (files && files.length > 0) {
          // Step 2: upload photos
          this.livestockGroupService.uploadGroupPhotos(livestockGroupId, files).subscribe({
            next: () => {
              this.isLoading = false;
              this.router.navigate(['/livestock-group/details', livestockGroupId], { replaceUrl: true });
            },
            error: (err) => {
              this.isLoading = false;
              console.error('Photo upload failed', err);
            },
          });
        } else {
          this.isLoading = false;
          this.router.navigate(['/livestock-group/details', livestockGroupId], { replaceUrl: true });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Livestock creation failed', err);
      },
    });
  }


}
