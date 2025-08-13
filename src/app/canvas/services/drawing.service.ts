import { Injectable } from '@angular/core';

export interface DrawingState {
  tool: string;
  color: string;
  width: number;
  fillEnabled: boolean;
}

export interface CanvasHistoryItem {
  imageData: ImageData;
}

@Injectable({
  providedIn: 'root'
})
export class DrawingService {
  private undoStack: CanvasHistoryItem[] = [];
  private redoStack: CanvasHistoryItem[] = [];

  constructor() { }

  saveState(imageData: ImageData): void {
    this.undoStack.push({ imageData });
    this.redoStack = []; // Clear redo stack when new state is saved
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  undo(currentImageData: ImageData): ImageData | null {
    if (this.undoStack.length > 0) {
      const lastState = this.undoStack.pop();
      this.redoStack.push({ imageData: currentImageData });
      return lastState?.imageData || null;
    }
    return null;
  }

  redo(currentImageData: ImageData): ImageData | null {
    if (this.redoStack.length > 0) {
      const nextState = this.redoStack.pop();
      this.undoStack.push({ imageData: currentImageData });
      return nextState?.imageData || null;
    }
    return null;
  }

  clearHistory(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  initializeCanvasBackground(context: CanvasRenderingContext2D, color: string = '#fff'): void {
    context.fillStyle = color;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  }
}
