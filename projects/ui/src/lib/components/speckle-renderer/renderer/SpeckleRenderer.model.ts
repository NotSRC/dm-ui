import { SpeckleRenderer } from './SpeckleRenderer';

export type RendererPipelineMethod = (
  cb: SpeckleRenderer,
  settings: { [key: string]: any }
) => void;
