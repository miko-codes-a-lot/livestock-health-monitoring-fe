import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockBreedDetails } from './livestock-breed-details';

describe('LivestockBreedDetails', () => {
  let component: LivestockBreedDetails;
  let fixture: ComponentFixture<LivestockBreedDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockBreedDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockBreedDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
