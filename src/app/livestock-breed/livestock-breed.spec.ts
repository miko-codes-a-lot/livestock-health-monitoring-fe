import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockBreed } from './livestock-breed';

describe('LivestockBreed', () => {
  let component: LivestockBreed;
  let fixture: ComponentFixture<LivestockBreed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockBreed]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockBreed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
