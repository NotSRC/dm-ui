import { FileService } from './../file/file.service';
import { ApiConfig } from './../../models/api-config.model';
import { FileApiService } from './file-api.service';
import { ModuleWithProviders, NgModule } from '@angular/core';


@NgModule({
  providers: [
    FileApiService,
    FileService
  ],
})
export class FileApiServiceModule {

  static forRoot(config: ApiConfig): ModuleWithProviders<FileApiServiceModule> {
    return {
      ngModule: FileApiServiceModule,
      providers: [
        { provide: ApiConfig, useValue: config }
      ],
    };
  }
}
