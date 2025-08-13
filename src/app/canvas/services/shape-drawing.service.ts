import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShapeDrawingService {

  constructor() { }

  drawLine(
    context: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string,
    width: number
  ): void {
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = width;
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
  }

  drawRectangle(
    context: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string,
    width: number,
    filled: boolean = false
  ): void {
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const rectWidth = Math.abs(startX - endX);
    const rectHeight = Math.abs(startY - endY);

    if (filled) {
      context.fillStyle = color;
      context.fillRect(x, y, rectWidth, rectHeight);
    } else {
      context.strokeStyle = color;
      context.lineWidth = width;
      context.strokeRect(x, y, rectWidth, rectHeight);
    }
  }

  drawCircle(
    context: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    endX: number,
    endY: number,
    color: string,
    width: number,
    filled: boolean = false
  ): void {
    context.beginPath();
    const radius = Math.sqrt(Math.pow(centerX - endX, 2) + Math.pow(centerY - endY, 2));
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);

    if (filled) {
      context.fillStyle = color;
      context.fill();
    } else {
      context.strokeStyle = color;
      context.lineWidth = width;
      context.stroke();
    }
  }

  drawTriangle(
    context: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string,
    width: number,
    filled: boolean = false
  ): void {
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.lineTo(startX * 2 - endX, endY);
    context.closePath();

    if (filled) {
      context.fillStyle = color;
      context.fill();
    } else {
      context.strokeStyle = color;
      context.lineWidth = width;
      context.stroke();
    }
  }

  drawPentagon(
    context: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string,
    width: number,
    filled: boolean = false
  ): void {
    const numSides = 5;
    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const angle = (2 * Math.PI) / numSides;
    const shift = (Math.PI / 180.0) * -18;
    const centerX = (startX + endX) / 2;
    const centerY = (startY + endY) / 2;

    context.beginPath();

    for (let side = 1; side <= numSides; side++) {
      const curAngle = side * angle + shift;
      const x = centerX + radius * Math.cos(curAngle);
      const y = centerY + radius * Math.sin(curAngle);
      context.lineTo(x, y);
    }
    context.closePath();

    if (filled) {
      context.fillStyle = color;
      context.fill();
    } else {
      context.strokeStyle = color;
      context.lineWidth = width;
      context.stroke();
    }
  }

  drawBrushStroke(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    width: number
  ): void {
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineTo(x, y);
    context.stroke();
  }

  drawEraser(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number
  ): void {
    context.strokeStyle = '#fff';
    context.lineWidth = width;
    context.lineTo(x, y);
    context.stroke();
  }
}
