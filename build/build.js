var Board = (function () {
    function Board() {
    }
    Board.drawBoardString = function (s, str, width) {
        var lines = str.split("\n");
        s.push();
        s.translate(-width / 2, -width / 2);
        var stepSize = width / 8;
        s.strokeWeight(0);
        for (var y = 0; y < 8; y++) {
            var _loop_1 = function (x) {
                var xPos = stepSize * x;
                var yPos = stepSize * y;
                var letter = lines[y][x];
                if (letter == ".")
                    return "continue";
                var type = PieceType[letter];
                var info = pieceInfos.filter(function (t) { return t.type == type; })[0];
                s.fill(info.col);
                s.square(xPos, yPos, stepSize + 1);
            };
            for (var x = 0; x < 8; x++) {
                _loop_1(x);
            }
        }
        s.strokeWeight(5);
        s.stroke(0);
        s.noFill();
        s.square(0, 0, width);
        s.pop();
    };
    return Board;
}());
var BoardDrawer = (function () {
    function BoardDrawer(width) {
        this.width = width;
    }
    BoardDrawer.prototype.setWidth = function (width) {
        this.width = width;
    };
    BoardDrawer.prototype.drawBoard = function (board, parent) {
        var _this = this;
        var canvas;
        new p5(function (s) {
            s.setup = function () {
                canvas = s.createCanvas(_this.width, _this.width);
                s.clear();
                s.translate(_this.width / 2, _this.width / 2);
                Board.drawBoardString(s, board, _this.width);
            };
        }, parent);
        return canvas;
    };
    return BoardDrawer;
}());
var onClick;
var inputCanvas = function (s) {
    var pieces = [];
    var offsetX = 0;
    var offsetY = 0;
    var dragPieceIndex = -1;
    var boardWidth = 0;
    var cellWidth = 0;
    var solutionFinder;
    var boardDrawer = new BoardDrawer(200);
    s.setup = function () {
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
        for (var i = 0; i < pieceInfos.length; i++) {
            var type = pieceInfos[i].type;
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
    s.draw = function () {
        s.clear();
        boardWidth = Math.min((s.width - 100) / 4, s.height - 100);
        cellWidth = boardWidth / 8;
        s.translate(s.width / 3 - boardWidth, 50);
        drawBoard();
        for (var i = 0; i < pieces.length; i++) {
            var piece = pieces[i];
            if (i == dragPieceIndex) {
                drawPiece(s.mouseX - offsetX, s.mouseY - offsetY, piece.type, piece.rot);
            }
            else {
                var physicalPosition = getPhysicalPosition(pieces[i]);
                drawPiece(physicalPosition[0], physicalPosition[1], piece.type, piece.rot);
            }
        }
        function drawPiece(xPos, yPos, type, rotation) {
            s.push();
            var info = pieceInfos.filter(function (t) { return t.type == type; })[0];
            s.fill(info.col);
            s.noStroke();
            s.translate(xPos, yPos);
            var rows = info.shape.split(" ");
            for (var y = 0; y < rows.length; y++) {
                var row = rows[y];
                for (var x = 0; x < row.length; x++) {
                    var l = row[x];
                    if (l == ".")
                        continue;
                    var centerX = row.length / 2;
                    var centerY = rows.length / 2;
                    var newPos = rotatePoint(rotation, x, y, centerX, centerY);
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
    s.mousePressed = function () {
        var color = s.color(s.get(s.mouseX, s.mouseY));
        var _loop_2 = function (i) {
            var type = pieces[i].type;
            var info = pieceInfos.filter(function (t) { return t.type == type; })[0];
            var isPressed = color.toString() == info.col.toString();
            if (!isPressed)
                return "continue";
            if (s.mouseButton == s.RIGHT) {
                pieces[i].rot = (pieces[i].rot + 1) % 8;
                if (isOutOfBounds(pieces[i].type)) {
                    pieces[i].xGridPos = -1;
                    pieces[i].yGridPos = -1;
                }
                return { value: void 0 };
            }
            dragPieceIndex = i;
            var physicalPosition = getPhysicalPosition(pieces[i]);
            offsetX = s.mouseX - physicalPosition[0];
            offsetY = s.mouseY - physicalPosition[1];
            return { value: void 0 };
        };
        for (var i = 0; i < pieces.length; i++) {
            var state_1 = _loop_2(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
    };
    s.mouseReleased = function () {
        if (dragPieceIndex == -1)
            return;
        var piece = pieces[dragPieceIndex];
        var xPos = s.mouseX - offsetX;
        var yPos = s.mouseY - offsetY;
        piece.xGridPos = Math.round(xPos / cellWidth);
        piece.yGridPos = Math.round(yPos / cellWidth);
        dragPieceIndex = -1;
        if (isOutOfBounds(piece.type)) {
            piece.xGridPos = -1;
            piece.yGridPos = -1;
        }
    };
    function isOutOfBounds(type) {
        var piece = pieces.find(function (t) { return t.type == type; });
        var info = pieceInfos.find(function (t) { return t.type == type; });
        var rows = info.shape.split(" ");
        for (var y = 0; y < rows.length; y++) {
            var row = rows[y];
            for (var x = 0; x < row.length; x++) {
                var l = row[x];
                if (l == ".")
                    continue;
                var centerX = row.length / 2;
                var centerY = rows.length / 2;
                var newPos = rotatePoint(piece.rot, x, y, centerX, centerY);
                var newX = piece.xGridPos + newPos[0];
                var newY = piece.yGridPos + newPos[1];
                if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) {
                    piece.xGridPos = -1;
                    piece.yGridPos = -1;
                    return true;
                }
            }
        }
        return false;
    }
    s.windowResized = function () {
        s.resizeCanvas(s.windowWidth, s.windowHeight / 2 + 100);
    };
    function getPhysicalPosition(piece) {
        if (piece.xGridPos == -1 && piece.yGridPos == -1)
            return [boardWidth + 50 + piece.defaultX * cellWidth, piece.defaultY * cellWidth];
        return [piece.xGridPos * cellWidth, piece.yGridPos * cellWidth];
    }
    function getBoardString() {
        var _a;
        var boardString = "";
        for (var y = 0; y < 8; y++) {
            var _loop_3 = function (x) {
                var realX = (x + 0.5) * cellWidth + s.width / 3 - boardWidth;
                var realY = (y + 0.5) * cellWidth + 50;
                var color_1 = s.color(s.get(realX, realY));
                var type = (_a = pieceInfos.find(function (p) { return p.col.toString() == color_1.toString(); })) === null || _a === void 0 ? void 0 : _a.type;
                boardString += type == undefined ? "." : PieceType[type];
            };
            for (var x = 0; x < 8; x++) {
                _loop_3(x);
            }
            boardString += "\n";
        }
        boardString = boardString.slice(0, -1);
        return boardString;
    }
    function searchSolutions() {
        console.log("Searching...");
        var board = getBoardString();
        var solutions = solutionFinder.searchSolutions(board);
        var container = document.getElementById("resultsContainer");
        container.innerHTML = "";
        if (solutions.length == 0) {
            var text_1 = document.createElement("p");
            text_1.innerHTML = "Ingen løsninger fundet!";
            text_1.style.textAlign = "center";
            text_1.style.gridColumnEnd = "3";
            text_1.style.fontSize = "24px";
            container.appendChild(text_1);
        }
        var i = 1;
        for (var _i = 0, solutions_1 = solutions; _i < solutions_1.length; _i++) {
            var solution = solutions_1[_i];
            var div = document.createElement("div");
            div.innerHTML = "<p style=\"text-align:left; padding: 5 10;\"><b>".concat(i, ". <span style=\"float:right;\">id #").concat(solution.id, "</span></b></p>");
            container.appendChild(div);
            boardDrawer.drawBoard(solution.str, div);
            if (i == 1000)
                break;
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
    var container = document.getElementById("boardContainer");
    new p5(inputCanvas, container);
}
var PieceType;
(function (PieceType) {
    PieceType[PieceType["A"] = 0] = "A";
    PieceType[PieceType["B"] = 1] = "B";
    PieceType[PieceType["C"] = 2] = "C";
    PieceType[PieceType["D"] = 3] = "D";
    PieceType[PieceType["E"] = 4] = "E";
    PieceType[PieceType["F"] = 5] = "F";
    PieceType[PieceType["G"] = 6] = "G";
    PieceType[PieceType["H"] = 7] = "H";
    PieceType[PieceType["I"] = 8] = "I";
    PieceType[PieceType["J"] = 9] = "J";
})(PieceType || (PieceType = {}));
var Rotation;
(function (Rotation) {
    Rotation[Rotation["UP"] = 0] = "UP";
    Rotation[Rotation["RIGHT"] = 1] = "RIGHT";
    Rotation[Rotation["DOWN"] = 2] = "DOWN";
    Rotation[Rotation["LEFT"] = 3] = "LEFT";
    Rotation[Rotation["FLIPPED_UP"] = 4] = "FLIPPED_UP";
    Rotation[Rotation["FLIPPED_RIGHT"] = 5] = "FLIPPED_RIGHT";
    Rotation[Rotation["FLIPPED_DOWN"] = 6] = "FLIPPED_DOWN";
    Rotation[Rotation["FLIPPED_LEFT"] = 7] = "FLIPPED_LEFT";
})(Rotation || (Rotation = {}));
var pieceInfos;
function rotatePoint(rotation, x, y, x2, y2) {
    var translatedX = x + 0.5 - x2;
    var translatedY = y + 0.5 - y2;
    var rotatedX;
    var rotatedY;
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
    var finalX = Math.floor(rotatedX + x2 - 0.5);
    var finalY = Math.floor(rotatedY + y2 - 0.5);
    return [finalX, finalY];
}
var SolutionFinder = (function () {
    function SolutionFinder() {
        var solutionStrings = solutions.split("\n\n");
        this.allSolutions = solutionStrings.map(function (s) { return ({
            id: parseInt(s.split("\n")[0]),
            str: s.split("\n").slice(1).join("\n"),
        }); });
    }
    SolutionFinder.prototype.searchSolutions = function (searchBoard) {
        var solutions = [];
        for (var _i = 0, _a = this.allSolutions; _i < _a.length; _i++) {
            var solution = _a[_i];
            var isMatch = true;
            for (var i = 0; i < solution.str.length; i++) {
                var searchL = searchBoard[i];
                var solutionL = solution.str[i];
                if (searchL == ".")
                    continue;
                if (searchL != solutionL) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch)
                solutions.push(solution);
        }
        return solutions;
    };
    return SolutionFinder;
}());
//# sourceMappingURL=build.js.map