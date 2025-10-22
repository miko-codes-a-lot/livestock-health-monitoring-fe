import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockClassificationList } from './livestock-classification-list';

describe('LivestockList', () => {
  let component: LivestockClassificationList;
  let fixture: ComponentFixture<LivestockClassificationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockClassificationList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockClassificationList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
