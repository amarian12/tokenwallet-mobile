import { Directive, Input} from '@angular/core';
import { NG_VALIDATORS, Validator, ValidationErrors, FormControl } from '@angular/forms';
import { MnemonicExistValidate } from './mnemonic-exist.validator';


@Directive({
  selector: '[mnemonicExist]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MnemonicExistDirective, multi: true }]
})

export class MnemonicExistDirective implements Validator{


  validate(ctl: FormControl): ValidationErrors | null {
    return MnemonicExistValidate(ctl);
  }
}
