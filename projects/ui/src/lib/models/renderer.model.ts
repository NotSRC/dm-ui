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


export type ViewMode = 'program' | 'building';

export interface RefinedMetadataGroup {
  field: string;
  value: string;
  modeSelector: string;
}

export interface MetadataGroup {
  filter: string;
}

export interface MetadataGroups {
  [key: string]: MetadataGroup[];
}

export interface ObjectDisplayDescriptor {
  color: number[];
  alpha: number;
}

export interface ViewModeMetadata {
  groups: MetadataGroups;
  modes: {
    [key in ViewMode]: {
      [key: string]: ObjectDisplayDescriptor
    }
  };
}

