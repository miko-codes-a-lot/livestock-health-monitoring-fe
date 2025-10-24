import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Livestock } from '../../_shared/model/livestock';
import { RxLivestockGroupForm } from './rx-livestock-group-form';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserService } from '../../_shared/service/user-service';
import { LivestockGroupService } from '../../_shared/service/livestock-group-service';
import { LivestockService } from '../../_shared/service/livestock-service';
import { LivestockGroup } from '../../_shared/model/livestock-group';
import { AuthService } from '../../_shared/service/auth-service';
import { UserDto } from '../../_shared/model/user-dto';

@Component({
  selector: 'app-livestock-group-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule
  ],
  templateUrl: './livestock-group-form.html',
  styleUrls: ['./livestock-group-form.css']
})
export class LivestockGroupForm implements OnInit {
  @Input() isLoading = false;
  // @Input() initDoc!: Livestock;
  private _initDoc!: LivestockGroup;
  @Output() onSubmitEvent = new EventEmitter<{ livestockGroupData: LivestockGroup; files: File[] }>();
  selectedFiles: File[] = [];

  existingPhotos: string[] = [];
  previewPhotos: string[] = [];
  avatarUrl: string[] = [];
  user: UserDto | null = null; 

  @Input()
  set initDoc(value: LivestockGroup) {
    this._initDoc = value;
    if (this.rxform && value) {
      this.rxform.patchValue(value);
      // load existing photos
      this.existingPhotos = value.groupPhotos || [];

      if (this.existingPhotos.length > 0) {
        this.livestockGroupService.getGroupPhotos(this.existingPhotos)
          .subscribe(urls => {
            this.previewPhotos = urls; 
          });
      }

    }
  }

  get initDoc() {
    return this._initDoc;
  }

  rxform!: FormGroup<RxLivestockGroupForm>;
  livestockGroups: LivestockGroup[] = [];
  farmers: { id: string; name: string }[] = [];
  filteredBreeds: { value: string; label: string }[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly livestockGroupService: LivestockGroupService,
    private readonly livestockService: LivestockService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadFarmers();
    this.loadLivestockGroups();
    this.authService.currentUser$.subscribe({
      next: (u) => {
        if (u) {
          this.user = u
        }
      }
    })
    // patch form if initDoc is already set
    if (this.initDoc) {
      // initialize here
      // this.loadProfilePicture(user._id);
      this.rxform.patchValue(this.initDoc);
    }
  }

  private initializeForm(): void {
    const l: LivestockGroup = this.initDoc ?? {
      groupName: '',
      farmer: '',
      groupPhotos: [],
      status: 'pending',
    };

    this.rxform = this.fb.nonNullable.group({
      groupName: [l.groupName, Validators.required],
      farmer: [l.farmer, Validators.required],
      groupPhotos: [l.groupPhotos || []],
      status: [l.status as 'pending' | 'approved' | 'rejected'],
    });

  }

  private loadFarmers(): void {
    this.userService.getAll().subscribe(users => {
      if (this.user?.role === 'farmer') {
        // Only include the logged-in farmer
        this.farmers = users
          .filter(u => u._id === this.user?._id)
          .map(u => ({ id: u._id!, name: `${u.firstName} ${u.lastName}` }));
        
        // Auto-select themselves
        this.rxform.patchValue({ farmer: this.user._id });
      } else {
        // Admin or other roles: show all farmers
        this.farmers = users
          .filter(u => u.role === 'farmer')
          .map(u => ({ id: u._id!, name: `${u.firstName} ${u.lastName}` }));
      }
    });
  }

  private loadLivestockGroups(): void {
    this.livestockGroupService.getAll().subscribe(groups => {
      this.livestockGroups = groups;
    });
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files);
      // this.rxform.get('animalPhotos')?.markAsTouched();

      this.previewPhotos = this.selectedFiles.map(file => URL.createObjectURL(file));
    }
  }

  loadProfilePicture(userId: string) {
    // how to pass the data of the animalPhotos here?
    this.livestockService.getProfilePicture(userId).subscribe({
      next: (url) => this.avatarUrl.push(url),
      error: () => this.avatarUrl = []
    });
  }

  onSubmit() {
    if (this.rxform.invalid) return;
    const livestockGroupData: LivestockGroup = this.rxform.value as LivestockGroup;
    this.onSubmitEvent.emit({livestockGroupData, files: this.selectedFiles});
  }

  

  // --- Getters ---
  get groupName() { return this.rxform.controls.groupName; }
  get farmer() { return this.rxform.controls.farmer; }
  get status() { return this.rxform.controls.status; }
  get groupPhotos() { return this.rxform.controls.groupPhotos; }

}
