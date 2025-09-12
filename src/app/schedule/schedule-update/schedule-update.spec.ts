import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleUpdate } from './schedule-update';

describe('ScheduleUpdate', () => {
  let component: ScheduleUpdate;
  let fixture: ComponentFixture<ScheduleUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
