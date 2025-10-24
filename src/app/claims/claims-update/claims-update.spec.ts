import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockUpdate } from './claims-update';

describe('LivestockUpdate', () => {
  let component: LivestockUpdate;
  let fixture: ComponentFixture<LivestockUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
