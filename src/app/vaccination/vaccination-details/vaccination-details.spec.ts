import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VaccinationDetails } from './vaccination-details';

describe('VaccinationDetails', () => {
  let component: VaccinationDetails;
  let fixture: ComponentFixture<VaccinationDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VaccinationDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VaccinationDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
