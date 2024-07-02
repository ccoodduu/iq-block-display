class Board {
	static drawBoardString(s: p5, str: string, width: number) {
		const lines = str.split("\n");

		s.push();

		s.translate(-width / 2, -width / 2);

		const stepSize = width / 8;

		s.strokeWeight(0);

		for (let y = 0; y < 8; y++)
			for (let x = 0; x < 8; x++) {
				const xPos = stepSize * x;
				const yPos = stepSize * y;

				const letter = lines[y][x];

				if (letter == ".") continue;

				const type = PieceType[letter as keyof typeof PieceType];
				const info = pieceInfos.filter((t) => t.type == type)[0];

				s.fill(info.col);
				s.square(xPos, yPos, stepSize + 1);
			}

		s.strokeWeight(5);
		s.stroke(0);
		s.noFill();

		s.square(0, 0, width);

		s.pop();
	}
}
