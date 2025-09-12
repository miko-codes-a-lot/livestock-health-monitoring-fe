import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthRecordUpdate } from './health-record-update';

describe('HealthRecordUpdate', () => {
  let component: HealthRecordUpdate;
  let fixture: ComponentFixture<HealthRecordUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthRecordUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthRecordUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
