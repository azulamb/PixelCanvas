/// <reference path="../docs/pixel-canvas.libs.d.ts" />

interface PixelCanvas extends HTMLElement {
	width: number;
	height: number;
}

interface PixelImageElement extends HTMLElement {
	src: string;
	readonly image: SVGGElement;
	readonly width: number;
	readonly height: number;
	x: number;
	y: number;
	background: string;
}

interface PixelCanvasImportOption {
	/** Default: auto. auto = ignore transparent. full = all colors. */
	mode?: 'auto' | 'full';
}
