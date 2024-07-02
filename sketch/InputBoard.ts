interface DraggablePiece {
	type: PieceType;
	rot: Rotation;
	xGridPos: number;
	yGridPos: number;
	defaultX: number;
	defaultY: number;
}

let onClick: Function;

const inputCanvas = (s: p5) => {
	const pieces: DraggablePiece[] = [];

	let offsetX = 0;
	let offsetY = 0;
	let dragPieceIndex = -1;

	let boardWidth = 0;
	let cellWidth = 0;

	let solutionFinder: SolutionFinder;

	const boardDrawer = new BoardDrawer(200);

	s.setup = () => {
		pieceInfos = [
			{
				type: PieceType.A,
				col: s.color("#fefd1c"),
				shape: "###.. " + "..#.. " + "..###",
			},
			{
				type: PieceType.B,
				col: s.color("#ea7f33"),
				shape: "### " + "### " + "##.",
			},
			{
				type: PieceType.C,
				col: s.color("#f034ff"),
				shape: "### " + "#.. " + "#..",
			},
			{
				type: PieceType.D,
				col: s.color("#aafc67"),
				shape: "### " + "#.. " + "#.. " + "#..",
			},
			{
				type: PieceType.E,
				col: s.color("#f02768"),
				shape: "## " + "## " + "#. " + "#.",
			},
			{
				type: PieceType.F,
				col: s.color("#399733"),
				shape: "## " + "## " + "## " + "##",
			},
			{
				type: PieceType.G,
				col: s.color("#613404"),
				shape: "## " + "## " + "#.",
			},
			{
				type: PieceType.H,
				col: s.color("#5dcbfe"),
				shape: "#.. " + "#.. " + "### " + "###",
			},
			{
				type: PieceType.I,
				col: s.color("#abfdcc"),
				shape: "#. " + "#. " + "#. " + "## " + "##",
			},
			{
				type: PieceType.J,
				col: s.color("#e6e6d1"),
				shape: "## " + "#. " + "#.",
			},
		];

		for (let i = 0; i < pieceInfos.length; i++) {
			const type = pieceInfos[i].type;

			pieces.push({
				type: type,
				rot: Rotation.UP,
				xGridPos: -1,
				yGridPos: -1,
				defaultX: (i % 5) * 4 + Math.random() * 1,
				defaultY: Math.floor(i / 5) * 4 + Math.random(),
			});
		}

		s.createCanvas(s.windowWidth - 50, s.windowHeight / 2 + 100);

		solutionFinder = new SolutionFinder();

		onClick = searchSolutions;
	};

	s.draw = () => {
		s.clear();

		boardWidth = Math.min((s.width - 100) / 4, s.height - 100);
		cellWidth = boardWidth / 8;

		s.translate(s.width / 3 - boardWidth, 50);

		drawBoard();

		for (let i = 0; i < pieces.length; i++) {
			const piece = pieces[i];

			if (i == dragPieceIndex) {
				drawPiece(s.mouseX - offsetX, s.mouseY - offsetY, piece.type, piece.rot);
			} else {
				const physicalPosition = getPhysicalPosition(pieces[i]);

				drawPiece(physicalPosition[0], physicalPosition[1], piece.type, piece.rot);
			}
		}

		function drawPiece(xPos: number, yPos: number, type: PieceType, rotation: Rotation) {
			s.push();

			const info = pieceInfos.filter((t) => t.type == type)[0];

			s.fill(info.col);
			s.noStroke();

			s.translate(xPos, yPos);

			const rows = info.shape.split(" ");
			for (let y = 0; y < rows.length; y++) {
				const row = rows[y];
				for (let x = 0; x < row.length; x++) {
					const l = row[x];

					if (l == ".") continue;

					const centerX = row.length / 2;
					const centerY = rows.length / 2;
					const newPos = rotatePoint(rotation, x, y, centerX, centerY);

					s.square(newPos[0] * cellWidth, newPos[1] * cellWidth, cellWidth + 1);
				}
			}

			s.pop();
		}

		function drawBoard() {
			s.push();

			s.strokeWeight(5);
			s.stroke(0);
			s.fill(230);

			s.square(-2.5, -2.5, boardWidth + 5);

			s.pop();
		}
	};

	s.mousePressed = () => {
		const color = s.color(s.get(s.mouseX, s.mouseY));

		for (let i = 0; i < pieces.length; i++) {
			const type = pieces[i].type;
			const info = pieceInfos.filter((t) => t.type == type)[0];

			const isPressed = areColorsEqual(color, info.col);

			if (!isPressed) continue;

			if (s.mouseButton == s.RIGHT) {
				pieces[i].rot = (pieces[i].rot + 1) % 8;

				if (isOutOfBounds(pieces[i].type)) {
					pieces[i].xGridPos = -1;
					pieces[i].yGridPos = -1;
				}

				return;
			}
			dragPieceIndex = i;

			const physicalPosition = getPhysicalPosition(pieces[i]);
			offsetX = s.mouseX - physicalPosition[0];
			offsetY = s.mouseY - physicalPosition[1];
			return;
		}
	};

	s.mouseReleased = () => {
		if (dragPieceIndex == -1) return;

		let piece = pieces[dragPieceIndex];

		const xPos = s.mouseX - offsetX;
		const yPos = s.mouseY - offsetY;

		piece.xGridPos = Math.round(xPos / cellWidth);
		piece.yGridPos = Math.round(yPos / cellWidth);

		dragPieceIndex = -1;

		if (isOutOfBounds(piece.type)) {
			piece.xGridPos = -1;
			piece.yGridPos = -1;
		}
	};

	function isOutOfBounds(type: PieceType): boolean {
		const piece = pieces.find((t) => t.type == type);
		const info = pieceInfos.find((t) => t.type == type);

		const rows = info.shape.split(" ");
		for (let y = 0; y < rows.length; y++) {
			const row = rows[y];
			for (let x = 0; x < row.length; x++) {
				const l = row[x];

				if (l == ".") continue;

				const centerX = row.length / 2;
				const centerY = rows.length / 2;

				const newPos = rotatePoint(piece.rot, x, y, centerX, centerY);

				const newX = piece.xGridPos + newPos[0];
				const newY = piece.yGridPos + newPos[1];

				if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) {
					piece.xGridPos = -1;
					piece.yGridPos = -1;
					return true;
				}
			}
		}

		return false;
	}

	function areColorsEqual(color1: p5.Color, color2: p5.Color): boolean {
		if (Math.abs(s.red(color1) - s.red(color2)) > 5) return false;
		if (Math.abs(s.green(color1) - s.green(color2)) > 5) return false;
		if (Math.abs(s.blue(color1) - s.blue(color2)) > 5) return false;
		return true;
	}

	s.windowResized = () => {
		s.resizeCanvas(s.windowWidth - 50, s.windowHeight / 2 + 100);
		boardDrawer.setWidth(Math.min(300, s.width / 4));
	};

	function getPhysicalPosition(piece: DraggablePiece): [number, number] {
		if (piece.xGridPos == -1 && piece.yGridPos == -1) return [boardWidth + 50 + piece.defaultX * cellWidth, piece.defaultY * cellWidth];

		return [piece.xGridPos * cellWidth, piece.yGridPos * cellWidth];
	}

	function getBoardString() {
		let boardString = "";
		for (let y = 0; y < 8; y++) {
			for (let x = 0; x < 8; x++) {
				let realX = (x + 0.5) * cellWidth + s.width / 3 - boardWidth;
				let realY = (y + 0.5) * cellWidth + 50;

				const color = s.color(s.get(realX, realY));

				const type = pieceInfos.find((p) => areColorsEqual(color, p.col))?.type;

				boardString += type == undefined ? "." : PieceType[type];
			}
			boardString += "\n";
		}
		boardString = boardString.slice(0, -1);

		return boardString;
	}

	function searchSolutions() {
		console.log("Searching...");

		const board = getBoardString();

		const solutions = solutionFinder.searchSolutions(board);
		const container = document.getElementById("resultsContainer");
		container.innerHTML = "";

		if (solutions.length == 0) {
			const text = document.createElement("p");
			text.innerHTML = "Ingen løsninger fundet!";
			text.style.textAlign = "center";
			text.style.gridColumnEnd = "3";
			text.style.fontSize = "24px";
			container.appendChild(text);
		}

		let i = 1;
		for (const solution of solutions) {
			const div = document.createElement("div");
			div.innerHTML = `<p style="text-align:left; padding: 5 10;"><b>${i}. <span style="float:right;">id #${solution.id}</span></b></p>`;

			container.appendChild(div);

			boardDrawer.drawBoard(solution.str, div);

			if (i == 1000) break;
			i++;
		}

		console.log("Done...");
	}
};

start();

function start() {
	if (document.getElementById("resultsContainer") == null) {
		setTimeout(start, 10);
		return;
	}

	const container = document.getElementById("boardContainer");
	new p5(inputCanvas, container);
}
