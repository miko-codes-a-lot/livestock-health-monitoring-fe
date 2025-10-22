import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockClassificationCreate } from './livestock-classification-create';

describe('LivestockClassificationCreate', () => {
  let component: LivestockClassificationCreate;
  let fixture: ComponentFixture<LivestockClassificationCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockClassificationCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockClassificationCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
