import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

export interface ToolbarTool {
  id: string;
  name: string;
  icon: string;
  category: 'drawing' | 'shape';
}

export interface ToolbarColor {
  value: string;
  name: string;
}

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  @Input() selectedTool: string = 'brush';
  @Input() selectedColor: string = '#000000';
  @Input() brushWidth: number = 1;
  @Input() fillEnabled: boolean = false;

  @Output() toolChange = new EventEmitter<string>();
  @Output() colorChange = new EventEmitter<string>();
  @Output() brushWidthChange = new EventEmitter<number>();
  @Output() fillToggle = new EventEmitter<boolean>();
  @Output() clearCanvas = new EventEmitter<void>();
  @Output() saveCanvas = new EventEmitter<void>();

  tools: ToolbarTool[] = [
    { id: 'brush', name: 'Brush', icon: 'brush.svg', category: 'drawing' },
    { id: 'eraser', name: 'Eraser', icon: 'eraser.svg', category: 'drawing' },
    { id: 'fill', name: 'Fill', icon: 'paint.png', category: 'drawing' },
    { id: 'line', name: 'Line', icon: 'line.png', category: 'shape' },
    { id: 'rectangle', name: 'Rectangle', icon: 'rectangle.svg', category: 'shape' },
    { id: 'circle', name: 'Circle', icon: 'circle.svg', category: 'shape' },
    { id: 'triangle', name: 'Triangle', icon: 'triangle.svg', category: 'shape' },
    { id: 'pentagon', name: 'Pentagon', icon: 'pentagon.png', category: 'shape' }
  ];

  predefinedColors: ToolbarColor[] = [
    { value: '#000000', name: 'Black' },
    { value: '#FFFFFF', name: 'White' },
    { value: '#FF0000', name: 'Red' },
    { value: '#00FF00', name: 'Green' },
    { value: '#0000FF', name: 'Blue' },
    { value: '#FFFF00', name: 'Yellow' },
    { value: '#FF8000', name: 'Orange' },
    { value: '#800080', name: 'Purple' },
    { value: '#FFC0CB', name: 'Pink' },
    { value: '#808080', name: 'Gray' }
  ];

  showColorPicker: boolean = false;
  customColor: string = '#000000';

  constructor() { }

  ngOnInit(): void {
    this.customColor = this.selectedColor;
  }

  onToolSelect(toolId: string): void {
    this.selectedTool = toolId;
    this.toolChange.emit(toolId);
  }

  onColorSelect(color: string): void {
    this.selectedColor = color;
    this.customColor = color;
    this.colorChange.emit(color);
    this.showColorPicker = false;
  }

  onCustomColorChange(color: string): void {
    this.selectedColor = color;
    this.customColor = color;
    this.colorChange.emit(color);
  }

  onBrushWidthChange(width: number): void {
    this.brushWidth = width;
    this.brushWidthChange.emit(width);
  }

  onFillToggle(): void {
    this.fillEnabled = !this.fillEnabled;
    this.fillToggle.emit(this.fillEnabled);
  }

  onClearCanvas(): void {
    this.clearCanvas.emit();
  }

  onSaveCanvas(): void {
    this.saveCanvas.emit();
  }

  toggleColorPicker(): void {
    this.showColorPicker = !this.showColorPicker;
  }

  getDrawingTools(): ToolbarTool[] {
    return this.tools.filter(tool => tool.category === 'drawing');
  }

  getShapeTools(): ToolbarTool[] {
    return this.tools.filter(tool => tool.category === 'shape');
  }
}
