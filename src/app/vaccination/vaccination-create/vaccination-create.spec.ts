import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VaccinationCreate } from './vaccination-create';

describe('VaccinationCreate', () => {
  let component: VaccinationCreate;
  let fixture: ComponentFixture<VaccinationCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VaccinationCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VaccinationCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
