import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockClassificationForm } from './livestock-classification-form';

describe('LivestockForm', () => {
  let component: LivestockClassificationForm;
  let fixture: ComponentFixture<LivestockClassificationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockClassificationForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockClassificationForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
