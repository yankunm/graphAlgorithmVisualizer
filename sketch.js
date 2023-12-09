let cols = 10;
let rows = 10;
let grid = new Array(cols); // Create a new array with length cols

let openSet = [];
let closedSet = [];
let start;
let end;
let w, h;

class Node {
  constructor (i, j) {
    this.x = i;
    this.y = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;

    this.show = function(color) {
      fill(color);
      stroke(0);
      rect(this.x * w, this.y * h, w - 1, h - 1);
    };
  }
}

// Initialize
function setup() {
  createCanvas(400, 400);
  console.log('A*');

  // Fix scaling
  w = width / cols;
  h = height / rows;

  // Initialize 2D Array
  initGrid();
  initStartingPoint();

  // add start to end of openSet
  openSet.push(start);

  
  // console.log(grid);

}

// Loop
function draw() {
  background(220);

  // while openSet is not empty
  if (openSet.length > 0) {

  } else {

  }

  displayGrid();
}

// Calls the show function at each node in grid
function displayGrid() {
  for (let i = 0; i < cols; i++){
    for(let j = 0; j < rows; j++){
      grid[i][j].show("pink");
    }
  }
}

function initGrid() {
  // Initialize each row filled with nodes
  for(let i = 0; i < cols; i++){
    grid[i] = new Array(rows);
    for(let j = 0; j < rows; j++){
      grid[i][j] = new Node(i, j);
    }
  }
}

function initStartingPoint() {
  start = grid[0][0];
  end = grid[cols-1][rows-1];
}