import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FloodFillService {

  constructor() { }

  floodFill(
    context: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    fillColor: number[]
  ): void {
    const canvas = context.canvas;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Validate coordinates
    if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
      return;
    }

    const startIndex = (startY * width + startX) * 4;

    // Get target color components directly
    const targetR = data[startIndex];
    const targetG = data[startIndex + 1];
    const targetB = data[startIndex + 2];
    const targetA = data[startIndex + 3];

    // If target and fill colors are the same, no need to fill
    if (targetR === fillColor[0] && targetG === fillColor[1] &&
        targetB === fillColor[2] && targetA === fillColor[3]) {
      return;
    }

    this.fastFloodFill(data, width, height, startX, startY,
                      targetR, targetG, targetB, targetA, fillColor);
    context.putImageData(imageData, 0, 0);
  }

  private fastFloodFill(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    startX: number,
    startY: number,
    targetR: number,
    targetG: number,
    targetB: number,
    targetA: number,
    fillColor: number[]
  ): void {
    // Simple and fast queue with pre-allocated size
    const pixelStack = new Uint32Array(width * height);
    let stackPointer = 0;

    // Add starting pixel
    pixelStack[stackPointer++] = startY * width + startX;

    // Track visited pixels efficiently
    const visited = new Uint8Array(width * height);

    const fillR = fillColor[0];
    const fillG = fillColor[1];
    const fillB = fillColor[2];
    const fillA = fillColor[3];

    while (stackPointer > 0) {
      const pixelPos = pixelStack[--stackPointer];
      const y = Math.floor(pixelPos / width);
      const x = pixelPos % width;

      // Skip if out of bounds or already visited
      if (x < 0 || x >= width || y < 0 || y >= height || visited[pixelPos]) {
        continue;
      }

      const dataIndex = pixelPos * 4;

      // Check if this pixel matches target color
      if (data[dataIndex] !== targetR || data[dataIndex + 1] !== targetG ||
          data[dataIndex + 2] !== targetB || data[dataIndex + 3] !== targetA) {
        continue;
      }

      // Mark as visited
      visited[pixelPos] = 1;

      // Fill the pixel
      data[dataIndex] = fillR;
      data[dataIndex + 1] = fillG;
      data[dataIndex + 2] = fillB;
      data[dataIndex + 3] = fillA;

      // Add neighbors to stack (only if not visited and in bounds)
      // Left
      if (x > 0 && !visited[pixelPos - 1]) {
        pixelStack[stackPointer++] = pixelPos - 1;
      }
      // Right
      if (x < width - 1 && !visited[pixelPos + 1]) {
        pixelStack[stackPointer++] = pixelPos + 1;
      }
      // Up
      if (y > 0 && !visited[pixelPos - width]) {
        pixelStack[stackPointer++] = pixelPos - width;
      }
      // Down
      if (y < height - 1 && !visited[pixelPos + width]) {
        pixelStack[stackPointer++] = pixelPos + width;
      }
    }
  }

  private getPixel(imageData: ImageData, x: number, y: number): number[] {
    const index = (y * imageData.width + x) * 4;
    return [
      imageData.data[index],     // Red component
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

  parseColorToRgba(colorString: string): number[] {
    // Handle hex colors for better performance
    if (colorString.startsWith('#')) {
      const hex = colorString.slice(1);
      if (hex.length === 3) {
        // Short hex format (#RGB)
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return [r, g, b, 255];
      } else if (hex.length === 6) {
        // Full hex format (#RRGGBB)
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return [r, g, b, 255];
      }
    }

    // Handle rgb() format
    const rgbMatch = colorString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (rgbMatch) {
      const red = parseInt(rgbMatch[1], 10);
      const green = parseInt(rgbMatch[2], 10);
      const blue = parseInt(rgbMatch[3], 10);

      if (!isNaN(red) && !isNaN(green) && !isNaN(blue) &&
          red >= 0 && red <= 255 &&
          green >= 0 && green <= 255 &&
          blue >= 0 && blue <= 255) {
        return [red, green, blue, 255];
      }
    }

    // Handle rgba() format
    const rgbaMatch = colorString.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
    if (rgbaMatch) {
      const red = parseInt(rgbaMatch[1], 10);
      const green = parseInt(rgbaMatch[2], 10);
      const blue = parseInt(rgbaMatch[3], 10);
      const alpha = Math.round(parseFloat(rgbaMatch[4]) * 255);

      if (!isNaN(red) && !isNaN(green) && !isNaN(blue) && !isNaN(alpha) &&
          red >= 0 && red <= 255 &&
          green >= 0 && green <= 255 &&
          blue >= 0 && blue <= 255 &&
          alpha >= 0 && alpha <= 255) {
        return [red, green, blue, alpha];
      }
    }

    // Return default black color if parsing fails
    return [0, 0, 0, 255];
  }
}
