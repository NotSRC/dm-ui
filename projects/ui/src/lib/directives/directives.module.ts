import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaskDirective } from './mask/mask.directive';
import { DecimalMaskDirective } from './decimal-mask/decimal-mask.directive';
import { IntegerMaskDirective } from './integer-mask/integer-mask.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    MaskDirective,
    IntegerMaskDirective,
    DecimalMaskDirective,
  ],
  exports: [
    MaskDirective,
    IntegerMaskDirective,
    DecimalMaskDirective,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class DmDirectivesModule {}
