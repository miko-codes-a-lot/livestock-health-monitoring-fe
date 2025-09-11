import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFarmer } from './dashboard-farmer';

describe('DashboardFarmer', () => {
  let component: DashboardFarmer;
  let fixture: ComponentFixture<DashboardFarmer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardFarmer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardFarmer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
