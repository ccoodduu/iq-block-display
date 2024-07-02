class BoardDrawer {
	width: number;

	constructor(width: number) {
		this.width = width;
	}

	setWidth(width: number) {
		this.width = width;
	}

	drawBoard(board: string, parent: HTMLElement): p5.Renderer {
		let canvas: p5.Renderer;

		new p5((s: p5) => {
			s.setup = () => {
				canvas = s.createCanvas(this.width, this.width);
				s.clear();
				s.translate(this.width / 2, this.width / 2);
				Board.drawBoardString(s, board, this.width);
			};
		}, parent);

		return canvas;
	}
}
