import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenSendPage } from './token-send.page';

describe('TokenSendPage', () => {
  let component: TokenSendPage;
  let fixture: ComponentFixture<TokenSendPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenSendPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenSendPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
