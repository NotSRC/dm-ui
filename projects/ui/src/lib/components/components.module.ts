import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderComponent } from './loader/loader.component';
import { TextareaComponent } from './textarea/textarea.component';
import { AttachFileComponent } from './attach-file/attach-file.component';

@NgModule({
  declarations: [SearchComponent, LoaderComponent, TextareaComponent, AttachFileComponent],
  exports: [SearchComponent, LoaderComponent, TextareaComponent, AttachFileComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule
  ]
})
export class DmComponentsModule { }
