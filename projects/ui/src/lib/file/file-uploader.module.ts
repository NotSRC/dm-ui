import { FileService } from './services/file.service';
import { ApiConfig } from '../models/api-config.model';
import { FileApiService } from './services/file-api.service';
import { ModuleWithProviders, NgModule } from '@angular/core';


@NgModule({
  providers: [
    FileApiService,
    FileService
  ],
})
export class FileUploaderModule {

  static forRoot(config: ApiConfig): ModuleWithProviders<FileUploaderModule> {
    return {
      ngModule: FileUploaderModule,
      providers: [
        { provide: ApiConfig, useValue: config }
      ],
    };
  }
}
