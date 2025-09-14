import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockClassification } from './livestock-classification';

describe('LivestockClassification', () => {
  let component: LivestockClassification;
  let fixture: ComponentFixture<LivestockClassification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockClassification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockClassification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
