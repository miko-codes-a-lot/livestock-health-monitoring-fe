import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockForm } from './livestock-breed-form';

describe('LivestockForm', () => {
  let component: LivestockForm;
  let fixture: ComponentFixture<LivestockForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
