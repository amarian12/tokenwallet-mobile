import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletSetupAlertComponent } from './wallet-setup-alert.component';

describe('WalletSetupAlertComponent', () => {
  let component: WalletSetupAlertComponent;
  let fixture: ComponentFixture<WalletSetupAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletSetupAlertComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletSetupAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
