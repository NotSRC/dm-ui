import { SpeckleRenderer } from './SpeckleRenderer';

export type RendererPipelineMethod = (
  cb: SpeckleRenderer,
  settings: { [key: string]: any }
) => void;

export interface RendererSettings {
  selectable: boolean;
  allowZoom: boolean;
  disableControls: boolean;
  instantPositioning?: boolean;
  imageQueueMode?: boolean;
  pipeline?: RendererPipelineMethod[];
}
