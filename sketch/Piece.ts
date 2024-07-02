interface PieceInfo {
	type: PieceType;
	shape: string;
	col: p5.Color;
}

enum PieceType {
	A,
	B,
	C,
	D,
	E,
	F,
	G,
	H,
	I,
	J,
}

enum Rotation {
	UP,
	RIGHT,
	DOWN,
	LEFT,
	FLIPPED_UP,
	FLIPPED_RIGHT,
	FLIPPED_DOWN,
	FLIPPED_LEFT,
}

let pieceInfos: PieceInfo[];

function rotatePoint(rotation: Rotation, x: number, y: number, x2: number, y2: number): [number, number] {
	// Translate point to origin
	const translatedX = x + 0.5 - x2;
	const translatedY = y + 0.5 - y2;

	// Rotate point
	let rotatedX: number;
	let rotatedY: number;
	switch (rotation) {
		case Rotation.UP:
			rotatedX = translatedX;
			rotatedY = translatedY;
			break;
		case Rotation.RIGHT:
			rotatedX = -translatedY;
			rotatedY = translatedX;
			break;
		case Rotation.DOWN:
			rotatedX = -translatedX;
			rotatedY = -translatedY;
			break;
		case Rotation.LEFT:
			rotatedX = translatedY;
			rotatedY = -translatedX;
			break;
		case Rotation.FLIPPED_UP:
			rotatedX = -translatedX;
			rotatedY = translatedY;
			break;
		case Rotation.FLIPPED_RIGHT:
			rotatedX = translatedY;
			rotatedY = translatedX;
			break;
		case Rotation.FLIPPED_DOWN:
			rotatedX = translatedX;
			rotatedY = -translatedY;
			break;
		case Rotation.FLIPPED_LEFT:
			rotatedX = -translatedY;
			rotatedY = -translatedX;
			break;
		default:
			throw new Error("Invalid rotation value");
	}

	// Translate point back
	const finalX = Math.floor(rotatedX + x2 - 0.5);
	const finalY = Math.floor(rotatedY + y2 - 0.5);

	return [finalX, finalY];
}
