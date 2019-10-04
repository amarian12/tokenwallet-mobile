import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangesPage } from './exchanges.page';

describe('ExchangesPage', () => {
  let component: ExchangesPage;
  let fixture: ComponentFixture<ExchangesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
