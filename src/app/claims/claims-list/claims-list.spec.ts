import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockList } from './claims-list';

describe('LivestockList', () => {
  let component: LivestockList;
  let fixture: ComponentFixture<LivestockList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
