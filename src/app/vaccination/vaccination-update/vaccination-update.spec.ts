import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VaccinationUpdate } from './vaccination-update';

describe('VaccinationUpdate', () => {
  let component: VaccinationUpdate;
  let fixture: ComponentFixture<VaccinationUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VaccinationUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VaccinationUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
