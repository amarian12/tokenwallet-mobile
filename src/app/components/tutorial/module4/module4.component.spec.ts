import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Module4Component } from './module4.component';

describe('Module4Component', () => {
  let component: Module4Component;
  let fixture: ComponentFixture<Module4Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Module4Component ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Module4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
