import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentCreate } from './treatment-create';

describe('TreatmentCreate', () => {
  let component: TreatmentCreate;
  let fixture: ComponentFixture<TreatmentCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmentCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
