import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockClassificationDetails } from './livestock-classification-details';

describe('LivestockClassificationDetails', () => {
  let component: LivestockClassificationDetails;
  let fixture: ComponentFixture<LivestockClassificationDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockClassificationDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockClassificationDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
