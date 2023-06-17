import { Component, AfterViewInit, ViewChildren, ElementRef, QueryList, ViewChild, Renderer2 } from '@angular/core';
import { CanvasComponent } from './canvas/canvas.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
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
  @ViewChild('fillColor', { static: true }) fillColor!: ElementRef<HTMLInputElement>;
  @ViewChild('sizeSlider', { static: true }) sizeSlider!: ElementRef<HTMLInputElement>;
  @ViewChildren('toolBtn') toolBtns!: QueryList<ElementRef<HTMLLIElement>>;
  @ViewChildren('colorBtn') colorBtn!: QueryList<ElementRef<HTMLLIElement>>;
  @ViewChildren('colorPicker') colorPicker!: QueryList<ElementRef<HTMLInputElement>>;

  constructor(private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    this.registerToolButtonListeners();
    this.registerColorButtonListener();
    this.registerColorPicker();
  }

  registerToolButtonListeners(): void {
    this.toolBtns.forEach((btn: ElementRef<HTMLLIElement>) => {
      btn.nativeElement.addEventListener('click', () => {
        document.querySelector('.options .active')?.classList.remove('active');
        btn.nativeElement.classList.add('active');
        this.selectedTool = btn.nativeElement.id;
      });
    });
  }

  registerColorButtonListener(): void {
    this.colorBtn.forEach((btn: ElementRef<HTMLLIElement>) => {
      btn.nativeElement.addEventListener('click', () => {
        document.querySelector('.options .selected')?.classList.remove('selected');
        btn.nativeElement.classList.add('selected');
        this.selectedColor = window
          .getComputedStyle(btn.nativeElement)
          .getPropertyValue('background-color');
      })
    })
  }

  registerColorPicker(): void {
    this.colorPicker.forEach((btn: ElementRef<HTMLInputElement>) => {
      btn.nativeElement.addEventListener('change', () => {
        const parentElement = btn.nativeElement.parentElement;
        if (parentElement) {
          this.renderer.setStyle(parentElement, 'background', btn.nativeElement.value);
          parentElement.click();
        }
      })
    })
  }
  onBrushSliderChange(): void {
    this.brushWidth = this.brushWidth;
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
