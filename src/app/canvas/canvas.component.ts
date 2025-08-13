import { Component, ElementRef, OnInit, ViewChild, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { DrawingService } from './services/drawing.service';
import { ShapeDrawingService } from './services/shape-drawing.service';
import { FloodFillService } from './services/flood-fill.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
  @ViewChild('canvas', { static: true }) myCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() selectedTool!: string;
  @Input() checked!: boolean;
  @Input() brushWidth!: number;
  @Input() selectedColor!: string;
  @Output() clearCanvasEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  private isDrawing: boolean = false;
  private startX: number = 0;
  private startY: number = 0;
  private snapshot: ImageData | null = null;
  canvasWidth: number = this.getDefaultWidth();
  canvasHeight: number = this.getDefaultHeight();

  // Zoom and Pan properties
  private zoomLevel: number = 1;
  private panX: number = 0;
  private panY: number = 0;
  private isPanMode: boolean = false;
  private isPanning: boolean = false;
  private lastPanX: number = 0;
  private lastPanY: number = 0;

  constructor(
    private drawingService: DrawingService,
    private shapeDrawingService: ShapeDrawingService,
    private floodFillService: FloodFillService
  ) { }

  private getDefaultWidth(): number {
    // Set canvas width to screen width, with some padding for UI elements
    return Math.max(800, window.innerWidth - 100);
  }

  private getDefaultHeight(): number {
    // Set canvas height to screen height, with padding for toolbars
    return Math.max(600, window.innerHeight - 150);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // Optionally update canvas size on window resize if using screen-based dimensions
    // This could be made optional based on user preference
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    const context = canvas.getContext('2d');
    if (context) {
      this.setCanvasSize(canvas);
      this.updateCanvasSize();
      this.drawingService.initializeCanvasBackground(context);
      this.registerEventListeners(canvas);
    } else {
      console.error('Could not get canvas context');
    }
  }

  private setCanvasSize(canvas: HTMLCanvasElement): void {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  public updateCanvasSize(): void {
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;

    const context = canvas.getContext('2d');
    if (context) {
      this.drawingService.initializeCanvasBackground(context);
    } else {
      console.error('Could not get canvas context');
    }
  }

  public undo(): void {
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    const context = canvas.getContext("2d");
    if (!context) return;

    const currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const previousState = this.drawingService.undo(currentImageData);
    if (previousState) {
      context.putImageData(previousState, 0, 0);
    }
  }

  public redo(): void {
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    const context = canvas.getContext("2d");
    if (!context) return;

    const currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const nextState = this.drawingService.redo(currentImageData);
    if (nextState) {
      context.putImageData(nextState, 0, 0);
    }
  }

  public canUndo(): boolean {
    return this.drawingService.canUndo();
  }

  public canRedo(): boolean {
    return this.drawingService.canRedo();
  }

  public onWidthChange(width: number): void {
    this.canvasWidth = width;
  }

  public onHeightChange(height: number): void {
    this.canvasHeight = height;
  }

  // Zoom and Pan methods
  public onZoomChange(zoomPercent: number): void {
    this.zoomLevel = zoomPercent / 100;
    this.applyCanvasTransform();
  }

  public onZoomReset(): void {
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
    this.applyCanvasTransform();
  }

  public onPanModeToggle(isPanMode: boolean): void {
    this.isPanMode = isPanMode;
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    canvas.style.cursor = isPanMode ? 'grab' : 'crosshair';
  }

  public onCenterCanvas(): void {
    this.panX = 0;
    this.panY = 0;
    this.applyCanvasTransform();
  }

  private applyCanvasTransform(): void {
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    canvas.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoomLevel})`;
  }

  // Pan methods
  private startPan(e: MouseEvent): void {
    this.isPanning = true;
    this.lastPanX = e.clientX;
    this.lastPanY = e.clientY;
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    canvas.style.cursor = 'grabbing';
  }

  private doPan(e: MouseEvent): void {
    if (!this.isPanning) return;

    const deltaX = e.clientX - this.lastPanX;
    const deltaY = e.clientY - this.lastPanY;

    this.panX += deltaX;
    this.panY += deltaY;

    this.lastPanX = e.clientX;
    this.lastPanY = e.clientY;

    this.applyCanvasTransform();
  }

  private stopPan(): void {
    this.isPanning = false;
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    canvas.style.cursor = this.isPanMode ? 'grab' : 'crosshair';
  }

  private startDraw(e: MouseEvent): void {
    // Don't start drawing if in pan mode
    if (this.isPanMode) {
      this.startPan(e);
      return;
    }

    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    this.isDrawing = true;
    this.startX = e.offsetX;
    this.startY = e.offsetY;

    // Save state for undo functionality
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    this.drawingService.saveState(imageData);

    context.beginPath();
    context.lineWidth = this.brushWidth;
    context.strokeStyle = this.selectedColor;
    context.fillStyle = this.selectedColor;
    this.snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
  }

  private drawing(e: MouseEvent): void {
    // Handle panning if in pan mode
    if (this.isPanMode) {
      this.doPan(e);
      return;
    }

    if (!this.isDrawing) return;
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    const context = canvas.getContext('2d');
    if (!context || !this.snapshot) return;

    // Restore the snapshot for shape drawing
    if (this.selectedTool !== 'brush' && this.selectedTool !== 'eraser') {
      context.putImageData(this.snapshot, 0, 0);
    }

    switch (this.selectedTool) {
      case 'brush':
        this.shapeDrawingService.drawBrushStroke(context, e.offsetX, e.offsetY, this.selectedColor, this.brushWidth);
        break;
      case 'eraser':
        this.shapeDrawingService.drawEraser(context, e.offsetX, e.offsetY, this.brushWidth);
        break;
      case 'fill':
        const fillColor = this.floodFillService.parseColorToRgba(this.selectedColor);
        this.floodFillService.floodFill(context, this.startX, this.startY, fillColor);
        break;
      case 'line':
        this.shapeDrawingService.drawLine(context, this.startX, this.startY, e.offsetX, e.offsetY, this.selectedColor, this.brushWidth);
        break;
      case 'rectangle':
        this.shapeDrawingService.drawRectangle(context, this.startX, this.startY, e.offsetX, e.offsetY, this.selectedColor, this.brushWidth, this.checked);
        break;
      case 'circle':
        this.shapeDrawingService.drawCircle(context, this.startX, this.startY, e.offsetX, e.offsetY, this.selectedColor, this.brushWidth, this.checked);
        break;
      case 'triangle':
        this.shapeDrawingService.drawTriangle(context, this.startX, this.startY, e.offsetX, e.offsetY, this.selectedColor, this.brushWidth, this.checked);
        break;
      case 'pentagon':
        this.shapeDrawingService.drawPentagon(context, this.startX, this.startY, e.offsetX, e.offsetY, this.selectedColor, this.brushWidth, this.checked);
        break;
    }
  }

  private stopDraw(): void {
    this.isDrawing = false;
    // Also stop panning if it was active
    if (this.isPanning) {
      this.stopPan();
    }
  }

  public clearCanvas(): void {
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Save current state before clearing
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    this.drawingService.saveState(imageData);

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    this.drawingService.clearHistory();
    this.clearCanvasEvent.emit(true);
    this.drawingService.initializeCanvasBackground(context);
  }

  private registerEventListeners(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('mousedown', this.startDraw.bind(this));
    canvas.addEventListener('mousemove', this.drawing.bind(this));
    canvas.addEventListener('mouseup', this.stopDraw.bind(this));
    canvas.addEventListener('mouseleave', this.stopDraw.bind(this));
  }
}
