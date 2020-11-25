import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeckleRendererComponent } from './speckle-renderer.component';

describe('SpeckleRendererComponent', () => {
  let component: SpeckleRendererComponent;
  let fixture: ComponentFixture<SpeckleRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SpeckleRendererComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeckleRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
