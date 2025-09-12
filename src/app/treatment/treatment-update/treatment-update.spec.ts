import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentUpdate } from './treatment-update';

describe('TreatmentUpdate', () => {
  let component: TreatmentUpdate;
  let fixture: ComponentFixture<TreatmentUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmentUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
