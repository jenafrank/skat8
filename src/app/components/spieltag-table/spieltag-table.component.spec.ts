import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpieltagTableComponent } from './spieltag-table.component';

describe('SpieltagTableComponent', () => {
  let component: SpieltagTableComponent;
  let fixture: ComponentFixture<SpieltagTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpieltagTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpieltagTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
