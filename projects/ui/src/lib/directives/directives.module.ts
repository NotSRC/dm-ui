import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaskDirective } from './mask/mask.directive';
import { DecimalMaskDirective } from './decimal-mask/decimal-mask.directive';
import { IntegerMaskDirective } from './integer-mask/integer-mask.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragAndDropUploadDirective } from './drag-and-drop-upload/drag-and-drop-upload.directive';
import { IsLinkActiveDirective } from './is-link-active/is-link-active.directive';

@NgModule({
  declarations: [
    MaskDirective,
    IntegerMaskDirective,
    DecimalMaskDirective,
    DragAndDropUploadDirective,
    IsLinkActiveDirective,
  ],
  exports: [
    MaskDirective,
    IntegerMaskDirective,
    DecimalMaskDirective,
    DragAndDropUploadDirective,
    IsLinkActiveDirective,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class DmDirectivesModule {}
