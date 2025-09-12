import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentDetails } from './treatment-details';

describe('TreatmentDetails', () => {
  let component: TreatmentDetails;
  let fixture: ComponentFixture<TreatmentDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmentDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
