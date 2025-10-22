import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivestockCreate } from './livestock-group-create';

describe('LivestockCreate', () => {
  let component: LivestockCreate;
  let fixture: ComponentFixture<LivestockCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivestockCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivestockCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
