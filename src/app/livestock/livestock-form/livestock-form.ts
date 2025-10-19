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
import { LivestockGroup } from '../../_shared/model/livestock-group';

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
  // @Input() initDoc!: Livestock;
  private _initDoc!: Livestock;
  @Output() onSubmitEvent = new EventEmitter<Livestock>();

  @Input()
  set initDoc(value: Livestock) {
    this._initDoc = value;
    if (this.rxform && value) {
      this.rxform.patchValue(value);
      this.onSpeciesChange(value.species);
    }
  }

  get initDoc() {
    return this._initDoc;
  }

  rxform!: FormGroup<RxLivestockForm>;
  livestockGroups: LivestockGroup[] = [];
  farmers: { id: string; name: string }[] = [];
  filteredBreeds: { value: string; label: string }[] = [];

  speciesOptions = [
    { value: 'BUB', label: 'Bubaline' },
    { value: 'BOV', label: 'Bovine' },
  ];

  breedOptions: { [key: string]: { value: string; label: string }[] } = {
    BOV: [
      { value: 'N', label: 'Native' },
      { value: 'GN', label: 'Granded Native' },
      { value: 'BR', label: 'Brahman' },
      { value: 'BRX', label: 'Brahman Cross' },
      { value: 'IB', label: 'Indu Brazil' },
      { value: 'IBX', label: 'Indu Brazil Cross' },
    ],
    BUB: [
      { value: 'PC', label: 'Philippine Carabao' },
      { value: 'MBX', label: 'Murrah Buffalo Cross' },
      { value: 'MB', label: 'Murrah Buffalo' },
      { value: 'BB', label: 'Bulgarian Buffalo' },
    ]
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly livestockGroupService: LivestockGroupService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadFarmers();
    this.loadLivestockGroups();
    console.log('initDoc', this.initDoc)
    // patch form if initDoc is already set
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
      status: 'pending',
      animalPhotos: []
    };

    this.rxform = this.fb.nonNullable.group({
      tagNumber: [l.tagNumber, Validators.required],
      species: [l.species, Validators.required],
      breed: [l.breed, Validators.required],
      sex: [l.sex, Validators.required],
      age: [l.age, [Validators.required, Validators.min(0)]],
      dateOfPurchase: [l.dateOfPurchase, Validators.required],
      isDeceased: [l.isDeceased],
      isInsured: [l.isInsured],
      livestockGroup: [l.livestockGroup, Validators.required],
      farmer: [l.farmer, Validators.required],
      status: [l.status],
      animalPhotos: [l.animalPhotos || []]
    });

    this.rxform.get('species')?.valueChanges.subscribe(value => {
      this.onSpeciesChange(value);
    });
  }

  private loadFarmers(): void {
    this.userService.getAll().subscribe(users => {
      this.farmers = users
        .filter(u => u.role === 'farmer' && u._id)
        .map(u => ({ id: u._id!, name: `${u.firstName} ${u.lastName}` }));
    });
  }

  private loadLivestockGroups(): void {
    this.livestockGroupService.getAll().subscribe(groups => {
      this.livestockGroups = groups;
    });
  }

  onSpeciesChange(species: string) {
    this.filteredBreeds = this.breedOptions[species] ?? [];
    const currentBreed = this.rxform.get('breed')?.value;
    if (!this.filteredBreeds.find(b => b.value === currentBreed)) {
      this.rxform.get('breed')?.patchValue('');
    }
  }

  onSubmit() {
    if (this.rxform.invalid) return;
    this.onSubmitEvent.emit(this.rxform.value as Livestock);
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
