import { Component } from '@angular/core';
import { SIMPLE_SPECKLE_OBJECT_WITH_PARCEL } from './speckle-objects.mock';
import { ViewDescriptorBean } from '../../projects/ui/src/lib/models/renderer.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  rend = true;
  dataObjects = SIMPLE_SPECKLE_OBJECT_WITH_PARCEL;
  viewType = {
    viewType: 'PARCEL-ISOMETRY-VIEW',
    cameraDescriptor: {
      position: { x: 110, y: 316, z: -192 },
      rotation: { x: 0, y: 0, z: 1 },
      target: { x: 110, y: 99, z: 25 },
    },
  };

  cameraChanged(event: ViewDescriptorBean) {
    const pos = event.cameraDescriptor.position;
    this.viewType.cameraDescriptor.position.x = pos.x;
    this.viewType.cameraDescriptor.position.y = pos.y;
    this.viewType.cameraDescriptor.position.z = pos.z;
  }
}
