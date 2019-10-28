import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletSetupModalComponent } from './wallet-setup-modal.component';

describe('WalletSetupModalComponent', () => {
  let component: WalletSetupModalComponent;
  let fixture: ComponentFixture<WalletSetupModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletSetupModalComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletSetupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
