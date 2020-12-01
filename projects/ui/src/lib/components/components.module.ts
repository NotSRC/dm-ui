import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderComponent } from './loader/loader.component';
import { TextareaComponent } from './textarea/textarea.component';
import { AttachFileComponent } from './attach-file/attach-file.component';
import { SpeckleRendererComponent } from './speckle-renderer/speckle-renderer.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

const COMPONENTS_LIST = [
  SearchComponent,
  LoaderComponent,
  TextareaComponent,
  AttachFileComponent,
  SpeckleRendererComponent
];

@NgModule({
  declarations: COMPONENTS_LIST,
  exports: COMPONENTS_LIST,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule
  ]
})
export class DmComponentsModule { }
