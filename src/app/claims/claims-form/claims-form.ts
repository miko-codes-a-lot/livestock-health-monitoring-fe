import { Component, EventEmitter, Input, Output, OnInit, ComponentFactoryResolver } from '@angular/core';
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
import { ClaimsService } from '../../_shared/service/claims-service';
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
  selectedGroup: string | null = null;

  private userLoaded = false;
  private groupsLoaded = false;

  @Input()
  set initDoc(value: Claims) {
    this._initDoc = value;
    if (this.rxform && value) {
      // here

      const animalObj = typeof value.animal === 'object' && value.animal !== null
      ? (value.animal as any)
      : null;
      if (animalObj?.livestockGroup) {
        this.selectedGroup = animalObj.livestockGroup; // auto-select in UI
        this.onLivestockGroupChange(animalObj.livestockGroup);
      }
     
      this.existingPhotos = value.evidencePhotos || [];

      if (this.existingPhotos.length > 0) {
        this.claimsService.getProfilePictures(this.existingPhotos)
          .subscribe(urls => this.previewPhotos = urls);
      }
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
  deathCategory: { label: string; _id: string }[] = [];
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
    private readonly claimsService: ClaimsService,
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
          this.tryInitializeGroupSelection();
        }
      }
    })
  }

  private readonly OTHER_CATEGORY_VALUE = 'other_specify';

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
      otherCauseOfDeath: [''],
      // livestockGroup: ['']
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
      console.log('patchData.filedAt', patchData.filedAt)
    }

    this.rxform.patchValue(patchData);

    // Populate cause of death category items if applicable
    if (this.initDoc.causeOfDeathCategory) {
        // 💡 Call onCategoryChange to ensure controls (like otherCauseOfDeath) are created/enabled
        this.onCategoryChange(this.initDoc.causeOfDeathCategory); 
    }

    // 💡 NEW LOGIC FOR HANDLING 'OTHERS, PLEASE SPECIFY' ON UPDATE
    if (this.initDoc.causeOfDeathCategory && this.initDoc.causeOfDeath) {
        const categoryId = this.initDoc.causeOfDeathCategory;
        
        // Find the selected category object using the category ID
        const selectedCategory = this.mortalityCauses.find(c => c._id === categoryId);

        // Check if the loaded category is the 'Others please specify' option
        if (selectedCategory?.label === 'Other (Please Specify)') {
            // patch the new 'otherCauseOfDeath' control with it.
            this.rxform.controls.otherCauseOfDeath?.setValue(this.initDoc.causeOfDeath);
        } else {
            // If it's a standard dropdown value, patch the causeOfDeath control (original logic)
            this.rxform.controls.causeOfDeath?.setValue(this.initDoc.causeOfDeath);
        }
    }

    // Show existing uploaded photos
    if (this.initDoc.evidencePhotos?.length) {
      this.existingPhotos = this.initDoc.evidencePhotos;
      this.claimsService.getProfilePictures(this.existingPhotos).subscribe({
        next: (urls) => {
          this.previewPhotos = urls;
        },
        error: (err) => {
          console.error('Failed to load photo previews', err);
          this.previewPhotos = [];
        }
      });
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
    // fix this use the service
    this.mortalityCauseService.getAll().subscribe(mortalityCauses => {
      this.mortalityCauses = mortalityCauses;
      console.log('this.deathCategory', mortalityCauses)
      this.deathCategory = mortalityCauses.map(c => ({
          label: c.label, 
          _id: c._id || '',
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
        .filter(
          (l: any) => l.farmer._id === this.user?._id && l.status === 'verified'
        )
        .map((l: any) => ({
          _id: l._id,
          groupName: l.groupName
        }));

      this.groupsLoaded = true;
      this.tryInitializeGroupSelection();
    });
  }

  private tryInitializeGroupSelection(): void {
    // Ensure both user and groups are loaded, and initDoc exists
    if (!this.userLoaded || !this.groupsLoaded || !this._initDoc) return;

    const animalObj = typeof this._initDoc.animal === 'object' && this._initDoc.animal !== null
      ? (this._initDoc.animal as any)
      : null;

    if (animalObj?.livestockGroup) {
      this.selectedGroup = animalObj.livestockGroup;
      this.onLivestockGroupChange(animalObj.livestockGroup);
    }
  }

  onLivestockGroupChange(livestockGroupId: string) {
    if (!livestockGroupId) {
      this.filteredAnimals = [];
      this.selectPolicy = [];
      return;
    }

    // normalize object or string
    const groupId = typeof livestockGroupId === 'object'
      ? (livestockGroupId as any)._id
      : livestockGroupId;

    this.livestockService.getAll().subscribe(livestocks => {
      this.filteredAnimals = livestocks
        .filter((l: any) => l.livestockGroup?._id === groupId || l.livestockGroup === groupId)
        .map((l: any) => ({
          _id: l._id,
          name: `${l.tagNumber} - ${l.breed.name} ${l.species.name}`
        }));

      const currentAnimal = this.rxform.get('animal')?.value;
      if (!this.filteredAnimals.find(b => b._id === currentAnimal)) {
        this.rxform.get('animal')?.patchValue('');
      }

      this.loadInsurancePolicy(groupId, this.user?._id);
    });
  }

  // this is what i need
  private loadInsurancePolicy(groupId: string, farmerId: any): void {

    this.insurancePolicyService.getAll().subscribe(policies => {
      console.log('policies', policies)
      console.log('groupId', groupId)
      console.log('farmerId', farmerId)
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

  // claims-form.ts (replace the existing onCategoryChange)

  onCategoryChange(selectedId: string) { // Renamed from selectedValue to selectedId for clarity
      this.selectedCategoryValue = selectedId;
      const selectedCategory = this.mortalityCauses.find(c => c._id === selectedId);

      if (!selectedCategory) {
          this.causeOfDeathItems = [];
          this.rxform.removeControl('causeOfDeath');
          this.rxform.get('otherCauseOfDeath')?.setValue('');
          this.rxform.get('otherCauseOfDeath')?.clearValidators();
          this.rxform.get('otherCauseOfDeath')?.disable();
          return;
      }

      const categoryLabel = selectedCategory.label;
      const hasCauses = selectedCategory.items.length > 0;
      
      // --- New "Other, Please Specify" Logic ---
      const isOtherCategory = categoryLabel === 'Other (Please Specify)';

      // 1. Handle the 'Other, please specify' field
      const otherControl = this.rxform.get('otherCauseOfDeath');
      if (isOtherCategory) {
          otherControl?.enable();
          otherControl?.setValidators(Validators.required);
          // Ensure standard causeOfDeath is removed/disabled if it exists
          if (this.rxform.get('causeOfDeath')) {
              this.rxform.removeControl('causeOfDeath');
          }
      } else {
          otherControl?.setValue('');
          otherControl?.clearValidators();
          otherControl?.disable();
      }
      otherControl?.updateValueAndValidity();


      // 2. Handle the standard 'Cause of Death' dropdown (original logic)
      this.causeOfDeathItems = hasCauses ? selectedCategory.items : [];
      if (hasCauses && !isOtherCategory) { // Only add if it has items AND it's not the 'Other' category
        if (!this.rxform.get('causeOfDeath')) {
          (this.rxform as FormGroup<any>).addControl(
            'causeOfDeath',
            this.fb.control(this.l.causeOfDeath || '', Validators.required)
          );
        }
      } 
      // Otherwise, remove it if it exists
      else if (!hasCauses && !isOtherCategory) {
        if (this.rxform.get('causeOfDeath')) {
          this.rxform.removeControl('causeOfDeath');
        }
      }
      // Note: The logic for 'causeOfDeath' needs to be in RxClaimsForm if you want a getter for it. 
      // I'll assume you update RxClaimsForm to include 'otherCauseOfDeath' now.
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

      const formValue = this.rxform.getRawValue(); 

      let claimsData: Claims = formValue as unknown as Claims;

      const selectedCategory = this.deathCategory.find(c => c._id === formValue.causeOfDeathCategory);
      const isOtherCategory = selectedCategory?.label === 'Other (Please Specify)';

      if (isOtherCategory) {
          // If "Other" is selected, use the free-text input for the final DB field
          claimsData.causeOfDeath = formValue.otherCauseOfDeath;
      } else if (formValue.causeOfDeath) {
          // Otherwise, use the selected value from the standard dropdown
          claimsData.causeOfDeath = formValue.causeOfDeath;
      } else {
          // Ensure causeOfDeath is present, even if empty (depending on your model)
          claimsData.causeOfDeath = ''; 
      }
      
      // 3. Crucial Cleanup: Delete the temporary control that doesn't exist in the DB model.
      delete (claimsData as any).otherCauseOfDeath;

      // 4. Emit the cleaned and typed data
      this.onSubmitEvent.emit({ claimsData, files: this.selectedFiles });
  }

  public isOtherCategorySelected(): boolean {
      const selectedCategoryId = this.causeOfDeathCategory.value;
      if (!selectedCategoryId) {
          return false;
      }
      
      // Find the object and check its label
      const selectedCategory = this.deathCategory.find(c => c._id === selectedCategoryId);
      
      return selectedCategory?.label === 'Other (Please Specify)';
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
  get otherCauseOfDeath() { return this.rxform.controls.otherCauseOfDeath; }
}
