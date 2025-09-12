import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Treatment } from './treatment';

describe('Treatment', () => {
  let component: Treatment;
  let fixture: ComponentFixture<Treatment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Treatment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Treatment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
