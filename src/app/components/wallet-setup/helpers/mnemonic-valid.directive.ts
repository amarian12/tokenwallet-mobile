import { Directive, Input} from '@angular/core';
import { NG_VALIDATORS, Validator, ValidationErrors, FormGroup } from '@angular/forms';
import { MnemonicValidate } from './mnemonic-valid.validator';

@Directive({
  selector: '[mnemonicValid]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MnemonicValidDirective, multi: true }]
})
export class MnemonicValidDirective implements Validator{
    @Input('mnemonicValid') words: string[] = [];

    validate(formGroup: FormGroup): ValidationErrors {
      return MnemonicValidate(this.words[0],this.words[1],this.words[2],this.words[3],this.words[4],this.words[5])(formGroup);
    }
}
