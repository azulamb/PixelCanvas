interface DirectedSegment {
    sx: number;
    sy: number;
    ex: number;
    ey: number;
}
declare class DirectedSegments {
    protected directedSegments: DirectedSegment[];
    addPixel(x: number, y: number): void;
    protected notDuplicate(): void;
    protected annihilate(): DirectedSegment[];
    protected findCorner(directedSegments: DirectedSegment[], start: number): number;
    protected connect(directedSegments: DirectedSegment[], start: number): number;
    protected sort(directedSegments: DirectedSegment[]): DirectedSegment[];
    protected directedSegmentToVector(directedSegment: DirectedSegment): {
        x: number;
        y: number;
    };
    protected merge(directedSegments: DirectedSegment[]): DirectedSegment[];
    optimize(): DirectedSegment[];
    get(): DirectedSegment[];
    protected directedSegmentToString(directedSegment: DirectedSegment): string;
    toString(): string;
}
