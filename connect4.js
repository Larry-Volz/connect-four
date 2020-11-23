/*
IMPROVEMENTS TO ORIGINAL
- Used setTimeout for a few microseconds delay to fix winning subroutine to place piece FIRST so player can SEE 
the four in a row before the win sequence
- Used a reversed gradient to highlight the winning pieces
  - refactored the code to check for 4 in a row into functions so I could use them to acces the coordinates 
  needed to visually highlight the win
  - used set interval to increase/decrease size and transition in CSS to make it smooth
  - Do Play again prompt refresh to restart the game (on no go to my portfolio)
- make table responsive for smaller devices
- create animation subroutine for dropping pieces
*/

/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const PORTFOLIO = "https://www.larry-volz.com/software-development-portfolio";
const COLOR = ["","red", "blue"];

const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = 1; // active player: 1 or 2
let board = []; // array of rows, each row is array of cells  (board[y][x])

let winningFour = [[]];

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

// function makeBoard() {
//   // TODO: set "board" to empty HEIGHT x WIDTH matrix array
//   for (let h = 0; h < HEIGHT; h++){
//     let temp = [];
//     for (let w = 0; w < WIDTH; w++) {
//       // console.log(`h:${h}, w:${w}`);
//       temp.push(0); //fill with 0's - chose over nulls so I can use switch statement later
      
//     }
//     board.push(temp);
//   }
//   console.log(board);
// }

function makeBoard() {
  for (let y = 0; y < HEIGHT; y++) {
    board.push(Array.from({ length: WIDTH }));
  }
}


/** makeHtmlBoard: make HTML table and row of column tops. */

function makeHtmlBoard() {
  htmlBoard = document.querySelector("#board");

  // TODO: Create top row & listener
  let top = document.createElement("tr");
  top.setAttribute("id", "column-top");

  top.addEventListener("click", handleClick);

  for (let x = 0; x < WIDTH; x++) {
    let headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    top.append(headCell);
  }
  htmlBoard.append(top);

  // Creates grid
  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);
      row.append(cell);
    }
    htmlBoard.append(row);
  }
}



/** findSpotForCol: given column x, return top empty y (null if filled) */

function findSpotForCol(x) {
  // finds the empty vertical slot for a given x value
  for (let y = HEIGHT-1; y >=0; y--){
    if (!board[y][x]) return y;
  }
  return null;
}

/** placeInTable: update DOM to place piece into HTML table of board */

function placeInTable(y, x) {
  // Makes a div and inserts into correct table cell
  let div = document.createElement("div");
  div.classList.add("piece");
  div.classList.add(`p${currPlayer}`);
  // div.style.backgroundColor = COLOR[currPlayer-1];
  let cell = document.getElementById(`${y}-${x}`);
  cell.append(div);
  console.log("in placeInTable");

}

//functions to check for 4 in a row
let getHoriz = (y,x) => [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
let getVert = (y,x) => [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
let getDiagDR = (y,x) => [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
let getDiagDL = (y,x) => [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];


/** endGame: announce game end */

function endGame(msg) {

  //visually highlights the disks that are 4 in a row 
  for (let disk = 0; disk < 4; disk++) {
    let y1 = winningFour[disk][0];
    let x1 = winningFour[disk][1]
    highlight = document.getElementById(`${y1}-${x1}`);
    highlight.classList.add(`p${currPlayer}Win`);

  }
  // Pops up winning alert message
  //used setTimeout because the alert was popping up before the screen had the chance
  //to re-draw the piece which was VERY unsatisfying to the players
  
  setTimeout(() => {
    let playAgain = confirm(msg);
    if(playAgain) {location.reload()}
    else (window.location.replace(PORTFOLIO));
    
  }, 2);
}


/* ---------------------------------- MAIN GAME LOOP from EventListener -----------------------------------------*/

/** handleClick: handle click of column top to play piece */
function handleClick(evt) {
  // get x from ID of clicked cell
  let x = +evt.target.id;

  // get next spot in column (if none, ignore click)
  let y = findSpotForCol(x);
  if (y === null) {
    return;
  }

  // place piece in board and add to HTML table
  placeInTable(y, x);

  // TODO: add line to update in-memory board
  board[y][x] = currPlayer;

  // check for win

  if (checkForWin()) {
    return endGame(`${COLOR[currPlayer].toUpperCase()} Wins!\nWant to play again?`);
  }

  // check for tie
  // TODO: check if all cells in board are filled; if so call, call endGame


  // switch players
  // currPlayer 1 <-> 2
  if (currPlayer === 1) { currPlayer = 2} else { currPlayer = 1};
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */

function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    // cells: list of four (y, x) cells

    //  returns true IF ALL are legal coordinates...
    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        // AND all match currPlayer (all the same color)
        board[y][x] === currPlayer
    );
  }

  //Create all the sequences of 4 on the board and make into arrays of coordinates
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      //for each column (x) check and see if there are 4 in a row horizontally
      //make each check into a 2d array
      let horiz = getHoriz(y,x);
      //then vertically
      let vert = getVert(y,x);
      
      //then for each diagonal direction
      let diagDR = getDiagDR(y,x);
      let diagDL = getDiagDL(y,x);
      


      //then send through _win to see if any of those are legal sequences of four
      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        if (_win(horiz)) {
          winningFour = getHoriz(y,x);
          console.log('horizontal win');
        } else if (_win(vert)){
          winningFour = getVert(y,x);
          console.log('vertical win');
        } else if (_win(diagDR)){
          winningFour = getDiagDR(y,x)
          console.log('diagRT win');
        } else {
          winningFour = getDiagDL(y,x);
          console.log('diagLt win');
        }
        //return true if a win
        return true;
      }
    }
  }
}

makeBoard();
makeHtmlBoard();
