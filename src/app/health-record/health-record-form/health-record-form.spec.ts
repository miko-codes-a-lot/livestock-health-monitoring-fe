import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthRecordForm } from './health-record-form';

describe('HealthRecordForm', () => {
  let component: HealthRecordForm;
  let fixture: ComponentFixture<HealthRecordForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthRecordForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthRecordForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
