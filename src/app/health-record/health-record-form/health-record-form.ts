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
import { HealthRecordService } from '../../_shared/service/health-record-service';
import { LivestockService } from '../../_shared/service/livestock-service';
import { UserService } from '../../_shared/service/user-service';

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
    MatCheckboxModule
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
    if (this.rxform && value) {
      this.tryPatchForm();
    }
  }

  get initDoc() {
    return this._initDoc;
  }

  @Output() onSubmitEvent = new EventEmitter<HealthRecord>();
  animals: { _id: string; tagNumber: string; species: string }[] = [];
  technicians: { id: string; name: string }[] = [];
  rxform!: FormGroup<RxHealthRecordForm>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly healthRecordService: HealthRecordService,
    private readonly livestockService: LivestockService,
    private readonly userService: UserService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAnimals();
    this.loadTechnicians();
  }

  private initializeForm(): void {
    const hr = {
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
      status: 'pending'
    };

    this.rxform = this.fb.nonNullable.group({
      animal: [hr.animal, Validators.required],
      bodyCondition: [hr.bodyCondition, Validators.required],
      dewormingDate: [hr.dewormingDate, Validators.required],
      diagnosis: [hr.diagnosis, Validators.required],
      notes: [hr.notes],
      symptomsObserved: [hr.symptomsObserved, Validators.required],
      technician: [hr.technician, Validators.required],
      treatmentGiven: [hr.treatmentGiven],
      vaccinationDate: [hr.vaccinationDate],
      visitDate: [hr.visitDate, Validators.required],
      vitaminsAdministered: [hr.vitaminsAdministered],
      weightKg: [hr.weightKg, [Validators.required, Validators.min(0)]],
      status: [hr.status]
    }) as unknown as FormGroup<RxHealthRecordForm>;
  }

  private loadAnimals(): void {
    this.livestockService.getAll().subscribe({
      next: (data) => {
        this.animals = data.map(a => ({
          _id: String(a._id),
          tagNumber: a.tagNumber,
          species: a.species
        }));
        this.tryPatchForm();
      },
      error: (err) => console.error('Error loading animals:', err)
    });
  }

  private loadTechnicians(): void {
    this.userService.getAll().subscribe(users => {
      this.technicians = users
        .filter(u => u.role === 'technician' && u._id)
        .map(u => ({ id: String(u._id), name: `${u.firstName} ${u.lastName}` }));
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

    // Format dates for <input type="date">
    ['visitDate', 'vaccinationDate', 'dewormingDate'].forEach(field => {
      if (patchData[field]) {
        patchData[field] = new Date(patchData[field]).toISOString().split('T')[0];
      }
    });

    this.rxform.patchValue(patchData);
  }

  onSubmit() {
    if (this.rxform.invalid) return;
    this.onSubmitEvent.emit(this.rxform.value as HealthRecord);
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
