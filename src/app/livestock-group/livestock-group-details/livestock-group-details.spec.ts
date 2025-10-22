import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockDetails } from './livestock-group-details';

describe('LivestockDetails', () => {
  let component: LivestockDetails;
  let fixture: ComponentFixture<LivestockDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
