import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockClassificationUpdate } from './livestock-classification-update';

describe('LivestockUpdate', () => {
  let component: LivestockClassificationUpdate;
  let fixture: ComponentFixture<LivestockClassificationUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockClassificationUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockClassificationUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
