import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LivestockClassification } from '../../_shared/model/livestock-classification';
import { RxLivestockClassificationForm } from './rx-livestock-classification-form';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserService } from '../../_shared/service/user-service';

@Component({
  selector: 'app-livestock-classification-form',
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
  templateUrl: './livestock-classification-form.html',
  styleUrls: ['./livestock-classification-form.css']
})
export class LivestockClassificationForm implements OnInit {
  @Input() isLoading = false;
  // @Input() initDoc!: Livestock;
  private _initDoc!: LivestockClassification;
  @Output() onSubmitEvent = new EventEmitter<{ livestockClassificationData: LivestockClassification;  }>();
  selectedFiles: File[] = [];

  // make an array that will catch the photos
  avatarUrl: string[] = [];

  @Input()
  set initDoc(value: LivestockClassification) {
    this._initDoc = value;
    if (this.rxform && value) {
      this.rxform.patchValue(value);
      // this.onSpeciesChange(value.species);
    }
  }

  get initDoc() {
    return this._initDoc;
  }

  rxform!: FormGroup<RxLivestockClassificationForm>;
  farmers: { id: string; name: string }[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    // patch form if initDoc is already set
    if (this.initDoc) {
      // initialize here
      this.rxform.patchValue(this.initDoc);
    }
  }

  private initializeForm(): void {
    const l: LivestockClassification = this.initDoc ?? {
      name: '',
      description: '',
      icon: '',
    };

    this.rxform = this.fb.nonNullable.group({
      name: [l.name, Validators.required],
      description: [l.description, Validators.required],
      icon: [l.icon, Validators.required],
    });
  }

  onSubmit() {
    if (this.rxform.invalid) return;
    const livestockClassificationData: LivestockClassification = this.rxform.value as LivestockClassification;
    this.onSubmitEvent.emit({livestockClassificationData});
  }

  

  // --- Getters ---
  get name() { return this.rxform.controls.name; }
  get description() { return this.rxform.controls.description; }
  get icon() { return this.rxform.controls.icon; }
}
