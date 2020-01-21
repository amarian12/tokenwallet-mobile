import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TutorialComponent } from "./tutorial.component";
import { Module1Component } from "./module1/module1.component";
import { Module2Component } from "./module2/module2.component";
import { Module3Component } from "./module3/module3.component";
import { Module4Component } from "./module4/module4.component";
import { Module5Component } from "./module5/module5.component";
import { TranslateModule } from "@ngx-translate/core";
import { IonicModule } from '@ionic/angular';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: TutorialComponent
  }
];

@NgModule({
  declarations: [
    TutorialComponent,
    Module1Component,
    Module2Component,
    Module3Component,
    Module4Component,
    Module5Component
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes)
  ]
})
export class TutorialModule { }
