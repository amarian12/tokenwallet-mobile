import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSendPage } from './contact-send.page';

describe('ContactSendPage', () => {
  let component: ContactSendPage;
  let fixture: ComponentFixture<ContactSendPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactSendPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactSendPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
