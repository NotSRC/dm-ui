import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderComponent } from './loader/loader.component';



@NgModule({
  declarations: [SearchComponent, LoaderComponent],
  exports: [SearchComponent, LoaderComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule
  ]
})
export class DmComponentsModule { }
