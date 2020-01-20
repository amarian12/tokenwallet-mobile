import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowSeedPage } from './show-seed.page';

describe('ShowSeedPage', () => {
  let component: ShowSeedPage;
  let fixture: ComponentFixture<ShowSeedPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowSeedPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowSeedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
