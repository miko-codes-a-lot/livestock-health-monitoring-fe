import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Livestock } from '../../_shared/model/livestock';
import { RxLivestockForm } from './rx-livestock-form';
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
import { LivestockClassificationService } from '../../_shared/service/livestock-classification-service';
import { LivestockBreedService } from '../../_shared/service/livestock-breed-service';
import { UserDto } from '../../_shared/model/user-dto';
import { AuthService } from '../../_shared/service/auth-service';

@Component({
  selector: 'app-livestock-form',
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
  templateUrl: './livestock-form.html',
  styleUrls: ['./livestock-form.css']
})
export class LivestockForm implements OnInit {
  @Input() isLoading = false;
  private _initDoc!: Livestock;

  @Output() onSubmitEvent = new EventEmitter<{ livestockData: Livestock; files: File[] }>();

  selectedFiles: File[] = [];
  existingPhotos: string[] = [];
  previewPhotos: string[] = [];
  avatarUrl: string[] = [];
  user: UserDto | null = null; 

  @Input()
  set initDoc(value: Livestock) {
    this._initDoc = value;
    if (this.rxform && value) {
      this.rxform.patchValue(value);
      this.onSpeciesChange(value.species);
      this.existingPhotos = value.animalPhotos || [];

      if (this.existingPhotos.length > 0) {
        this.livestockService.getProfilePictures(this.existingPhotos)
          .subscribe(urls => this.previewPhotos = urls);
      }
    }
  }

  get initDoc() {
    return this._initDoc;
  }

  rxform!: FormGroup<RxLivestockForm>;
  livestockGroups: LivestockGroup[] = [];
  farmers: { id: string; name: string }[] = [];

  speciesOptions: { _id: string; name: string }[] = [];
  filteredBreeds: { _id: string; name: string }[] = [];
  filteredGroups: { _id: string; groupName: string }[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly livestockGroupService: LivestockGroupService,
    private readonly livestockService: LivestockService,
    private readonly livestockClassificationService: LivestockClassificationService,
    private readonly livestockBreedService: LivestockBreedService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadFarmers();
    // this.loadLivestockGroups();
    this.loadClassifications();

    this.authService.currentUser$.subscribe({
      next: (u) => {
        if (u) {
          this.user = u
        }
      }
    })


    if (this.initDoc) {
      this.rxform.patchValue(this.initDoc);
      this.onSpeciesChange(this.initDoc.species);
    }
  }

  private initializeForm(): void {
    const l: Livestock = this.initDoc ?? {
      tagNumber: '',
      species: '',
      breed: '',
      sex: 'male',
      age: 0,
      dateOfPurchase: '',
      isDeceased: false,
      isInsured: false,
      livestockGroup: '',
      farmer: '',
      status: 'draft',
      animalPhotos: []
    };

    this.rxform = this.fb.nonNullable.group({
      tagNumber: [l.tagNumber, Validators.required],
      species: [l.species, Validators.required],
      breed: [l.breed, Validators.required],
      sex: [l.sex, Validators.required],
      age: [l.age, [Validators.required, Validators.min(0)]],
      dateOfPurchase: ['2026-10-30', Validators.required],
      isDeceased: [l.isDeceased],
      isInsured: [l.isInsured],
      livestockGroup: [l.livestockGroup, Validators.required],
      farmer: [l.farmer || '', Validators.required],
      status: [l.status],
      animalPhotos: [l.animalPhotos || []]
    });

    this.rxform.get('species')?.valueChanges.subscribe(value => {
      this.onSpeciesChange(value);
    });

    this.rxform.get('farmer')?.valueChanges.subscribe(value => {
      this.onFarmerChange(value);
    });
  }

  private loadFarmers(): void {
    this.userService.getAll().subscribe(users => {
      // this.farmers = users
      //   .filter(u => u.role === 'farmer' && u._id)
      //   .map(u => ({ id: u._id!, name: `${u.firstName} ${u.lastName}` }));

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

  // private loadLivestockGroups(): void {
  //   this.livestockGroupService.getAll().subscribe(groups => {
  //     this.livestockGroups = groups;
  //   });
  // }

  private loadClassifications(): void {
    this.livestockClassificationService.getAll().subscribe(classifications => {
      this.speciesOptions = classifications.map((c: any) => ({
        _id: c._id,
        name: c.name
      }));
    });
  }

  onSpeciesChange(speciesId: string) {
    if (!speciesId) {
      this.filteredBreeds = [];
      return;
    }

    // Fetch breeds belonging to selected classification
    this.livestockBreedService.getAll().subscribe(breeds => {
      this.filteredBreeds = breeds
        .filter((b: any) => b.classification?._id === speciesId)
        .map((b: any) => ({ _id: b._id, name: b.name }));

      const currentBreed = this.rxform.get('breed')?.value;
      if (!this.filteredBreeds.find(b => b._id === currentBreed)) {
        this.rxform.get('breed')?.patchValue('');
      }
    });
  }

  onFarmerChange(farmerId: string) {
    if (!farmerId) {
      this.filteredGroups = [];
      return;
    }
    
    this.livestockGroupService.getAll().subscribe(groups => {
      this.filteredGroups = groups
        .filter((b: any) => b.farmer?._id === farmerId)
        .map((b: any) => ({
            _id: b._id,
            groupName: b.groupName 
        }));
      
      this.rxform.get('livestockGroup')?.value;
      // if (!this.filteredGroups.find(b => b._id === currentGroup)) {
      //     this.rxform.get('livestockGroup')?.patchValue('' as any);
      // }
    });
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files);
      this.previewPhotos = this.selectedFiles.map(file => URL.createObjectURL(file));
    }
  }

  loadProfilePicture(userId: string) {
    this.livestockService.getProfilePicture(userId).subscribe({
      next: (url) => this.avatarUrl.push(url),
      error: () => this.avatarUrl = []
    });
  }

  onSubmit() {
    if (this.rxform.invalid) return;
    const livestockData: Livestock = this.rxform.value as Livestock;
    this.onSubmitEvent.emit({ livestockData, files: this.selectedFiles });
  }

  // --- Getters ---
  get tagNumber() { return this.rxform.controls.tagNumber; }
  get species() { return this.rxform.controls.species; }
  get breed() { return this.rxform.controls.breed; }
  get sex() { return this.rxform.controls.sex; }
  get age() { return this.rxform.controls.age; }
  get dateOfPurchase() { return this.rxform.controls.dateOfPurchase; }
  get isDeceased() { return this.rxform.controls.isDeceased; }
  get isInsured() { return this.rxform.controls.isInsured; }
  get livestockGroup() { return this.rxform.controls.livestockGroup; }
  get farmer() { return this.rxform.controls.farmer; }
  get status() { return this.rxform.controls.status; }
  get animalPhotos() { return this.rxform.controls.animalPhotos; }
}
