interface Solution {
	id: number;
	str: string;
}

class SolutionFinder {
	allSolutions: Solution[];

	constructor() {
		const solutionStrings = solutions.split("\n\n");
		this.allSolutions = solutionStrings.map((s) => ({
			id: parseInt(s.split("\n")[0]),
			str: s.split("\n").slice(1).join("\n"),
		}));
	}

	searchSolutions(searchBoard: string): Solution[] {
		let solutions: Solution[] = [];

		for (const solution of this.allSolutions) {
			let isMatch = true;
			for (let i = 0; i < solution.str.length; i++) {
				const searchL = searchBoard[i];
				const solutionL = solution.str[i];

				if (searchL == ".") continue;
				if (searchL != solutionL) {
					isMatch = false;
					break;
				}
			}
			if (isMatch) solutions.push(solution);
		}

		return solutions;
	}
}
