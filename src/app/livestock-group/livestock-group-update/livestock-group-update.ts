import { Component, OnInit } from '@angular/core';
import { LivestockGroupForm } from '../livestock-group-form/livestock-group-form';
import { LivestockGroup } from '../../_shared/model/livestock-group';
import { LivestockGroupService } from '../../_shared/service/livestock-group-service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-livestock-group-update',
  standalone: true,
  imports: [LivestockGroupForm],
  templateUrl: './livestock-group-update.html',
  styleUrls: ['./livestock-group-update.css']
})
export class LivestockGroupUpdate implements OnInit {
  isLoading = false;
  id!: string;
  initDoc!: LivestockGroup;

  constructor(
    private readonly livestockService: LivestockGroupService,
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

  onSubmit(payload: { livestockGroupData: LivestockGroup; files: File[] }) {
    const { livestockGroupData, files } = payload;
    const livestockGroupId = this.id;

    this.isLoading = true;

    this.livestockService.update(livestockGroupId, livestockGroupData)
      .pipe(
        concatMap(() => {
          if (files && files.length > 0) {
            return this.livestockService.uploadGroupPhotos(livestockGroupId, files);
          }
          return of(null); // no files to upload
        })
      )
      .subscribe({
        next: () => {
          alert('Livestock Group updated successfully!');
          this.router.navigate(['/livestock-group/details', livestockGroupId], { replaceUrl: true });
        },
        error: (err) => {
          console.error('Update failed', err);
          alert(`Update failed: ${err.message || err}`);
        },
        complete: () => this.isLoading = false
      });
  }

}
