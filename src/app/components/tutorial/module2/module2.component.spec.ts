import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Module2Component } from './module2.component';

describe('Module2Component', () => {
  let component: Module2Component;
  let fixture: ComponentFixture<Module2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Module2Component ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Module2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
