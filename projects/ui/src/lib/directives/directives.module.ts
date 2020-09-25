import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaskDirective } from './mask/mask.directive';
import { DecimalMaskDirective } from './decimal-mask/decimal-mask.directive';
import { IntegerMaskDirective } from './integer-mask/integer-mask.directive';

@NgModule({
  declarations: [MaskDirective, DecimalMaskDirective, IntegerMaskDirective],
  exports: [MaskDirective, DecimalMaskDirective, IntegerMaskDirective],
  imports: [CommonModule],
})
export class DmDirectivesModule {}
