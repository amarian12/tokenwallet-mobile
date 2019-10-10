import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Step5Component } from './step5.component';

describe('Step5Component', () => {
  let component: Step5Component;
  let fixture: ComponentFixture<Step5Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Step5Component ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Step5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
