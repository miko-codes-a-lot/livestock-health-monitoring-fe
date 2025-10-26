import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Claims } from '../../_shared/model/claims';
import { RxClaimsForm } from './rx-claims-form';
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
import { MortalityCauseService } from '../../_shared/service/mortality-cause-service';
import { MortalityCause } from '../../_shared/model/mortality-cause';
import { InsurancePolicyService } from '../../_shared/service/insurance-policy-service';
import { UserDto } from '../../_shared/model/user-dto';
import { AuthService } from '../../_shared/service/auth-service';


@Component({
  selector: 'app-claims-form',
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
  templateUrl: './claims-form.html',
  styleUrls: ['./claims-form.css']
})
export class ClaimsForm implements OnInit {
  @Input() isLoading = false;
  private _initDoc!: Claims;

  @Output() onSubmitEvent = new EventEmitter<{ claimsData: Claims; files: File[] }>();

  selectedFiles: File[] = [];
  existingPhotos: string[] = [];
  previewPhotos: string[] = [];
  avatarUrl: string[] = [];
  user: UserDto | null = null;
  filteredGroups: { _id: string; groupName: string }[] = [];

  @Input()
  set initDoc(value: Claims) {
    this._initDoc = value;
    if (this.rxform && value) {
      this.tryPatchForm();
    }
  }

  get initDoc() {
    return this._initDoc;
  }

  rxform!: FormGroup<RxClaimsForm>;
  // livestockGroups: LivestockGroup[] = [];
  farmers: { id: string; name: string }[] = [];
  speciesOptions: { _id: string; name: string }[] = [];
  filteredBreeds: { _id: string; name: string }[] = [];
  mortalityCauses: MortalityCause[] = [];
  deathCategory: { label: string; value: string }[] = [];
  causeOfDeathItems: { label: string; value: string }[] = [];
  selectedCategoryValue: string | null = null;
  selectPolicy: { id: string; display: string }[] = [];
  animals: any[] = [];
  filteredPolicies: { _id: string; name: string }[] = [];
  livestockGroups: { _id: string; groupName: string }[] = [];
  filteredAnimals: { _id: string; name: string }[] = [];

  l: Claims = this.initDoc ?? {
    animal: '',
    causeOfDeath: '',
    causeOfDeathCategory: '',
    dateOfDeath: '',
    evidencePhotos: [],
    farmer: '',
    filedAt: '',
    policy: '',
    status: 'draft' as 'draft' | 'approved' | 'rejected' | 'pending',
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly livestockGroupService: LivestockGroupService,
    private readonly livestockService: LivestockService,
    private readonly livestockClassificationService: LivestockClassificationService,
    private readonly mortalityCauseService: MortalityCauseService,
    private readonly insurancePolicyService: InsurancePolicyService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadClassifications();
    this.loadCauseOfDeathCategory();
    // this.loadInsurancePolicy();
    this.loadLivestockGroups();
    this.loadLivestock();
    this.loadFarmers();
    this.authService.currentUser$.subscribe({
      next: (u) => {
        if (u) {
          this.user = u
        }
      }
    })
  }

  private initializeForm(): void {


    this.rxform = this.fb.nonNullable.group({
      animal: [this.l.animal, Validators.required],
      // causeOfDeath: [this.l.causeOfDeath, Validators.required],
      causeOfDeathCategory: [this.l.causeOfDeathCategory, Validators.required],
      dateOfDeath: [this.l.dateOfDeath, Validators.required],
      evidencePhotos: [this.l.evidencePhotos || []],
      farmer: [this.l.farmer, Validators.required],
      filedAt: [this.l.filedAt, Validators.required],
      policy: [this.l.policy, Validators.required],
      status: [this.l.status || 'draft'],
    });

    this.rxform.get('species')?.valueChanges.subscribe(value => {
      this.onSpeciesChange(value);
    });

    // this.rxform.get('livestockGroup')?.valueChanges.subscribe(value => {
    //   this.onLivestockGroupChange(value);
    // });
  }

  private tryPatchForm(): void {
    if (!this.initDoc) return;

    const allLoaded =
      this.animals.length > 0 &&
      this.farmers.length > 0 &&
      this.deathCategory.length > 0 &&
      this.selectPolicy.length > 0;

    if (!allLoaded) return;

    // Normalize IDs and date formats before patching
    const patchData: any = { ...this.initDoc };

    // Farmer
    if (this.initDoc.farmer && typeof this.initDoc.farmer === 'object' && '_id' in this.initDoc.farmer) {
      patchData.farmer = (this.initDoc.farmer as { _id: string })._id;
    } else {
      patchData.farmer = this.initDoc.farmer as string;
      this.loadFarmers()
    }

    // Animal
    if (this.initDoc.animal && typeof this.initDoc.animal === 'object' && '_id' in this.initDoc.animal) {
      patchData.animal = (this.initDoc.animal as { _id: string })._id;
    } else {
      patchData.animal = this.initDoc.animal as string;
    }

    // Policy
    if (this.initDoc.policy && typeof this.initDoc.policy === 'object' && '_id' in this.initDoc.policy) {
      patchData.policy = (this.initDoc.policy as { _id: string })._id;
    } else {
      patchData.policy = this.initDoc.policy as string;
    }

    // Format dates (if they're objects or ISO strings)
    if (this.initDoc.dateOfDeath) {
      patchData.dateOfDeath = new Date(this.initDoc.dateOfDeath).toISOString().split('T')[0];
    }

    if (this.initDoc.filedAt) {
      patchData.filedAt = new Date(this.initDoc.filedAt).toISOString().split('T')[0];
    }

    this.rxform.patchValue(patchData);

    // Populate cause of death category items if applicable
    if (this.initDoc.causeOfDeathCategory) {
      this.onCategoryChange(this.initDoc.causeOfDeathCategory);
    }

    //on update
    if (this.initDoc.causeOfDeath) {
      this.rxform.controls.causeOfDeath?.setValue(this.initDoc.causeOfDeath);
    }

    // Show existing uploaded photos
    if (this.initDoc.evidencePhotos?.length) {
      this.existingPhotos = this.initDoc.evidencePhotos;
      this.previewPhotos = [...this.existingPhotos];
    }
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
      }
      // else {
      //   // Admin or other roles: show all farmers
      //   this.farmers = users
      //     .filter(u => u.role === 'farmer')
      //     .map(u => ({ id: u._id!, name: `${u.firstName} ${u.lastName}` }));
      // }
    });
  }

  private loadCauseOfDeathCategory(): void {
    this.mortalityCauseService.getAll().subscribe(mortalityCauses => {
      this.mortalityCauses = mortalityCauses;
      this.deathCategory = mortalityCauses.map(c => ({
        label: c.items[c.items.length - 1]?.label || c.value,
        value: c.value
      }));
      this.tryPatchForm();
    });
  }


  

  private loadLivestock(): void {
    this.livestockService.getAll().subscribe(livestock => {
      this.animals = livestock;
      this.tryPatchForm();
    });
  }

  private loadLivestockGroups(): void {
    this.livestockGroupService.getAll().subscribe(groups => {
      this.livestockGroups = groups
      .filter((l: any) => l.farmer._id === this.user?._id)
        .map((l: any) => ({
            _id: l._id,
            groupName: l.groupName
        }));
    });
  }

  
  onLivestockGroupChange(livestockGroupId: string) {
    if (!livestockGroupId) {
      this.filteredAnimals = [];
      this.selectPolicy = [];
      return;
    }

    // this is what I need
    this.livestockService.getAll().subscribe(livestocks => {
      this.filteredAnimals = livestocks
        .filter((l: any) => l.livestockGroup === livestockGroupId)
        .map((l: any) => ({
            _id: l._id,
            name: `${l.tagNumber} - ${l.breed.name} ${l.species.name}` 
        }));


      const currentAnimal = this.rxform.get('animal')?.value;
      if (!this.filteredAnimals.find(b => b._id === currentAnimal)) {
          this.rxform.get('animal')?.patchValue('');
      }

      this.loadInsurancePolicy(livestockGroupId, this.user?._id)

    });
    
  }

  // this is what i need
  private loadInsurancePolicy(groupId: string, farmerId: any): void {

    this.insurancePolicyService.getAll().subscribe(policies => {
      console.log('policies', policies)
      this.selectPolicy = policies
      .filter((p: any) => p.livestockGroup._id === groupId && p.farmer._id === farmerId)
      .map(p => ({
        id: p._id!,
        display: `${p.policyNumber} - ${p.provider}`
      }));
      console.log('this.selectPolicy', this.selectPolicy)
      this.tryPatchForm();
    });

  }

  private loadClassifications(): void {
    this.livestockClassificationService.getAll().subscribe(classifications => {
      this.speciesOptions = classifications.map((c: any) => ({
        _id: c._id,
        name: c.name
      }));
    });
  }

  onCategoryChange(selectedValue: string) {
    this.selectedCategoryValue = selectedValue;
    const selectedCause = this.mortalityCauses.find(c => c.value === selectedValue);
    this.causeOfDeathItems = selectedCause ? selectedCause.items : [];

    const hasCauses = this.causeOfDeathItems.length > 0;
    console.log('this.causeOfDeathItems', this.causeOfDeathItems)
    // If the selected category has cause-of-death items, add the control
    if (hasCauses) {
      if (!this.rxform.get('causeOfDeath')) {
        (this.rxform as FormGroup<any>).addControl(
          'causeOfDeath',
          this.fb.control(this.l.causeOfDeath || '', Validators.required)
        );
      }
    } 
    // Otherwise, remove it if it exists
    else {
      if (this.rxform.get('causeOfDeath')) {
        this.rxform.removeControl('causeOfDeath');
      }
    }
  }

  onSpeciesChange(speciesId: string) {
    if (!speciesId) {
      this.filteredBreeds = [];
      return;
    }
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
    const claimsData: Claims = this.rxform.value as Claims;
    this.onSubmitEvent.emit({ claimsData, files: this.selectedFiles });
  }

  // --- Getters ---
  get animal() { return this.rxform.controls.animal; }
  get causeOfDeath() { return this.rxform.controls.causeOfDeath; }
  get causeOfDeathCategory() { return this.rxform.controls.causeOfDeathCategory; }
  get dateOfDeath() { return this.rxform.controls.dateOfDeath; }
  get evidencePhotos() { return this.rxform.controls.evidencePhotos; }
  get farmer() { return this.rxform.controls.farmer; }
  get filedAt() { return this.rxform.controls.filedAt; }
  get policy() { return this.rxform.controls.policy; }
  get status() { return this.rxform.controls.status; }
}
