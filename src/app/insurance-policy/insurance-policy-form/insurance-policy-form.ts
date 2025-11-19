import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Livestock } from '../../_shared/model/livestock';
import { RxInsurancePolicyForm } from './rx-insurance-policy-form';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserService } from '../../_shared/service/user-service';
import { LivestockGroupService } from '../../_shared/service/livestock-group-service';
import { InsurancePolicyService } from '../../_shared/service/insurance-policy-service';
import { LivestockGroup } from '../../_shared/model/livestock-group';
import { InsurancePolicy } from '../../_shared/model/insurance-policy';
import { UserDto } from '../../_shared/model/user-dto';
import { AuthService } from '../../_shared/service/auth-service';


@Component({
  selector: 'app-insurance-policy-form',
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
  templateUrl: './insurance-policy-form.html',
  styleUrls: ['./insurance-policy-form.css']
})
export class InsurancePolicyForm implements OnInit {
  @Input() isLoading = false;
  // @Input() initDoc!: Livestock;
  private _initDoc!: InsurancePolicy;
  @Output() onSubmitEvent = new EventEmitter<{ insurancePolicyData: InsurancePolicy; file: File | null }>();
  selectedFile: File | null = null;
  fileType: 'image' | 'pdf' | 'doc' | 'other' = 'other';
  previewPhoto: string = '';
  existingPhoto: string = '';

  avatarUrl: string[] = [];
  // livestockGroups: LivestockGroup[] = [];
  livestockGroups: { _id: string; groupName: string }[] = [];

  user: UserDto | null = null;


  @Input()
  set initDoc(value: InsurancePolicy) {
    this._initDoc = value;
    if (this.rxform && value) {
      this.rxform.patchValue(value);
      // load existing photos
      this.existingPhoto = value.policyDocument || '';
      if (this.existingPhoto) {
        this.insurancePolicyService.getPolicyDocument(this.existingPhoto)
          .subscribe(url => {
            this.previewPhoto = url;
          });
      }
    }
  }

  get initDoc() {
    return this._initDoc;
  }

  rxform!: FormGroup<RxInsurancePolicyForm>;
  insurancePolicy: InsurancePolicy[] = [];
  farmers: { _id: string; name: string }[] = [];
  filteredGroups: { _id: string; name: string }[] = [];
  filteredBreeds: { value: string; label: string }[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly livestockGroupService: LivestockGroupService,
    private readonly insurancePolicyService: InsurancePolicyService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadFarmers();
    this.loadInsurancePolicies();
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

    this.rxform.get('farmer')?.valueChanges.subscribe(value => {
      this.onFarmerChange(value);
    });

  }

  private initializeForm(): void {
    const l: InsurancePolicy = this.initDoc ?? {
      _id: '',
      farmer: '',
      livestockGroup: '',
      policyNumber: '',
      provider: '',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      policyDocument: '',
      status: 'pending',
    };

    this.rxform = this.fb.nonNullable.group({
      farmer: [l.farmer, Validators.required],
      livestockGroup: [l.livestockGroup, Validators.required],
      policyNumber: [l.policyNumber, Validators.required],
      provider: [l.provider, Validators.required],
      startDate: [l.startDate, Validators.required],
      endDate: [l.endDate, Validators.required],
      policyDocument: [l.policyDocument || ''],
      status: [l.status as 'draft' | 'pending' | 'approved' | 'rejected' | 'expired'],
    });

  }

  onFarmerChange(farmerId: string) {
    if (!farmerId) {
      this.filteredGroups = [];
      return;
    }
    

    this.livestockGroupService.getAll().subscribe(groups => {
      this.filteredGroups = groups
        .filter(
          (b: any) => b.farmer?._id === farmerId && b.status === 'verified'
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

  private loadFarmers(): void {
    this.userService.getAll().subscribe(users => {
      this.farmers = users
        .filter(u => u.role === 'farmer' && u.address.barangay === this.user?.address.barangay)
        .map(u => ({
          _id: String(u._id),
          name: `${u.firstName} ${u.lastName}` 
      }));
      // this.tryPatchForm();
    });
  }

  // private loadFarmers(): void {
  //   this.userService.getAll().subscribe(users => {
  //     if (this.user?.role === 'farmer') {
  //       // Only include the logged-in farmer
  //       this.farmers = users
  //         .filter(u => u._id === this.user?._id)
  //         .map(u => ({ id: u._id!, name: `${u.firstName} ${u.lastName}` }));
        
  //       // Auto-select themselves
  //       this.rxform.patchValue({ farmer: this.user._id });
  //     } else {
  //       // Admin or other roles: show all farmers
  //       this.farmers = users
  //         .filter(u => u.role === 'farmer')
  //         .map(u => ({ id: u._id!, name: `${u.firstName} ${u.lastName}` }));
  //     }
  //   });
  // }

  private loadInsurancePolicies(): void {
    this.insurancePolicyService.getAll().subscribe(policies => {
      this.insurancePolicy = policies;
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

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0]; 
      this.selectedFile = file; 
      this.rxform.patchValue({ policyDocument: file.name });

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const allowedImageTypes = ['jpg', 'jpeg', 'png'];
      const allowedPdf = ['pdf'];
      const allowedDoc = ['doc', 'docx'];

      if (allowedImageTypes.includes(fileExtension!)) {
        this.fileType = 'image';
        this.previewPhoto = URL.createObjectURL(file);
      } else if (allowedPdf.includes(fileExtension!)) {
        this.fileType = 'pdf';
        this.previewPhoto = URL.createObjectURL(file);
      } else if (allowedDoc.includes(fileExtension!)) {
        this.fileType = 'doc';
        this.previewPhoto = URL.createObjectURL(file);
      } else {
        this.fileType = 'other';
        this.previewPhoto = '';
      }
      // this.previewPhoto = URL.createObjectURL(file);  
    }
  }
  openPreviewInNewTab() {
    if (this.previewPhoto) {
      window.open(this.previewPhoto, '_blank');
    }
  }
  // loadProfilePicture(userId: string) {
  //   // how to pass the data of the animalPhotos here?
  //   this.insurancePolicyService.getProfilePicture(userId).subscribe({
  //     next: (url) => this.avatarUrl.push(url),
  //     error: () => this.avatarUrl = []
  //   });
  // }

  onSubmit() {
    if (this.rxform.invalid) return;
    const insurancePolicyData: InsurancePolicy = this.rxform.value as InsurancePolicy;
    console.log('insurancePolicyData', insurancePolicyData)
    this.onSubmitEvent.emit({
      insurancePolicyData,
      file: this.selectedFile, // now matches the payload type
    });

  }

  

  // --- Getters ---
  get farmer() { return this.rxform.controls.farmer; }
  get livestockGroup() { return this.rxform.controls.livestockGroup; }
  get policyNumber() { return this.rxform.controls.policyNumber; }
  get provider() { return this.rxform.controls.provider; }
  get status() { return this.rxform.controls.status; }
  get startDate() { return this.rxform.controls.startDate; }
  get endDate() { return this.rxform.controls.endDate; }
}
