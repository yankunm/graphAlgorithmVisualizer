let cols = 50;
let rows = 50;
let grid = new Array(cols); // Create a new array with length cols

let openSet = [];
let closedSet = [];
let start;
let end;
let w, h;
let path = [];
let current = null;

let bgcolor = 255;
let pathcolor = "red";

class Node {
  constructor (i, j) {
    this.i = i;
    this.j = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbors = [];
    this.previous = null;
    this.wall = false;

    if(random(1) < 0.4){
      this.wall = true;
    }

    this.show = function(color) {
      if(this.wall){
        fill("black");
        stroke(color);
        ellipse(this.i * w + w/2, this.j * h + h/2, w/2, h/2);
      }
      // }
      // rect(this.i * w, this.j * h, w - 1, h - 1);
    };

    this.addNeighbors = function(grid) {
      let i = this.i;
      let j = this.j;
      if(i < cols - 1){
        this.neighbors.push(grid[i + 1][j]);
      }
      if(i > 0) {
        this.neighbors.push(grid[i - 1][j]);
      }
      if(j < rows - 1) {
        this.neighbors.push(grid[i][j + 1]);
      }
      if(j > 0) {
        this.neighbors.push(grid[i][j - 1]);
      }
      if(i > 0 && j > 0){
        this.neighbors.push(grid[i - 1][j - 1]);
      }
      if(i < cols - 1 && j > 0){
        this.neighbors.push(grid[i + 1][j - 1]);
      }
      if(i > 0 && j < rows - 1){
        this.neighbors.push(grid[i - 1][j + 1]);
      }
      if(i < cols - 1 && j < rows - 1){
        this.neighbors.push(grid[i + 1][j + 1]);
      }
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
  background(bgcolor);

  // while openSet is not empty
  if (openSet.length > 0) {

    // Find  winner in openSet = one with the lowest f score
    let winner = 0;
    for (let i = 0; i < openSet.length; i++){
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }
    current = openSet[winner];

    // Where we are done
    if (current === end){
      noLoop();
      console.log("DONE!");
    }

    // openSet.remove(current)
    removeFromArray(openSet, current);
    closedSet.push(current);

    let neighbors = current.neighbors;
    // for each neighbor
    for(let i = 0; i < neighbors.length; i++){
      let neighbor = neighbors[i];

      if(!closedSet.includes(neighbor) && !neighbor.wall){
        // Calculate g Score
        let tempG = current.g + 1;

        if(openSet.includes(neighbor)){
          if(tempG < neighbor.g){
            neighbor.g = tempG;
          }
        } else {
          neighbor.g = tempG;
          openSet.push(neighbor);
        }

        // calculate heuristic
        neighbor.h = heuristic(neighbor, end);
        neighbor.f = neighbor.g + neighbor.h; // the fscore for this node
        neighbor.previous = current;
      }
    }

  } else {
    // no solution
    console.log("no solution");
    noLoop();
  }
  displayGrid();
  displayPath();
}

// Calls the show function at each node in grid
function displayGrid() {
  for (let i = 0; i < cols; i++){
    for(let j = 0; j < rows; j++){
      grid[i][j].show("black");
    }
  }
  for (let i = 0; i < closedSet.length; i++){
    closedSet[i].show(color(255, 0, 0)); // Closed Set Nodes are Red
  }
  for (let i = 0; i < openSet.length; i++){
    openSet[i].show(color(0, 255, 0)); // Open Set Nodes are Green
  }
  
}

function displayPath() {
  // Find the path
  path = [];
  let temp = current;
  path.push(temp);
  while(temp.previous){
    path.push(temp.previous);
    temp = temp.previous;
  }
  // for (let i = 0; i < path.length; i++){
  //   path[i].show(color(0, 0, 255)); // Path Nodes are Blue
  // }

  noFill();
  stroke(pathcolor);
  strokeWeight(w/2);
  beginShape();
  for(let i = 0; i < path.length; i++){
    vertex(path[i].i * w + w/2, path[i].j * h + h/2);
  }
  endShape();

}

function initGrid() {
  // Initialize each row filled with nodes
  for(let i = 0; i < cols; i++){
    grid[i] = new Array(rows);
    for(let j = 0; j < rows; j++){
      grid[i][j] = new Node(i, j);
    }
  }

  // Initialize neighbors for each node
  for(let i = 0; i < cols; i++){
    for(let j = 0; j < rows; j++){
      grid[i][j].addNeighbors(grid);
    }
  }
}

function initStartingPoint() {
  start = grid[0][0];
  end = grid[cols-1][rows-1];
  start.wall = false;
  end.wall = false;
}

function removeFromArray(arr, elt) {
  for (let i = arr.length - 1; i >= 0; i--){
    if(arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

function heuristic(a, b){
  let d = abs(a.i - b.i) + abs(a.j - b.j);
  return d;
}