import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockGroupForm } from './insurance-policy-form';

describe('LivestockGroupForm', () => {
  let component: LivestockGroupForm;
  let fixture: ComponentFixture<LivestockGroupForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockGroupForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockGroupForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
