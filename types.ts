
export enum AppMode {
  CAMERA = 'CAMERA',
  PRINTING = 'PRINTING',
  EDITOR = 'EDITOR',
  GALLERY = 'GALLERY',
}

export enum FilterType {
  NORMAL = 'normal',
  GRAYSCALE = 'grayscale',
  SEPIA = 'sepia',
  WARM = 'warm',
  COOL = 'cool',
  VINTAGE = 'vintage',
}

export enum TemplateType {
  NONE = 'none',
  POLAROID = 'polaroid',
  STRIP = 'strip',
  SQUARE_FRAME = 'square_frame',
}

export enum BorderPattern {
  NONE = 'none',
  HEARTS = 'hearts',
  STARS = 'stars',
  DOTS = 'dots',
  CHECKER = 'checker',
  STRIPED = 'striped',
  FLORAL = 'floral',
}

export enum AIPreset {
  NONE = 'none',
  GLOW = 'glow',
  BOLLYWOOD = 'bollywood',
  RETRO_ANIME = 'retro_anime',
  VINTAGE_NOIR = 'vintage_noir',
  CYBER = 'cyber',
}

export interface PhotoData {
  id: string;
  original: string; // Base64 (Composed)
  enhanced?: string; // Base64 (Composed)
  assets: string[]; // Original raw shots
  timestamp: number;
  template: TemplateType;
  filter: FilterType;
  borderPattern?: BorderPattern;
  aiPreset?: AIPreset;
}

export interface FilterSettings {
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  blur: number;       // 0 to 20
  grain: number;      // 0 to 100
  type: FilterType;
}

export type CaptureMode = 1 | 3 | 4;
