import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockBreedList } from './livestock-breed-list';

describe('LivestockList', () => {
  let component: LivestockBreedList;
  let fixture: ComponentFixture<LivestockBreedList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockBreedList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockBreedList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
