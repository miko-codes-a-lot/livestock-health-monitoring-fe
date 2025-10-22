import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockBreedUpdate } from './livestock-breed-update';

describe('LivestockBreedUpdate', () => {
  let component: LivestockBreedUpdate;
  let fixture: ComponentFixture<LivestockBreedUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockBreedUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockBreedUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
