import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { SpeckleRenderer } from './renderer/SpeckleRenderer';
import { RendererPipelineMethod } from './renderer/SpeckleRenderer.model';
import {
  DesignOptionSize,
  ViewDescriptorBean,
} from '../../models/renderer.model';
import { UNIT_TYPE_COLORS } from '../../constants/unit-type-colors.constant';

@Component({
  selector: 'dm-speckle-renderer',
  templateUrl: './speckle-renderer.component.html',
  styleUrls: ['./speckle-renderer.component.scss'],
})
export class SpeckleRendererComponent
  implements OnInit, OnDestroy, AfterViewInit {
  mode3D = false;
  @ViewChild('rendererWrapper', { static: true }) wrapper: ElementRef;
  @Input()
  renderToImage = false;
  @Output() imageDataReady = new EventEmitter<string>();
  private renderer: SpeckleRenderer;
  private localSize: DesignOptionSize;
  private localDataObjects;
  private localImageData: string = null;
  private localDisableControls = false;
  private localViewType: ViewDescriptorBean;
  private listeners: Array<() => void> = [];
  private VIEWER_DEFAULTS = {
    showEdges: false,
    edgesThreshold: 45,
    castShadows: false,
    meshOverrides: {
      opacity: 84,
      specular: 30,
    },
  };

  constructor(
    private readonly renderer2: Renderer2,
    private readonly ref: ChangeDetectorRef
  ) {}

  @Input()
  public get viewType(): ViewDescriptorBean {
    return this.localViewType;
  }

  public set viewType(value: ViewDescriptorBean) {
    if (value) {
      const viewWasChanged = this.localViewType && this.localViewType !== value;
      this.localViewType = value;

      if (viewWasChanged && this.renderToImage) {
        this.reInitRenderer();
      } else if (this.mode3D) {
        this.setCamera();
      }
    }
  }

  @Input()
  get imageData(): string {
    return this.localImageData;
  }

  set imageData(value: string) {
    if (value && value !== this.localImageData) {
      this.localImageData = value;
      if (this.renderToImage && this.wrapper.nativeElement) {
        this.destroyRenderer();
        this.ref.detectChanges();
      }
    }
  }

  get dataObjects() {
    return this.localDataObjects;
  }

  @Input()
  set dataObjects(value) {
    if (!value) {
      return;
    }
    this.unloadObjects();
    this.localDataObjects = value;
    this.processObjects(this.localDataObjects);

    // handling objects append to existing renderer
    if (this.renderer) {
      this.runDefaultPipeline();
    }
  }

  @Input()
  get disableControls() {
    return this.localDisableControls;
  }

  set disableControls(value) {
    const valueWasChanged =
      this.localDisableControls !== value &&
      ((value && this.mode3D) || (!value && !this.mode3D));
    this.localDisableControls = value;
    if (valueWasChanged) {
      this.reInitRenderer();
    }
  }

  @Input()
  get size(): DesignOptionSize {
    return this.localSize;
  }

  set size(value: DesignOptionSize) {
    if (value) {
      const sizeWasChanged = this.localSize && this.localSize !== value;
      this.localSize = value;

      if (sizeWasChanged) {
        this.reInitRenderer();
      }
    }
  }

  // we need to use method to ensure that `this` is available for pipeline methods
  getDefaultRenderPipeline(): RendererPipelineMethod[] {
    return [
      (renderer) => {
        if (this.dataObjects) {
          renderer.loadObjects({ objs: this.dataObjects, zoomExtents: false });
        }
      },
      (renderer) => renderer.addColorsToColorTable(UNIT_TYPE_COLORS),
      (renderer) =>
        renderer.colorByStringProperty({
          propertyName: 'unit_type',
          propagateLegend: false,
        }),
      (renderer, settings = {}) => {
        if (this.viewType && this.viewType.cameraDescriptor) {
          renderer.setCameraByDescriptor(
            this.viewType.cameraDescriptor,
            settings.delay || 600
          );
        } else {
          renderer.zoomExtents(0.6);
        }
      },
    ];
  }

  @HostListener('window:keydown', ['$event']) onKeydown(e) {
    if (this.disableControls) {
      return;
    }
    // 37-40 is arrow keys. We only wants to prevent them from bubbling
    const valuesToPrevent = [37, 38, 39, 40];

    if (valuesToPrevent.includes(e.keyCode)) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.initRenderer();
  }

  async convertToImage() {
    if (this.imageData || !this.localDataObjects) {
      return;
    }

    this.ref.detectChanges();

    const data = await SpeckleRenderer.renderObjectToImage(
      { domObject: this.wrapper.nativeElement },
      this.VIEWER_DEFAULTS,
      {
        size: this.size,
        dataObjects: this.localDataObjects,
        // @ts-expect-error
        pipeline: this.getDefaultRenderPipeline(),
      }
    );
    // @ts-expect-error
    this.imageDataReady.emit(data);
    return data;
  }

  zoom(zoomIn: boolean) {
    if (this.renderer && this.mode3D) {
      this.renderer.zoom(zoomIn ? 0.2 : -0.2);
    }
  }

  ngOnDestroy() {
    this.destroyRenderer();
  }

  private initRenderer() {
    if (this.renderToImage) {
      return this.convertToImage();
    }

    this.renderer = new SpeckleRenderer(
      { domObject: this.wrapper.nativeElement },
      this.VIEWER_DEFAULTS,
      {
        allowZoom: this.disableControls,
        selectable: !this.disableControls,
        disableControls: this.disableControls,
        instantPositioning: false,
        // @ts-expect-error
        pipeline: [
          (renderer) => renderer.animate(),
          ...this.getDefaultRenderPipeline(),
        ],
      }
    );

    this.mode3D = true;

    if (!this.disableControls) {
      const unListen = this.renderer2.listen(
        this.wrapper.nativeElement,
        'wheel',
        (event) => {
          event.preventDefault();
          event.returnValue = false;
        }
      );

      this.listeners.push(unListen);
    }
  }

  private reInitRenderer() {
    this.destroyRenderer();
    this.clearStoredImage();
    this.ref.detectChanges();
    this.initRenderer();
  }

  private clearStoredImage() {
    this.imageDataReady.emit(null);
    this.localImageData = null;
  }

  private unloadObjects() {
    if (this.localDataObjects) {
      this.renderer?.unloadObjects({
        objIds: this.localDataObjects.map((obj) => obj.properties.id),
      });
    }
  }

  private runDefaultPipeline() {
    this.getDefaultRenderPipeline().forEach((cb) =>
      // @ts-expect-error
      cb(this.renderer, this.renderer.rendererSettings)
    );
  }

  private setCamera(delay = 600) {
    this.renderer.setCameraByDescriptor(this.viewType.cameraDescriptor, delay);
  }

  private removeListeners() {
    while (this.listeners.length) {
      this.listeners.pop()();
    }
  }

  private processObjects(objects) {
    Object.keys(objects).forEach((key) => {
      const o = objects[key];
      if (typeof o !== 'object') {
        return;
      }
      o.properties = o.properties || {};
      o.properties.id = o._id ? o._id : 'no id';
      o.properties.hash = o.hash ? o.hash : 'no hash';
      o.properties.speckle_type = o.type;
      o.properties.unit_type = o.unit_type;
      o.properties.layer_name = 'no layer';
      o.color = { hex: '#909090', a: 0.65 };
    });
  }

  private destroyRenderer() {
    if (this.mode3D) {
      this.removeListeners();
      this.renderer.destroy();
      this.mode3D = false;
    }
  }
}
