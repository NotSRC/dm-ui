import {
  AfterViewInit,
  ChangeDetectionStrategy,
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
  ObjectDisplayDescriptor,
  RefinedMetadataGroup,
  ViewDescriptorBean,
  ViewMode,
  ViewModeMetadata,
} from '../../models/renderer.model';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import merge from 'lodash.merge';
import { Vector3 } from 'three';

@Component({
  selector: 'dm-speckle-renderer',
  templateUrl: './speckle-renderer.component.html',
  styleUrls: ['./speckle-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeckleRendererComponent
  implements OnInit, OnDestroy, AfterViewInit {
  mode3D = false;

  private renderer: SpeckleRenderer;

  private localSize: DesignOptionSize;
  private localDataObjects;
  private localImageData: string = null;
  private localDisableControls = false;
  private localViewType: ViewDescriptorBean;
  private localViewMode: ViewMode = 'building';
  private localViewModeMetadata: ViewModeMetadata[];
  private refinedMetadataGroups: RefinedMetadataGroup[] = null;
  private displayModeTable: { [key: string]: ObjectDisplayDescriptor } = null;
  private listeners: Array<() => void> = [];

  private DEFAULT_DISPLAY_DESCRIPTOR: ObjectDisplayDescriptor = {
    color: [200, 200, 200],
    alpha: 0.5,
  };

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

  @ViewChild('rendererWrapper', { static: true }) wrapper: ElementRef;

  @Output() imageDataReady = new EventEmitter<string>();
  @Output() cameraChanged = new EventEmitter<ViewDescriptorBean>();

  @Input() renderToImage = false;

  @Input()
  get viewType(): ViewDescriptorBean {
    return this.localViewType;
  }

  set viewType(value: ViewDescriptorBean) {
    if (value) {
      const viewWasChanged = this.localViewType && this.localViewType !== value;
      this.localViewType = value;
      if (viewWasChanged && !this.renderToImage) {
        this.setCamera();
      }
    }
  }

  @Input()
  get viewModeMetadata(): ViewModeMetadata[] {
    return this.localViewModeMetadata;
  }

  set viewModeMetadata(value: ViewModeMetadata[]) {
    if (value) {
      const viewWasChanged =
        this.localViewMode &&
        JSON.stringify(this.localViewModeMetadata) !== JSON.stringify(value);
      this.localViewModeMetadata = value;
      if (viewWasChanged) {
        this.refineViewModeMetadata();
        if (!this.renderToImage) {
          this.runBasicPipeline(true);
        }
      }
    }
  }

  @Input()
  get viewMode(): ViewMode {
    return this.localViewMode;
  }

  set viewMode(value: ViewMode) {
    if (value) {
      const viewWasChanged = this.localViewMode && this.localViewMode !== value;
      this.localViewMode = value;
      if (viewWasChanged && !this.renderToImage) {
        this.refineViewModeMetadata();
        this.runBasicPipeline(true);
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

  get dataObjects() {
    return this.localDataObjects;
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
  getBasicRenderPipeline(noReload = false): RendererPipelineMethod[] {
    return [
      (renderer) => {
        if (this.dataObjects && !noReload) {
          renderer.loadObjects({ objs: this.dataObjects, zoomExtents: false });
        }
      },
      (renderer) => {
        if (this.displayModeTable) {
          renderer?.registerColorAndOpacity(this.displayModeTable);
        }
      },
      (renderer) => {
        if (this.refinedMetadataGroups) {
          this.refinedMetadataGroups.forEach((group) =>
            renderer?.applyColorAndOpacityByStringProperty(group.field)
          );
        }
      },
    ];
  }

  getCameraPipeline(): RendererPipelineMethod[] {
    return [
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
        pipeline: [
          ...this.getBasicRenderPipeline(),
          ...this.getCameraPipeline(),
        ],
      }
    );
    this.imageDataReady.emit(data);
    return data;
  }

  zoom(zoomIn: boolean) {
    if (this.renderer && this.mode3D) {
      this.renderer.zoom(zoomIn ? 0.2 : -0.2);
    }
  }

  handleViewModeChange(e: MatButtonToggleChange) {
    this.viewMode = e.value;
  }

  ngOnDestroy() {
    this.destroyRenderer();
  }

  private initRenderer() {
    if (this.renderToImage) {
      return this.convertToImage();
    }

    this.refineViewModeMetadata();
    this.renderer = new SpeckleRenderer(
      { domObject: this.wrapper.nativeElement },
      this.VIEWER_DEFAULTS,
      {
        allowZoom: this.disableControls,
        selectable: false,
        disableControls: this.disableControls,
        instantPositioning: true,
        pipeline: [
          (renderer) => renderer.animate(),
          ...this.getBasicRenderPipeline(),
          ...this.getCameraPipeline(),
        ],
      }
    );

    this.renderer.onCameraMove((event) => {
      this.cameraChanged.emit(this.getViewTypeWithNewPosition(event));
    });

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

  private getViewTypeWithNewPosition(event: Vector3) {
    return JSON.parse(
      JSON.stringify({
        ...this.viewType,
        cameraDescriptor: {
          ...this.viewType.cameraDescriptor,
          position: { x: event.x, y: event.y, z: event.z },
        },
      })
    );
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

  private runBasicPipeline(noReload = false) {
    if (this.renderer) {
      this.getBasicRenderPipeline(noReload).forEach((cb) =>
        cb(this.renderer, this.renderer.rendererSettings)
      );
    }
  }

  private runDefaultPipeline(noReload = false) {
    [
      ...this.getBasicRenderPipeline(noReload),
      ...this.getCameraPipeline(),
    ].forEach((cb) => cb(this.renderer, this.renderer.rendererSettings));
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
      o.color = { hex: '#9090FF', a: 0.65 };
    });
  }

  private destroyRenderer() {
    if (this.mode3D) {
      this.removeListeners();
      this.renderer.destroy();
      this.mode3D = false;
    }
  }

  private refineViewModeMetadata() {
    if (!this.viewMode || !this.viewModeMetadata) {
      return;
    }

    const mergedViewModesMetadata: ViewModeMetadata = merge(
      ...this.viewModeMetadata
    );

    this.refinedMetadataGroups = Object.keys(
      mergedViewModesMetadata.groups
    ).reduce((acc, key) => {
      const currentGroup = mergedViewModesMetadata.groups[key];
      const refinedGroup = currentGroup
        .map((element) => {
          const filterExpression: string = element.filter;
          const filterAsArray = /^\['([a-z|A-Z|0-9]{1,})'\].*'([a-z, A-Z,0-9]{1,})'/gi.exec(
            filterExpression
          );
          return (
            filterAsArray && {
              field: filterAsArray[1],
              value: filterAsArray[2],
              modeSelector: key,
            }
          );
        })
        .filter((x) => !!x);
      acc.push(...refinedGroup);
      return acc;
    }, []);

    const currentMode = mergedViewModesMetadata.modes[this.viewMode];
    const modes = this.refinedMetadataGroups.reduce(
      (acc, descriptor: RefinedMetadataGroup) => {
        acc[descriptor.value] = currentMode[descriptor.modeSelector];
        return acc;
      },
      {}
    );

    modes['all else'] = currentMode.other || this.DEFAULT_DISPLAY_DESCRIPTOR;
    this.displayModeTable = modes;
  }
}
