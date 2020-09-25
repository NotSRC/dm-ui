import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CutNumberPipe } from './cut-number/cut-number.pipe';


@NgModule({
  declarations: [CutNumberPipe],
  exports: [CutNumberPipe],
  imports: [
    CommonModule
  ]
})
export class DmPipesModule { }
