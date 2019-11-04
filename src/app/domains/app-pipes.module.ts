import { NgModule } from '@angular/core';
import {CommonModule} from "@angular/common";

import {CSCDatePipe, CSCAmountPipe, ToNumberPipe} from "./csc.pipes"; // <---

@NgModule({
  declarations:[CSCDatePipe, CSCAmountPipe, ToNumberPipe], // <---
  imports:[CommonModule],
  exports:[CSCDatePipe, CSCAmountPipe, ToNumberPipe] // <---
})

export class CSCPipe{}
