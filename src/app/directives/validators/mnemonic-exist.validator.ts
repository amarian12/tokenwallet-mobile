import { FormControl, ValidationErrors } from '@angular/forms';
import { CSCCrypto } from '../../domains/csc-crypto';

// custom validator to check that two fields match
export function MnemonicExistValidate(ctl: FormControl):ValidationErrors {

        const word = ctl;
        const value = ctl.value;


        // return null if controls haven't initialised yet
        if (!value) {
          return {emptyWord: true};
        }

        // return null if another validator has already found an error on the matchingControl
        if ( word.errors && !word.errors.notWords && !word.errors.emptyWord){
            return null;
        }


        // set error on word1 if validation fails
        if (!CSCCrypto.isExistingWord(value.trim().toLowerCase())) {
            return { notWords: true };
        } else {
            return null;
        }



}
