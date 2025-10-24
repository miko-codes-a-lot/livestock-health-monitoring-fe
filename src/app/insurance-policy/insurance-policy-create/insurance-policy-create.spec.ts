import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsurancePolicy } from './insurance-policy-create';

describe('InsurancePolicy', () => {
  let component: InsurancePolicy;
  let fixture: ComponentFixture<InsurancePolicy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsurancePolicy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsurancePolicy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
