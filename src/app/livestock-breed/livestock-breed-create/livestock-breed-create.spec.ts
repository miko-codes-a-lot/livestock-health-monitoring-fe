import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockBreedCreate } from './livestock-breed-create';

describe('LivestockBreedCreate', () => {
  let component: LivestockBreedCreate;
  let fixture: ComponentFixture<LivestockBreedCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockBreedCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockBreedCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
