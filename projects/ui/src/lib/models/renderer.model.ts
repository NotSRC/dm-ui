export type DesignOptionSize = 'small' | 'big' | 'full';

export interface ViewDescriptorBean {
  viewType: string;
  cameraDescriptor: CameraDescriptorBean;
}

export interface CameraDescriptorBean {
  position: Coordinates3D;
  rotation: Coordinates3D;
  target: Coordinates3D;
  fov?: number;
}

export interface Coordinates3D {
  x: number;
  y: number;
  z: number;
}
