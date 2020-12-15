import { ViewDescriptorBean, ViewModeMetadata } from './../../projects/ui/src/lib/models/renderer.model';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SAMPLE_RESOURCE_OBJECTS, SAMPLE_RESPONSE, SAMPLE_METADATA } from 'src/mocks/speckle-objects.mock';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'dm-ui';
  form = new FormGroup({
    title: new FormControl('<b>ba</b>', [Validators.required]),
  });
  viewMode: 'program' | 'building'  = 'building';
  speckleObjects = SAMPLE_RESOURCE_OBJECTS;
  cameraDscr: ViewDescriptorBean = SAMPLE_RESPONSE.building_data.camera;
  viewModeMetadata: ViewModeMetadata[] = [SAMPLE_METADATA];

  reset() {
    this.form.get('title').disable();
    // this.form.reset();
  }

  uploadFile(event) {
    console.log(event);
  }
}
