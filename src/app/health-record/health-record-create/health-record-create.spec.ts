import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthRecordCreate } from './health-record-create';

describe('HealthRecordCreate', () => {
  let component: HealthRecordCreate;
  let fixture: ComponentFixture<HealthRecordCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthRecordCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthRecordCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
