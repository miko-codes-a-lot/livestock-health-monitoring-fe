import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LivestockBreed } from '../../_shared/model/livestock-breed';
import { RxLivestockBreedForm } from './rx-livestock-breed-form';
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

@Component({
  selector: 'app-livestock-breed-form',
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
    MatProgressSpinnerModule
  ],
  templateUrl: './livestock-breed-form.html',
  styleUrls: ['./livestock-breed-form.css']
})
export class LivestockBreedForm implements OnInit {
  @Input() isLoading = false;

  private _initDoc!: LivestockBreed;
  @Output() onSubmitEvent = new EventEmitter<{ livestockBreedData: LivestockBreed }>();

  classifications: { _id?: string; name: string }[] = [];
  rxform!: FormGroup<RxLivestockBreedForm>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly livestockClassificationService: LivestockClassificationService
  ) {}

  // --- InitDoc Setter/Getter ---
  @Input()
  set initDoc(value: LivestockBreed) {
    this._initDoc = value;

    // If classifications already loaded and form initialized, patch immediately
    if (this.rxform && this.classifications.length > 0 && value) {
      this.patchFormWithInitDoc(value);
    }
  }

  get initDoc() {
    return this._initDoc;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadClassificationsAndPatch();
  }

  // --- Initialize Form ---
  private initializeForm(): void {
    const l: LivestockBreed = this.initDoc ?? {
      name: '',
      classification: ''
    };

    this.rxform = this.fb.nonNullable.group({
      name: [l.name, Validators.required],
      classification: [l.classification || '', Validators.required],
    });
  }

  // --- Patch helper ---
  private patchFormWithInitDoc(value: LivestockBreed): void {
    const classification = value.classification as any; // 👈 temporary type flexibility

    this.rxform.patchValue({
      name: value.name,
      classification:
        typeof classification === 'object' && classification?._id
          ? classification._id
          : classification
    });
  }

  // --- Load Classifications ---
  private loadClassificationsAndPatch(): void {
    this.livestockClassificationService.getAll().subscribe({
      next: (classifications) => {
        this.classifications = classifications || [];

        // If edit mode, ensure classification gets set correctly
        if (this._initDoc) {
          this.patchFormWithInitDoc(this._initDoc);
        }
      },
      error: (err) => {
        console.error('Failed to load classifications', err);
      }
    });
  }

  // --- Submit ---
  onSubmit() {
    if (this.rxform.invalid) return;

    const formValue = this.rxform.getRawValue(); // ✅ ensures strong typing
    const selected = this.classifications.find(c => c._id === formValue.classification);

    const livestockBreedData: LivestockBreed = {
      name: formValue.name ?? '',
      classification: selected?._id ?? formValue.classification ?? ''
    };

    this.onSubmitEvent.emit({ livestockBreedData });
  }
  // --- Getters ---
  get name() { return this.rxform.controls.name; }
  get classification() { return this.rxform.controls.classification; }
}
