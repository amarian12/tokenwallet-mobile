import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MustMatchDirective } from './must-match.directive';
import { MnemonicValidDirective } from './mnemonic-valid.directive';
import { MnemonicExistDirective } from './mnemonic-exist.directive';

@NgModule({
  declarations: [
    MnemonicExistDirective,
    MustMatchDirective,
    MnemonicValidDirective
  ],
  imports: [
    CommonModule
  ],
  exports:[
    MnemonicExistDirective,
    MustMatchDirective,
    MnemonicValidDirective
  ]
})
export class ValidatorsModule { }
