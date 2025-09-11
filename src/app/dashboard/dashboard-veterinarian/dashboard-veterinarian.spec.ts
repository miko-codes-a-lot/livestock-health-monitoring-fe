import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardVeterinarian } from './dashboard-veterinarian';

describe('DashboardVeterinarian', () => {
  let component: DashboardVeterinarian;
  let fixture: ComponentFixture<DashboardVeterinarian>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardVeterinarian]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardVeterinarian);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
