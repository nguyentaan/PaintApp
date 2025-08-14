import { Component, AfterViewInit, ViewChildren, ElementRef, QueryList, ViewChild, Renderer2 } from '@angular/core';
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
  selectedTool: string = 'brush';
  selectedColor: string = 'rgb(0, 0, 0)';
  isChecked: boolean = false;
  isClear: boolean = false;
  brushWidth: number = 5;
  color_Picker: string = '#FFF4F4';

  @ViewChild(CanvasComponent, { static: false }) canvasComponent!: CanvasComponent;

  constructor(private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    // Component is now ready
  }

  onBrushSliderChange(): void {
    this.brushWidth = this.brushWidth;
  }

  onToolChange(toolId: string): void {
    this.selectedTool = toolId;
  }

  onColorChange(color: string): void {
    this.selectedColor = color;
  }

  onBrushWidthChange(width: number): void {
    this.brushWidth = Number(width);
  }

  onFillToggle(enabled: boolean): void {
    this.isChecked = enabled;
  }

  clearCanvas(): void {
    this.isClear = true;
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
