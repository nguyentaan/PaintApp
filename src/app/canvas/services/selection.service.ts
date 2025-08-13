import { Injectable } from '@angular/core';

export interface SelectionArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  width: number;
  height: number;
}

export interface CroppedObject {
  imageData: ImageData;
  x: number;
  y: number;
  width: number;
  height: number;
  isDragging: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isSelecting = false;
  private selectionArea: SelectionArea | null = null;
  private croppedObject: CroppedObject | null = null;
  private originalCanvasData: ImageData | null = null;

  constructor() { }

  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  startSelection(x: number, y: number): void {
    if (!this.canvas || !this.ctx) return;

    this.isSelecting = true;
    this.selectionArea = {
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      width: 0,
      height: 0
    };

    // Store the original canvas data
    this.originalCanvasData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  updateSelection(x: number, y: number): void {
    if (!this.isSelecting || !this.selectionArea || !this.ctx || !this.originalCanvasData) return;

    // Update selection area
    this.selectionArea.endX = x;
    this.selectionArea.endY = y;
    this.selectionArea.width = Math.abs(x - this.selectionArea.startX);
    this.selectionArea.height = Math.abs(y - this.selectionArea.startY);

    // Restore original canvas
    this.ctx.putImageData(this.originalCanvasData, 0, 0);

    // Draw selection rectangle
    this.drawSelectionRectangle();
  }

  endSelection(): SelectionArea | null {
    if (!this.isSelecting || !this.selectionArea) return null;

    this.isSelecting = false;
    return this.selectionArea;
  }

  cropSelection(): CroppedObject | null {
    if (!this.selectionArea || !this.ctx) return null;

    const { startX, startY, width, height } = this.selectionArea;
    const normalizedX = Math.min(startX, this.selectionArea.endX);
    const normalizedY = Math.min(startY, this.selectionArea.endY);

    if (width < 5 || height < 5) return null; // Minimum selection size

    // Get the image data from the selected area
    const imageData = this.ctx.getImageData(normalizedX, normalizedY, width, height);

    // Clear the selected area from the canvas
    this.ctx.clearRect(normalizedX, normalizedY, width, height);

    // Create cropped object
    this.croppedObject = {
      imageData,
      x: normalizedX,
      y: normalizedY,
      width,
      height,
      isDragging: false
    };

    // Clear selection
    this.clearSelection();

    return this.croppedObject;
  }

  startDragging(x: number, y: number): boolean {
    if (!this.croppedObject) return false;

    // Check if click is within the cropped object bounds
    const { x: objX, y: objY, width, height } = this.croppedObject;
    if (x >= objX && x <= objX + width && y >= objY && y <= objY + height) {
      this.croppedObject.isDragging = true;
      return true;
    }

    return false;
  }

  dragObject(x: number, y: number): void {
    if (!this.croppedObject || !this.croppedObject.isDragging || !this.ctx || !this.originalCanvasData) return;

    // Clear and redraw canvas with original data
    this.ctx.putImageData(this.originalCanvasData, 0, 0);

    // Update position
    this.croppedObject.x = x - this.croppedObject.width / 2;
    this.croppedObject.y = y - this.croppedObject.height / 2;

    // Draw at new position
    this.drawCroppedObject();
  }

  endDragging(): void {
    if (!this.croppedObject || !this.ctx) return;

    this.croppedObject.isDragging = false;

    // Update the original canvas data to include the object at its new position
    if (this.originalCanvasData) {
      this.originalCanvasData = this.ctx.getImageData(0, 0, this.canvas!.width, this.canvas!.height);
    }
  }

  commitObject(): void {
    if (!this.croppedObject || !this.ctx) return;

    // The object is already drawn on the canvas, just clear the cropped object reference
    this.croppedObject = null;
  }

  cancelSelection(): void {
    if (this.originalCanvasData && this.ctx) {
      this.ctx.putImageData(this.originalCanvasData, 0, 0);
    }
    this.clearSelection();
  }

  private drawSelectionRectangle(): void {
    if (!this.selectionArea || !this.ctx) return;

    const { startX, startY, endX, endY } = this.selectionArea;
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    // Save current context state
    this.ctx.save();

    // Draw selection rectangle
    this.ctx.strokeStyle = '#007acc';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(x, y, width, height);

    // Draw corner handles
    const handleSize = 8;
    this.ctx.fillStyle = '#007acc';
    this.ctx.setLineDash([]);

    // Corner handles
    this.ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
    this.ctx.fillRect(x + width - handleSize/2, y - handleSize/2, handleSize, handleSize);
    this.ctx.fillRect(x - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
    this.ctx.fillRect(x + width - handleSize/2, y + height - handleSize/2, handleSize, handleSize);

    // Restore context state
    this.ctx.restore();
  }

  private drawCroppedObject(): void {
    if (!this.croppedObject || !this.ctx) return;

    const { imageData, x, y } = this.croppedObject;
    this.ctx.putImageData(imageData, x, y);

    // Draw selection border around dragged object
    this.ctx.save();
    this.ctx.strokeStyle = '#007acc';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([3, 3]);
    this.ctx.strokeRect(x, y, imageData.width, imageData.height);
    this.ctx.restore();
  }

  private redrawCanvas(): void {
    if (!this.originalCanvasData || !this.ctx) return;
    this.ctx.putImageData(this.originalCanvasData, 0, 0);
  }

  private clearSelection(): void {
    this.selectionArea = null;
    this.isSelecting = false;
    this.originalCanvasData = null;
  }

  // Getters
  get hasSelection(): boolean {
    return this.selectionArea !== null;
  }

  get hasCroppedObject(): boolean {
    return this.croppedObject !== null;
  }

  get isDragging(): boolean {
    return this.croppedObject?.isDragging || false;
  }

  get currentSelection(): SelectionArea | null {
    return this.selectionArea;
  }

  get currentCroppedObject(): CroppedObject | null {
    return this.croppedObject;
  }
}
