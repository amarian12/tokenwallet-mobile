import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenReceivePage } from './token-receive.page';

describe('TokenReceivePage', () => {
  let component: TokenReceivePage;
  let fixture: ComponentFixture<TokenReceivePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenReceivePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenReceivePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
