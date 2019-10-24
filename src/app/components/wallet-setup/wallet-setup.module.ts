import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletSetupComponent} from './wallet-setup.component';
import { Step1Component} from './steps/step1/step1.component';
import { Step2Component} from './steps/step2/step2.component';
import { Step3Component} from './steps/step3/step3.component';
import { Step4Component} from './steps/step4/step4.component';
import { Step5Component} from './steps/step5/step5.component';
import { Step6Component} from './steps/step6/step6.component';
import { Step7Component} from './steps/step7/step7.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { MustMatchDirective } from './helpers/must-match.directive';

@NgModule({
  declarations: [
    WalletSetupComponent,
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
    Step5Component,
    Step6Component,
    Step7Component,
    MustMatchDirective
  ],
  imports: [
    FormsModule,
    CommonModule,
    IonicModule,
    TranslateModule.forChild()
  ],
  exports:[
    WalletSetupComponent,
    Step1Component
  ]
})
export class WalletSetupModule { }
