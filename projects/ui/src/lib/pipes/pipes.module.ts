import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CutNumberPipe } from './cut-number/cut-number.pipe';
import { SafeHtmlPipe } from './safe-html/safe-html.pipe';


@NgModule({
  declarations: [CutNumberPipe, SafeHtmlPipe],
  exports: [CutNumberPipe, SafeHtmlPipe],
  imports: [
    CommonModule
  ]
})
export class DmPipesModule { }
