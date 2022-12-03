interface DirectedSegment {
	sx: number;
	sy: number;
	ex: number;
	ey: number;
}

class DirectedSegments {
	protected directedSegments: DirectedSegment[] = [];

	public addPixel(x: number, y: number) {
		this.directedSegments.push(
			{ sx: x, sy: y, ex: x + 1, ey: y },
			{ sx: x + 1, sy: y, ex: x + 1, ey: y + 1 },
			{ sx: x + 1, sy: y + 1, ex: x, ey: y + 1 },
			{ sx: x, sy: y + 1, ex: x, ey: y },
		);
	}

	protected notDuplicate() {
		this.directedSegments = this.directedSegments.filter((target, index) => {
			for (let i = 0; i < index; ++i) {
				const now = this.directedSegments[i];
				if (now.sx === target.sx && now.sy === target.sy && now.ex === target.ex && now.ey === target.ey) {
					return false;
				}
			}
			return true;
		});
	}

	protected annihilate() {
		const directedSegments: (DirectedSegment | null)[] = [...this.directedSegments];
		const max = directedSegments.length;
		for (let a = 0; a < max; ++a) {
			const target = directedSegments[a];
			if (!target) {
				continue;
			}
			for (let b = a + 1; b < max; ++b) {
				const check = directedSegments[b];
				if (!check) {
					continue;
				}
				if (target.sx !== check.ex || target.ex !== check.sx || target.sy !== check.ey || target.ey !== check.sy) {
					continue;
				}
				directedSegments[a] = directedSegments[b] = null;
				break;
			}
		}
		return <DirectedSegment[]> directedSegments.filter((directedSegment) => {
			return directedSegment !== null;
		});
	}

	protected findCorner(directedSegments: DirectedSegment[], start: number) {
		let min = start;
		for (let i = start + 1; i < directedSegments.length; ++i) {
			if (directedSegments[i].ex <= directedSegments[i].sx) {
				continue;
			}
			if (
				directedSegments[i].sy < directedSegments[min].sy ||
				directedSegments[i].sx < directedSegments[min].sx
			) {
				min = i;
			}
		}
		return min;
	}

	protected connect(directedSegments: DirectedSegment[], start: number) {
		for (let i = start + 1; i < directedSegments.length; ++i) {
			if (directedSegments[start].ex === directedSegments[i].sx && directedSegments[start].ey === directedSegments[i].sy) {
				++start;
				[directedSegments[start], directedSegments[i]] = [directedSegments[i], directedSegments[start]];
				i = start;
			}
		}
		return start;
	}

	protected sort(directedSegments: DirectedSegment[]) {
		if (directedSegments.length <= 0) {
			return directedSegments;
		}
		for (let i = 0; i < directedSegments.length; ++i) {
			const corner = this.findCorner(directedSegments, i);
			if (i < corner) {
				[directedSegments[i], directedSegments[corner]] = [directedSegments[corner], directedSegments[i]];
			}

			i = this.connect(directedSegments, i);
		}
		return directedSegments;
	}

	protected directedSegmentToVector(directedSegment: DirectedSegment) {
		const dx = directedSegment.ex - directedSegment.sx;
		const dy = directedSegment.ey - directedSegment.sy;
		return {
			x: dx ? Math.floor(dx / Math.abs(dx)) : 0,
			y: dy ? Math.floor(dy / Math.abs(dy)) : 0,
		};
	}

	protected merge(directedSegments: DirectedSegment[]) {
		let start: { x: number; y: number } | null = null;
		let target = -1;
		return <DirectedSegment[]> directedSegments.map((directedSegment, index) => {
			if (!start) {
				start = this.directedSegmentToVector(directedSegment);
				target = index;
			} else {
				const vector = this.directedSegmentToVector(directedSegment);
				if (start.x === vector.x && start.y === vector.y) {
					directedSegments[target].ex = directedSegment.ex;
					directedSegments[target].ey = directedSegment.ey;
					return null;
				} else {
					start = vector;
					target = index;
				}
			}

			return directedSegment;
		}).filter((directedSegment) => {
			return directedSegment !== null;
		});
	}

	public optimize() {
		this.notDuplicate();
		return this.merge(this.sort(this.annihilate()));
	}

	public get() {
		return this.directedSegments;
	}

	protected directedSegmentToString(directedSegment: DirectedSegment) {
		return directedSegment.sx === directedSegment.ex ? `V${directedSegment.ey}` : `H${directedSegment.ex}`;
	}

	public toString() {
		const directedSegments = this.optimize();

		let start: { x: number; y: number } | null = null;
		return directedSegments.map((directedSegment) => {
			if (!start) {
				start = {
					x: directedSegment.sx,
					y: directedSegment.sy,
				};
				return `M${directedSegment.sx},${directedSegment.sy}${this.directedSegmentToString(directedSegment)}`;
			}

			if (start.x === directedSegment.ex && start.y === directedSegment.ey) {
				start = null;
				return '';
			}

			return this.directedSegmentToString(directedSegment);
		}).join('') + '';
	}
}
