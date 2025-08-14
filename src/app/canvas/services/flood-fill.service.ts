import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FloodFillService {
  constructor() {}

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
    if (
      targetR === fillColor[0] &&
      targetG === fillColor[1] &&
      targetB === fillColor[2] &&
      targetA === fillColor[3]
    ) {
      return;
    }

    this.fastFloodFill(
      data,
      width,
      height,
      startX,
      startY,
      targetR,
      targetG,
      targetB,
      targetA,
      fillColor
    );

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
    const fillR = fillColor[0];
    const fillG = fillColor[1];
    const fillB = fillColor[2];
    const fillA = fillColor[3];

    // Optimized inline functions for better performance
    const matchesTarget = (x: number, y: number): boolean => {
      const idx = (y * width + x) * 4;
      return (
        data[idx] === targetR &&
        data[idx + 1] === targetG &&
        data[idx + 2] === targetB &&
        data[idx + 3] === targetA
      );
    };

    const fillPixel = (x: number, y: number): void => {
      const idx = (y * width + x) * 4;
      data[idx] = fillR;
      data[idx + 1] = fillG;
      data[idx + 2] = fillB;
      data[idx + 3] = fillA;
    };

    // Use a more efficient stack-based approach
    const stack: number[] = [startX, startY];

    while (stack.length > 0) {
      const y = stack.pop()!;
      const x = stack.pop()!;

      if (x < 0 || x >= width || y < 0 || y >= height || !matchesTarget(x, y)) {
        continue;
      }

      // Find the leftmost and rightmost boundaries of the current row
      let left = x;
      let right = x;

      // Move left to find the edge
      while (left > 0 && matchesTarget(left - 1, y)) {
        left--;
      }

      // Move right to find the edge
      while (right < width - 1 && matchesTarget(right + 1, y)) {
        right++;
      }

      // Fill the entire horizontal line
      for (let i = left; i <= right; i++) {
        fillPixel(i, y);
      }

      // Check above and below for pixels to fill
      for (let i = left; i <= right; i++) {
        // Check pixel above
        if (y > 0 && matchesTarget(i, y - 1)) {
          stack.push(i, y - 1);
        }
        // Check pixel below
        if (y < height - 1 && matchesTarget(i, y + 1)) {
          stack.push(i, y + 1);
        }
      }
    }
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

    // Handle rgba() format
    const rgbaMatch = colorString.match(
      /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/
    );
    if (rgbaMatch) {
      const red = parseInt(rgbaMatch[1], 10);
      const green = parseInt(rgbaMatch[2], 10);
      const blue = parseInt(rgbaMatch[3], 10);
      const alpha = Math.round(parseFloat(rgbaMatch[4]) * 255);

      if (
        !isNaN(red) &&
        !isNaN(green) &&
        !isNaN(blue) &&
        !isNaN(alpha) &&
        red >= 0 &&
        red <= 255 &&
        green >= 0 &&
        green <= 255 &&
        blue >= 0 &&
        blue <= 255 &&
        alpha >= 0 &&
        alpha <= 255
      ) {
        return [red, green, blue, alpha];
      }
    }

    // Return default black color if parsing fails
    return [0, 0, 0, 255];
  }
}
