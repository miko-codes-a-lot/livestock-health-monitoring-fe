import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockGroupUpdate } from './insurance-policy-update';

describe('LivestockGroupUpdate', () => {
  let component: LivestockGroupUpdate;
  let fixture: ComponentFixture<LivestockGroupUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockGroupUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockGroupUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
