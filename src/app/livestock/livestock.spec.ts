import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Livestock } from './livestock';

describe('Livestock', () => {
  let component: Livestock;
  let fixture: ComponentFixture<Livestock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Livestock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Livestock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
