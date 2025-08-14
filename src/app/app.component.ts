import { Component, AfterViewInit, ViewChildren, ElementRef, QueryList, ViewChild, Renderer2, signal } from '@angular/core';
import { CanvasComponent } from './canvas/canvas.component';
import { ToolbarTool } from './canvas/components/toolbar/toolbar.component';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements AfterViewInit {
  title = 'Drawing-app';
  selectedTool = signal<string>('brush');
  selectedColor = signal<string>('rgb(0, 0, 0)');
  isChecked = signal<boolean>(false);
  isClear = signal<boolean>(false);
  brushWidth = signal<number>(5);
  color_Picker = signal<string>('#FFF4F4');

  @ViewChild(CanvasComponent, { static: false }) canvasComponent!: CanvasComponent;

  constructor(private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    // Component is now ready
  }

  onBrushSliderChange(): void {
    // No-op since brush width is managed by signal
  }

  onToolChange(toolId: string): void {
    this.selectedTool.set(toolId);
  }

  onColorChange(color: string): void {
    this.selectedColor.set(color);
  }

  onBrushWidthChange(width: number): void {
    this.brushWidth.set(Number(width));
  }

  onFillToggle(enabled: boolean): void {
    this.isChecked.set(enabled);
  }

  clearCanvas(): void {
    this.isClear.set(true);
    if (this.canvasComponent) {
      this.canvasComponent.clearCanvas();
    }
  }

  saveCanvasImg(): void {
    if (this.canvasComponent) {
      const canvas: HTMLCanvasElement = this.canvasComponent.myCanvas.nativeElement;
      const link = document.createElement('a');
      link.download = `${Date.now()}.jpg`;
      link.href = canvas.toDataURL();
      link.click();
    } else {
      console.error('Canvas component is not available.');
    }
  }
}
