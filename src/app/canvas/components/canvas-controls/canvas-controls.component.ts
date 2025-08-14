import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

@Component({
    selector: 'app-canvas-controls',
    templateUrl: './canvas-controls.component.html',
    styleUrls: ['./canvas-controls.component.scss'],
    standalone: false
})
export class CanvasControlsComponent {
  @Input() canvasWidth: number = this.getDefaultWidth();
  @Input() canvasHeight: number = this.getDefaultHeight();
  @Input() canUndo: boolean = false;
  @Input() canRedo: boolean = false;

  @Output() widthChange = new EventEmitter<number>();
  @Output() heightChange = new EventEmitter<number>();
  @Output() undoAction = new EventEmitter<void>();
  @Output() redoAction = new EventEmitter<void>();
  @Output() sizeUpdate = new EventEmitter<void>();
  @Output() zoomChange = new EventEmitter<number>();
  @Output() zoomReset = new EventEmitter<void>();
  @Output() panModeToggle = new EventEmitter<boolean>();
  @Output() centerCanvas = new EventEmitter<void>();

  zoomLevel = signal<number>(100);
  canvasX = signal<number>(0);
  canvasY = signal<number>(0);
  isPanMode = signal<boolean>(false);

  constructor() { }

  private getDefaultWidth(): number {
    // Set canvas width to screen width, with some padding for UI elements
    return Math.max(800, window.innerWidth - 100);
  }

  private getDefaultHeight(): number {
    // Set canvas height to screen height, with padding for toolbars
    return Math.max(600, window.innerHeight - 150);
  }

  onWidthChange(): void {
    // Ensure width is within reasonable bounds
    if (this.canvasWidth < 100) this.canvasWidth = 100;
    if (this.canvasWidth > 4000) this.canvasWidth = 4000;

    this.widthChange.emit(this.canvasWidth);
    this.sizeUpdate.emit();
  }

  onHeightChange(): void {
    // Ensure height is within reasonable bounds
    if (this.canvasHeight < 100) this.canvasHeight = 100;
    if (this.canvasHeight > 4000) this.canvasHeight = 4000;

    this.heightChange.emit(this.canvasHeight);
    this.sizeUpdate.emit();
  }

  setCanvasSize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.widthChange.emit(this.canvasWidth);
    this.heightChange.emit(this.canvasHeight);
    this.sizeUpdate.emit();
  }

  setScreenSize(): void {
    const screenWidth = this.getDefaultWidth();
    const screenHeight = this.getDefaultHeight();
    this.setCanvasSize(screenWidth, screenHeight);
  }

  isScreenSize(): boolean {
    const screenWidth = this.getDefaultWidth();
    const screenHeight = this.getDefaultHeight();
    return this.canvasWidth === screenWidth && this.canvasHeight === screenHeight;
  }

  onUndo(): void {
    if (this.canUndo) {
      this.undoAction.emit();
    }
  }

  onRedo(): void {
    if (this.canRedo) {
      this.redoAction.emit();
    }
  }

  // Zoom controls
  onZoomIn(): void {
    this.zoomLevel.set(Math.min(500, this.zoomLevel() + 25));
    this.zoomChange.emit(this.zoomLevel());
  }

  onZoomOut(): void {
    this.zoomLevel.set(Math.max(25, this.zoomLevel() - 25));
    this.zoomChange.emit(this.zoomLevel());
  }

  onZoomReset(): void {
    this.zoomLevel.set(100);
    this.canvasX.set(0);
    this.canvasY.set(0);
    this.zoomReset.emit();
  }

  // Pan mode toggle
  onTogglePanMode(): void {
    this.isPanMode.set(!this.isPanMode());
    this.panModeToggle.emit(this.isPanMode());
  }

  onCenterCanvas(): void {
    this.canvasX.set(0);
    this.canvasY.set(0);
    this.centerCanvas.emit();
  }

  // Zoom level display
  getZoomDisplay(): string {
    return `${this.zoomLevel()}%`;
  }

  getPanModeIcon(): string {
    return this.isPanMode() ? '✋' : '👆';
  }
}
