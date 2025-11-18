import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HealthRecord } from '../../_shared/model/health-record';
import { RxHealthRecordForm } from './rx-health-record-form';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HealthRecordService } from '../../_shared/service/health-record-service';
import { LivestockService } from '../../_shared/service/livestock-service';
import { UserService } from '../../_shared/service/user-service';
import { LivestockGroupService } from '../../_shared/service/livestock-group-service';
import { AuthService } from '../../_shared/service/auth-service';
import { UserDto } from '../../_shared/model/user-dto';

@Component({
  selector: 'app-health-record-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './health-record-form.html',
  styleUrl: './health-record-form.css'
})
export class HealthRecordForm implements OnInit {
  @Input() isLoading = false;
  private _initDoc!: HealthRecord;

  @Input()
  set initDoc(value: HealthRecord) {
    this._initDoc = value;
    console.log('this._initDoc = value;', this._initDoc)
    if (this.rxform && value) {
      // run fetch from animal
      this.tryPatchForm();
      this.populateAnimal(value)
    }
  }

  get initDoc() {
    return this._initDoc;
  }

  @Output() onSubmitEvent = new EventEmitter<any>();
  animals: { _id: string; tagNumber: string; species: string }[] = [];
  technicians: { id: string; name: string }[] = [];
  loggedInTechnician: { name: string } | null = null;
  rxform!: FormGroup<RxHealthRecordForm>;

  farmers: { _id: string; name: string; }[] = [];
  filteredGroups: { _id: string; name: string }[] = [];
  filteredAnimals: { _id: string; name: string }[] = [];
  user: UserDto | null = null;

  hr = {
    animal: '',
    bodyCondition: '',
    dewormingDate: '',
    diagnosis: '',
    notes: '',
    symptomsObserved: '',
    technician: '',
    treatmentGiven: '',
    vaccinationDate: '',
    visitDate: '',
    vitaminsAdministered: '',
    weightKg: 0,
    status: 'pending',
    farmer: '', // 68f0164e7162f5d2cbde9418
    livestockGroup: ''
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly healthRecordService: HealthRecordService,
    private readonly livestockService: LivestockService,
    private readonly userService: UserService,
    private readonly livestockGroupService: LivestockGroupService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAnimals();
    this.loadTechnicians();
    this.loadFarmers();
    this.authService.currentUser$.subscribe({
      next: (u) => {
        if (u) {
          this.user = u
        }
      }
    })

    // if update, use the animal data (_id, farmer._id, livestockGroup._id)load the data to farmer, livestock group, and animal
    this.tryPatchForm();
  }

  private initializeForm(): void {
    // const hr = {
    //   animal: '',
    //   bodyCondition: '',
    //   dewormingDate: '',
    //   diagnosis: '',
    //   notes: '',
    //   symptomsObserved: '',
    //   technician: '',
    //   treatmentGiven: '',
    //   vaccinationDate: '',
    //   visitDate: '',
    //   vitaminsAdministered: '',
    //   weightKg: 0,
    //   status: 'pending',
    //   farmer: '68f0164e7162f5d2cbde9418',
    //   livestockGroup: ''
    // };

    this.rxform = this.fb.nonNullable.group({
      animal: [this.hr.animal, Validators.required],
      bodyCondition: [this.hr.bodyCondition, Validators.required],
      dewormingDate: [this.hr.dewormingDate],
      diagnosis: [this.hr.diagnosis],
      notes: [this.hr.notes],
      symptomsObserved: [this.hr.symptomsObserved],
      technician: [this.hr.technician, Validators.required],
      treatmentGiven: [this.hr.treatmentGiven],
      vaccinationDate: [this.hr.vaccinationDate],
      visitDate: [this.hr.visitDate, Validators.required],
      vitaminsAdministered: [this.hr.vitaminsAdministered],
      weightKg: [this.hr.weightKg, [Validators.required, Validators.min(0)]],
      status: [this.hr.status],
      farmer: [this.hr.farmer || ''],
      livestockGroup: [this.hr.livestockGroup || '']
    }) as unknown as FormGroup<RxHealthRecordForm>;

    this.rxform.get('farmer')?.valueChanges.subscribe(value => {
      this.onFarmerChange(value);
    });

    this.rxform.get('livestockGroup')?.valueChanges.subscribe(value => {
      this.onLivestockGroupChange(value);
    });
  }

  
  private loadFarmers(): void {
    this.userService.getAll().subscribe(users => {
      this.farmers = users
        .filter(u => u.role === 'farmer')
        .map(u => ({
          _id: String(u._id),
          name: `${u.firstName} ${u.lastName}` 
      }));
      // this.tryPatchForm();
    });
  }


  onFarmerChange(farmerId: string) {
    this.filteredAnimals = [];
    if (!farmerId) {
      this.filteredGroups = [];
      return;
    }
    

    this.livestockGroupService.getAll().subscribe(groups => {
      this.filteredGroups = groups
        .filter((b: any) => 
          b.farmer?._id === farmerId && b.status === 'verified'
        )
        .map((b: any) => ({
          _id: b._id,
          name: b.groupName
        }));
      
      this.rxform.get('livestockGroup')?.value;
      // if (!this.filteredGroups.find(b => b._id === currentGroup)) {
      //     this.rxform.get('livestockGroup')?.patchValue('' as any);
      // }
    });
  }

  onLivestockGroupChange(livestockGroupId: string) {
    if (!livestockGroupId) {
      this.filteredAnimals = [];
      return;
    }

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
    });
    
  }

  populateAnimal(value: any) {
    if (!value.animal) return;
    const farmerId = value?.animal?.farmer;
    const livestockGroupId = value?.animal.livestockGroup;
    (this.rxform as any).patchValue({ farmer: farmerId });
    (this.rxform as any).patchValue({ livestockGroup: livestockGroupId });
    (this.rxform as any).patchValue({
      animal: value.animal._id || '',  
      bodyCondition: value.bodyCondition || '',
      weightKg: value.weightKg || 0,
      diagnosis: value.diagnosis || '',
      visitDate: value.visitDate ? new Date(value.visitDate) : null,
      vaccinationDate: value.vaccinationDate ? new Date(value.vaccinationDate) : null,
      dewormingDate: value.dewormingDate ? new Date(value.dewormingDate) : null,
      symptomsObserved: value.symptomsObserved || '',
      notes: value.notes || '',
      treatmentGiven: value.treatmentGiven || '',
      technician: value.technician?._id || value.technician || '',
      vitaminsAdministered: value.vitaminsAdministered || ''
    });
  }

  private loadAnimals(): void {
    this.livestockService.getAll().subscribe({
      next: (data) => {
        this.animals = data.map(a => ({
          _id: String(a._id),
          tagNumber: a.tagNumber,
          species: a.species
        }));
      },
      error: (err) => console.error('Error loading animals:', err)
    });
  }

  // private loadTechnicians(): void {
  //   this.userService.getAll().subscribe(users => {
  //     this.technicians = users
  //       .filter(u => u.role === 'technician' && u._id)
  //       .map(u => ({ id: String(u._id), name: `${u.firstName} ${u.lastName}` }));
  //     this.tryPatchForm();
  //   });
  // }

  
  private loadTechnicians(): void {
    this.userService.getAll().subscribe(users => {
      if (this.user?.role === 'technician') {
        // Only include the logged-in farmer
        const tech = users.find(u => u._id === this.user?._id);
        if (tech) {
          // this.technicians = [{ id: tech._id!, name: `${tech.firstName} ${tech.lastName}` }];
          this.loggedInTechnician = { name: `${tech.firstName} ${tech.lastName}` };
          this.rxform.patchValue({ technician: tech._id });
        }
      }
      else {
        // Admin or other roles: show all farmers
        this.technicians = users
          .filter(u => u.role === 'technician')
          .map(u => ({ id: u._id!, name: `${u.firstName} ${u.lastName}` }));
      }

      this.tryPatchForm();
    });
  }

  private tryPatchForm(): void {
    if (!this._initDoc || this.animals.length === 0 || this.technicians.length === 0) return;

    const patchData: any = { ...this._initDoc };
    // Handle animal object or ID
    patchData.animal =
      patchData.animal && typeof patchData.animal === 'object' && '_id' in patchData.animal
        ? patchData.animal._id
        : patchData.animal;

    // Handle technician object or ID
    patchData.technician =
      patchData.technician && typeof patchData.technician === 'object' && '_id' in patchData.technician
        ? patchData.technician._id
        : patchData.technician;

    // --- 3. Update Date Patching Logic ---
    // Convert date strings to Date objects for the MatDatepickers
    ['visitDate', 'vaccinationDate', 'dewormingDate'].forEach(field => {
      if (patchData[field]) {
        // The datepicker control works best with native Date objects
        patchData[field] = new Date(patchData[field]);
      }
    });

    this.rxform.patchValue(patchData);
  }

  onSubmit() {
    if (this.rxform.invalid) return;
      const value = { ...this.rxform.value };

      const dateFields: (keyof RxHealthRecordForm)[] = ['dewormingDate', 'vaccinationDate', 'visitDate'];

      dateFields.forEach(field => {
        const fieldValue = value[field];
        if (fieldValue) {
          // Convert to ISO string safely
          value[field] = new Date(fieldValue as unknown as string).toISOString() as any;
        } else {
          delete value[field]; // optional: remove if empty
        }
      });
    this.onSubmitEvent.emit(value);
  }

  // --- Getters ---
  get animal() { return this.rxform.controls.animal; }
  get bodyCondition() { return this.rxform.controls.bodyCondition; }
  get dewormingDate() { return this.rxform.controls.dewormingDate; }
  get diagnosis() { return this.rxform.controls.diagnosis; }
  get notes() { return this.rxform.controls.notes; }
  get symptomsObserved() { return this.rxform.controls.symptomsObserved; }
  get technician() { return this.rxform.controls.technician; }
  get treatmentGiven() { return this.rxform.controls.treatmentGiven; }
  get vaccinationDate() { return this.rxform.controls.vaccinationDate; }
  get visitDate() { return this.rxform.controls.visitDate; }
  get vitaminsAdministered() { return this.rxform.controls.vitaminsAdministered; }
  get weightKg() { return this.rxform.controls.weightKg; }
  get status() { return this.rxform.controls.status; }
}
