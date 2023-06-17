import { Component, ElementRef, OnInit, ViewChild, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';

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
  private prevMouseX: any;
  private prevMouseY: any;
  private snapshot: any = null;
  undoStack: any[] = [];
  redoStack: any[] = [];
  canvasWidth: number = 1080;
  canvasHeight: number = 566;
  ngOnInit(): void {

  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['selectedTool']) {
  //     console.log('selectedTool changed:', changes['selectedTool'].currentValue);
  //   }
  //   if (changes['checked']) {
  //     console.log('fillColor changed:', changes['checked'].currentValue);
  //   }
  //   if (changes['brushWidth']) {
  //     console.log('brushWidth changed:', changes['brushWidth'].currentValue);
  //   }
  //   if (changes['selectedColor']) {
  //     console.log('selectedColor changed:', changes['selectedColor'].currentValue);
  //   }
  // }

  ngAfterViewInit(): void {
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    const context = canvas.getContext('2d');
    if (context) {
      this.setCanvasSize(canvas);
      this.updateCanvasSize();
      this.setCanvasBackground(context);
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
      this.setCanvasBackground(context);
    } else {
      console.error('Could not get canvas context');
    }
  }

  private setCanvasBackground(context: CanvasRenderingContext2D): void {
    context.fillStyle = '#fff';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillStyle = this.selectedColor;
  }

  private saveCanvasState(context: CanvasRenderingContext2D): void {
    const canvas = context.canvas;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    this.undoStack.push(imageData);
    this.redoStack = []; // Clear the redoStack after saving a new state
  }


  public undo(): void {
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    const context = canvas.getContext("2d");
    if (!context) return;

    if (this.undoStack.length > 0) {
      const lastState = this.undoStack.pop();
      this.redoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
      context.putImageData(lastState, 0, 0);
    }
  }

  public redo(): void {
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    const context = canvas.getContext("2d");
    if (!context) return;

    if (this.redoStack.length > 0) {
      const nextState = this.redoStack.pop();
      this.undoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
      context.putImageData(nextState, 0, 0);
    }
  }

  private startDraw(e: MouseEvent): void {
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    this.isDrawing = true;
    this.prevMouseX = e.offsetX;
    this.prevMouseY = e.offsetY;
    this.saveCanvasState(context);

    context.beginPath();
    context.lineWidth = this.brushWidth;
    context.strokeStyle = this.selectedColor;
    context.fillStyle = this.selectedColor;
    this.snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
  }

  private drawing(e: MouseEvent): void {
    if (!this.isDrawing) return;
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    const context = canvas.getContext('2d');
    context?.putImageData(this.snapshot, 0, 0);
    if (!context) return;

    if (this.selectedTool === 'brush' || this.selectedTool === 'eraser') {
      context.strokeStyle = this.selectedTool === "eraser" ? "#fff" : this.selectedColor;
      context.lineTo(e.offsetX, e.offsetY);
      context.stroke();
    } else if (this.selectedTool === 'fill') {
      this.floodFill(context, this.getFillColor());
    } else if (this.selectedTool === "line") {
      this.drawLine(e, context);
    } else if (this.selectedTool === "rectangle") {
      this.drawRect(e, context);
    } else if (this.selectedTool === "circle") {
      this.drawCircle(e, context);
    } else if (this.selectedTool === "triangle") {
      this.drawTriangle(e, context);
    } else if (this.selectedTool === "pentagon") {
      this.drawPentagon(e, context);
    }
  }

  private stopDraw(): void {
    this.isDrawing = false;
  }

  private drawLine(e: MouseEvent, context: CanvasRenderingContext2D): void {
    context.beginPath();
    context.moveTo(this.prevMouseX, this.prevMouseY);
    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
  }

  private drawRect(e: MouseEvent, context: CanvasRenderingContext2D): void {
    const startX = Math.min(this.prevMouseX, e.offsetX);
    const startY = Math.min(this.prevMouseY, e.offsetY);
    const width = Math.abs(this.prevMouseX - e.offsetX);
    const height = Math.abs(this.prevMouseY - e.offsetY);

    if (this.checked) {
      context.fillStyle = this.selectedColor;
      context.fillRect(startX, startY, width, height);
    } else {
      context.strokeStyle = this.selectedColor;
      context.strokeRect(startX, startY, width, height);
    }
  }

  private drawCircle(e: MouseEvent, context: CanvasRenderingContext2D): void {
    context.beginPath();
    let radius = Math.sqrt(
      Math.pow(this.prevMouseX - e.offsetX, 2) + Math.pow(this.prevMouseY - e.offsetY, 2)
    );
    context.arc(this.prevMouseX, this.prevMouseY, radius, 0, 2 * Math.PI);
    this.checked ? context.fill() : context.stroke();
  }

  private drawTriangle(e: MouseEvent, context: CanvasRenderingContext2D): void {
    context.beginPath();
    context.moveTo(this.prevMouseX, this.prevMouseY);
    context.lineTo(e.offsetX, e.offsetY);
    context.lineTo(this.prevMouseX * 2 - e.offsetX, e.offsetY);
    context.closePath();
    this.checked ? context.fill() : context.stroke();
  }

  private drawPentagon(e: MouseEvent, context: CanvasRenderingContext2D): void {
    const numSides = 5;
    const radius = Math.sqrt(Math.pow(e.offsetX - this.prevMouseX, 2) + Math.pow(e.offsetY - this.prevMouseY, 2));
    const angle = (2 * Math.PI) / numSides;
    const shift = (Math.PI / 180.0) * -18;
    const centerX = (this.prevMouseX + e.offsetX) / 2;
    const centerY = (this.prevMouseY + e.offsetY) / 2;

    context.beginPath();

    for (let side = 1; side <= numSides; side++) {
      var curAngle = side * angle + shift
      const x = centerX + radius * Math.cos(curAngle);
      const y = centerY + radius * Math.sin(curAngle);
      context.lineTo(x, y);
    }
    context.closePath();
    this.checked ? context.fill() : context.stroke();
  }

  floodFill(context: CanvasRenderingContext2D, fillColor: number[]) {
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = this.getPixel(imageData, this.prevMouseX, this.prevMouseY);

    if (!this.colorsMatch(targetColor, fillColor)) {
      this.fillPixel(imageData, this.prevMouseX, this.prevMouseY, targetColor, fillColor);
      context.putImageData(imageData, 0, 0);
    }
  }

  private getPixel(imageData: ImageData, x: number, y: number): number[] {
    const index = (y * imageData.width + x) * 4;
    return [
      imageData.data[index],   // Red component
      imageData.data[index + 1], // Green component
      imageData.data[index + 2], // Blue component
      imageData.data[index + 3], // Alpha component
    ];
  }

  private colorsMatch(color1: number[], color2: number[]): boolean {
    return color1[0] === color2[0] &&
      color1[1] === color2[1] &&
      color1[2] === color2[2] &&
      color1[3] === color2[3];
  }

  private fillPixel(imageData: ImageData, x: number, y: number, targetColor: number[], fillColor: number[]) {
    const index = (y * imageData.width + x) * 4;
    const imageDataArray = imageData.data;

    const queue = [];
    queue.push([x, y]);

    while (queue.length > 0) {
      const [pixelX, pixelY] = queue.shift() as number[];
      const pixelIndex = (pixelY * imageData.width + pixelX) * 4;
      const pixelColor = [
        imageDataArray[pixelIndex],     // Red component
        imageDataArray[pixelIndex + 1], // Green component
        imageDataArray[pixelIndex + 2], // Blue component
        imageDataArray[pixelIndex + 3], // Alpha component
      ];

      if (this.colorsMatch(pixelColor, targetColor)) {
        imageDataArray[pixelIndex] = fillColor[0];
        imageDataArray[pixelIndex + 1] = fillColor[1];
        imageDataArray[pixelIndex + 2] = fillColor[2];
        imageDataArray[pixelIndex + 3] = fillColor[3];

        if (pixelX > 0) {
          queue.push([pixelX - 1, pixelY]);
        }
        if (pixelX < imageData.width - 1) {
          queue.push([pixelX + 1, pixelY]);
        }
        if (pixelY > 0) {
          queue.push([pixelX, pixelY - 1]);
        }
        if (pixelY < imageData.height - 1) {
          queue.push([pixelX, pixelY + 1]);
        }
      }
    }
  }


  private getFillColor(): number[] {
    const colorString = this.selectedColor;
    const regex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
    const match = colorString.match(regex);

    if (match) {
      const red = parseInt(match[1], 10);
      const green = parseInt(match[2], 10);
      const blue = parseInt(match[3], 10);

      if (!isNaN(red) && !isNaN(green) && !isNaN(blue) && red >= 0 && red <= 255 && green >= 0 && green <= 255 && blue >= 0 && blue <= 255) {
        return [red, green, blue, 255]; // Return a default alpha value of 255 (fully opaque)
      }
    }

    return [0, 0, 0, 255]; // Return a default color if the string doesn't match the expected format or contains invalid values
  }

  public clearCanvas(): void {
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;
  
    // Kiểm tra xem có trạng thái để undo hay không
    if (this.undoStack.length > 0) {
      // Lưu trạng thái hiện tại vào undoStack trước khi xóa
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      this.undoStack.push(imageData);
    }
  
    // Xóa canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    this.redoStack = [];
    this.clearCanvasEvent.emit(true);
    this.setCanvasBackground(context);
  }
  


  private registerEventListeners(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('mousedown', this.startDraw.bind(this));
    canvas.addEventListener('mousemove', this.drawing.bind(this));
    canvas.addEventListener('mouseup', this.stopDraw.bind(this));
    canvas.addEventListener('mouseleave', this.stopDraw.bind(this));
    // canvas.addEventListener('mousemove', this.updateControlPoint.bind(this));
  }
}
