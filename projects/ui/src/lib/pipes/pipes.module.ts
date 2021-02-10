import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { CutNumberPipe } from './cut-number/cut-number.pipe';
import { SafeHtmlPipe } from './safe-html/safe-html.pipe';
import { DateByTimezonePipe } from './date-by-timezone/date-by-timezone.pipe';
import { FileSizePipe } from './file-size/file-size.pipe';

@NgModule({
  declarations: [CutNumberPipe, SafeHtmlPipe, DateByTimezonePipe, FileSizePipe],
  exports: [CutNumberPipe, SafeHtmlPipe, DateByTimezonePipe, FileSizePipe],
  imports: [CommonModule],
  providers: [DatePipe, DecimalPipe],
})
export class DmPipesModule {}
