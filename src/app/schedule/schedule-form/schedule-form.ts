import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Schedule } from '../../_shared/model/schedule';
import { RxScheduleForm } from './rx-schedule-form';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../_shared/service/user-service';
import { LivestockClassificationService } from '../../_shared/service/livestock-classification-service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; 
import { LivestockService } from '../../_shared/service/livestock-service';
import { HealthRecordService } from '../../_shared/service/health-record-service';
import { AuthService } from '../../_shared/service/auth-service';
import { UserDto } from '../../_shared/model/user-dto';

@Component({
  selector: 'app-schedule-form',
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
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './schedule-form.html',
  styleUrl: './schedule-form.css'
})
export class ScheduleForm implements OnInit {
  @Input() isLoading = false;

  private _initDoc!: Schedule;
  @Output() onSubmitEvent = new EventEmitter<{ scheduleData: Schedule }>();

  livestocks: { _id: string; name: string; farmer: string }[] = [];
  filteredLivestocks: { _id: string; name: string; farmer: string }[] = [];
  filteredHealthRecords: { _id: string; name: string }[] = [];
  vets: { _id: string; name: string; }[] = [];
  farmers: { _id: string; name: string; }[] = [];
  currentUser: UserDto | null = null;

  rxform!: FormGroup<RxScheduleForm>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly livestockService: LivestockService,
    private readonly livestockClassificationService: LivestockClassificationService,
    private readonly healthRecordService: HealthRecordService,
    private readonly authService: AuthService,
  ) {}

  // --- InitDoc Setter/Getter ---
  @Input()
  set initDoc(value: Schedule) {
    this._initDoc = value;

    // Patch only when form exists
    if (this.rxform && value) {
      this.patchFormWithInitDoc(value);
    }
  }

  get initDoc() {
    return this._initDoc;
  }

  ngOnInit(): void {
     this.authService.currentUser$.subscribe({
      next: (user) => { 
        this.currentUser = user
      }
     })
    // this.userService.getAll().subscribe(users => {
    //   this.vets = users
    //     .filter(u => u.role === 'vet')
    //     .map(u => ({
    //       _id: String(u._id),
    //       name: `${u.firstName} ${u.lastName}` 
    //   }));
    //   // this.tryPatchForm();
    // });

    this.loadLivestock();
    this.loadVetsAndFarmers();
    this.initializeForm();
  }

  // --- Initialize Form ---
  private initializeForm(): void {
    const s: Schedule = this.initDoc ?? {
      animal: '',
      healthRecord: '',
      assignedVet: '',
      type: 'vaccination',
      scheduledDate: '',
    };

    this.rxform = this.fb.nonNullable.group<RxScheduleForm>({
      animal: this.fb.control('', { validators: Validators.required, nonNullable: true }),
      healthRecord: this.fb.control('', { validators: Validators.required, nonNullable: true }),
      assignedVet: this.fb.control('', { validators: Validators.required, nonNullable: true }),
      farmer: this.fb.control('', { validators: Validators.required, nonNullable: true }),
      type: this.fb.control('vaccination', { validators: Validators.required, nonNullable: true }),
      scheduledDate: this.fb.control('', { validators: Validators.required, nonNullable: true }),
    });

    this.rxform.get('animal')?.valueChanges.subscribe(value => {
      this.onAnimalChange(value);
    });

    this.rxform.get('farmer')?.valueChanges.subscribe(farmerId => {
      this.onFarmerChange(farmerId);
    });
  }

  onFarmerChange(farmerId: string) {
    // Reset Animal and Health Record selections
    this.rxform.get('animal')?.setValue('');
    this.rxform.get('healthRecord')?.setValue('');
    this.filteredHealthRecords = []; // Clear health records list

    this.filterLivestocks(farmerId);
  }

  filterLivestocks(farmerId: string) {
    if (farmerId && this.livestocks.length > 0) {
      this.filteredLivestocks = this.livestocks.filter(
        l => l.farmer === farmerId
      );
    } else {
      this.filteredLivestocks = [];
    }
  }

  // --- Patch helper ---
  private patchFormWithInitDoc(value: Schedule): void {
    if (!value) return;
    this.rxform.patchValue({
      farmer: value.farmer, // Ensure farmer is patched
      animal: value.animal,
      healthRecord: value.healthRecord,
      assignedVet: value.assignedVet,
      type: value.type,
      scheduledDate: value.scheduledDate
        ? typeof value.scheduledDate === 'string'
          ? value.scheduledDate
          : value.scheduledDate.toISOString()
        : '',
    }, { emitEvent: false }); 

    if (value.farmer) {
      this.filterLivestocks(value.farmer);
    }
    if (value.animal) {
      this.onAnimalChange(value.animal);
    }
  }
  private loadLivestock(): void {
    this.livestockService.getAll().subscribe(livestocks => {
      this.livestocks = livestocks
       .filter((l: any) => l.status === 'verified')
       .map(l => ({
          _id: String(l._id),
          farmer: String(l.farmer), // Ensure string type
          name: `${l.tagNumber} - ${(l.breed as any).name}`,
      }));

      // If form is already populated (e.g. by initDoc), refresh the filtered list now that data is here
      const currentFarmer = this.rxform.controls.farmer.value;
      if (currentFarmer) {
        this.filterLivestocks(currentFarmer);
      }
    });
  }

  onAnimalChange(livestockId: string) {
    if (!livestockId) {
      this.filteredHealthRecords = [];
      return;
    }
    
    this.healthRecordService.getAll().subscribe(healthRecords => {
      this.filteredHealthRecords = healthRecords
        .filter((hr: any) =>
          hr.animal?._id === livestockId
        )
        .map((hr: any) => ({
          _id: hr._id,
          name: `Tag Number: ${hr.animal.tagNumber} | Body Condition: ${hr.bodyCondition} | Weight(Kg): ${hr.weightKg}`
        }));
    });
  }

  private loadVetsAndFarmers(): void {
    this.userService.getAll().subscribe(users => {
      this.vets = users
        .filter(u => u.role === 'vet')
        .map(u => ({
          _id: String(u._id),
          name: `${u.firstName} ${u.lastName}` 
      }));
      this.farmers = users.filter(u => u.role === 'farmer')
        .filter(u => this.currentUser?.address?.barangay === u.address?.barangay)
        .map(u => ({ _id: String(u._id), name: `${u.firstName} ${u.lastName}` }));
      // this.tryPatchForm();
    });
  }


  // --- Submit ---
  onSubmit() {
    console.log('this.rxform', this.rxform)
    if (this.rxform.invalid) return;

    const formValue = this.rxform.getRawValue();

    const scheduleData: Schedule = {
      animal: formValue.animal,
      healthRecord: formValue.healthRecord,
      createdBy: this.currentUser?._id,
      assignedVet: formValue.assignedVet,
      farmer: formValue.farmer,
      type: formValue.type,
      scheduledDate: new Date(formValue.scheduledDate).toISOString(), // <-- convert to ISO string
      status: 'pending'
    };

    this.onSubmitEvent.emit({ scheduleData });
  }

  // --- Getters ---
  get animal() { return this.rxform.controls.animal; }
  get healthRecord() { return this.rxform.controls.healthRecord; }
  get assignedVet() { return this.rxform.controls.assignedVet; }
  get type() { return this.rxform.controls.type; }
  get scheduledDate() { return this.rxform.controls.scheduledDate; }
}
