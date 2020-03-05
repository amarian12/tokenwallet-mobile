import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePinPage } from './change-pin.page';

describe('ChangePinPage', () => {
  let component: ChangePinPage;
  let fixture: ComponentFixture<ChangePinPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangePinPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePinPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
