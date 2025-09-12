import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthRecordDetails } from './health-record-details';

describe('HealthRecordDetails', () => {
  let component: HealthRecordDetails;
  let fixture: ComponentFixture<HealthRecordDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthRecordDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthRecordDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
