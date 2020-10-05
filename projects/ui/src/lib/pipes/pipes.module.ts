import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CutNumberPipe } from './cut-number/cut-number.pipe';
import { SafeHtmlPipe } from './safe-html/safe-html.pipe';
import { DateByTimezonePipe } from './date-by-timezone/date-by-timezone.pipe';


@NgModule({
  declarations: [CutNumberPipe, SafeHtmlPipe, DateByTimezonePipe],
  exports: [CutNumberPipe, SafeHtmlPipe, DateByTimezonePipe],
  imports: [
    CommonModule
  ]
})
export class DmPipesModule { }
