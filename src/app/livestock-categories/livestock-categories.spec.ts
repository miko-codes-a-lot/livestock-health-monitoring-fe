import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockCategories } from './livestock-categories';

describe('LivestockCategories', () => {
  let component: LivestockCategories;
  let fixture: ComponentFixture<LivestockCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockCategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockCategories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
