import { FormGroup } from '@angular/forms';

// custom validator to check that two fields match
export function MnemonicValidate(checkWord1: string, checkWord2: string, checkWord3:string, w1:string, w2:string, w3:string) {
    return (formGroup: FormGroup) => {
        const word1 = formGroup.controls[checkWord1];
        const word2 = formGroup.controls[checkWord2];
        const word3 = formGroup.controls[checkWord3];
        
        // return null if controls haven't initialised yet
        if (!word1 || !word2 || !word3) {
          return null;
        }

        // return null if another validator has already found an error on the matchingControl
        if ( word3.errors && !word3.errors.notWords) {
            return null;
        }
        if ( word2.errors && !word2.errors.notWords) {
            return null;
        }
        if ( word1.errors && !word1.errors.notWords) {
            return null;
        }

        // set error on word1 if validation fails
        if (word1.value !== w1) {
            word1.setErrors({ notWords: true });
        } else {
            word1.setErrors(null);
        }
        // set error on word2 if validation fails
        if (word2.value !== w2) {
            word2.setErrors({ notWords: true });
        } else {
            word2.setErrors(null);
        }
        // set error on word3 if validation fails
        if (word3.value !== w3) {
            word3.setErrors({ notWords: true });
        } else {
            word3.setErrors(null);
        }

    }
}
