import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSpieltagComponent } from './edit-spieltag.component';

describe('EditSpieltagComponent', () => {
  let component: EditSpieltagComponent;
  let fixture: ComponentFixture<EditSpieltagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSpieltagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSpieltagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
