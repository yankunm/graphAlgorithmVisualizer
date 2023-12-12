let cols = 50;
let rows = 50;
let grid;

let openSet = [];
let closedSet = [];
let start;
let end;
let w, h;
let path = [];
let current = null;

let isHovered = false;
let button;

let bgcolor;
let pathcolor = "red";
let wallcolor;

let wallprobabilitySlider;
let regenerateGrid = true;
let AStarRun = false;

// Initialize
function setup() {
  createCanvas(windowWidth, windowHeight - 100);
  console.log('A*');
  initControlPanel();  
}

// Loop
function draw() {
  // AStarAlgorithm();
  if(regenerateGrid){
    bgcolor = color(random(255), random(255), random(255))
    wallcolor = color(random(255), random(255), random(255));
    current = null;
    // reset state and stop running A* if its running
    openSet = [];
    openSet.push(start);
    closedSet = [];
    AStarRun = false;
    initGrid(rows, cols);
    initStartingPoint();
    regenerateGrid = false;
  }
  background(bgcolor);
  if(AStarRun){
    AStarAlgorithm();
  }
  displayGrid();
  displayPath(); // Fix this part
  // I have to add in that AStarAlgorithm could refresh with every click me, and that display Path and display the path when path is not empty
}

function mousePressed(){
  if(mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
    regenerateGrid = true;
  }
}

function initGrid(rows, cols) {
  // Fix scaling
  w = width / cols;
  h = height / rows;
  wallprobability = wallprobabilitySlider.value();
  grid = new Array(cols);
  // console.log(grid);
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

function initControlPanel() {
  initButton();
  // Make wall probability a slider
  wallprobabilitySlider = createSlider(0, 0.7, 0.2, 0.1);
  wallprobabilitySlider.position(120, height + 60);
  wallprobabilitySlider.size(80);
  
  let textElement = createP('Wall Density:');
  textElement.position(10, height + 49);
}

function displayGrid(){
  for (let i = 0; i < cols; i++){
    for(let j = 0; j < rows; j++){
      grid[i][j].show(wallcolor);
    }
  }
  // for (let i = 0; i < closedSet.length; i++){
  //   closedSet[i].show(color(255, 0, 0)); // Closed Set Nodes are Red
  // }
  // for (let i = 0; i < openSet.length; i++){
  //   openSet[i].show(color(0, 255, 0)); // Open Set Nodes are Green
  // }
}


function AStarAlgorithm() {
  // while openSet is not empty
  // reinitialize openSet
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
      AStarRun = false;
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
    AStarRun = false;
  }
}

// Calls the show function at each node in grid
function displayPath() {
  // Find the path
  path = [];
  if(current != null){
    let temp = current;
    path.push(temp);
    while(temp.previous){
      path.push(temp.previous);
      temp = temp.previous;
    }
    // for (let i = 0; i < path.length; i++){
    //   path[i].show(color(0, 0, 255)); // Path Nodes are Blue
    // }

    push();
    noFill();
    stroke(pathcolor);
    strokeWeight(w);
    beginShape();
    for(let i = 0; i < path.length; i++){
      vertex(path[i].i * w + w/2, path[i].j * h + h/2);
    }
    endShape();
    pop();
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

function initButton(){
  button = createButton('Run A*');
  button.position(0, height + 10);
  
  button.style('background-color', 'red'); // Set background color
  button.style('color', 'white'); // Set text color
  button.style('padding', '10px 20px'); // Set padding
  button.style('font-size', '16px'); // Set font size
  button.style('font-family', 'Arial, sans-serif'); // Set font family
  button.style('border', 'none'); // Remove border
  button.style('border-radius', '5px'); // Add border radius
  // Set up mouseOver and mouseOut events for the button
  button.mouseOver(onHover);
  button.mouseOut(onHoverOut);

  // Use the button to change the background color.
  button.mousePressed(() => {
    // reset state for A* to run correctly
    openSet = [];
    openSet.push(start);
    closedSet = [];
    AStarRun = true;
  });
}

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

    if(random(1) < wallprobability){
      this.wall = true;
    }

    this.show = function(color) {
      if(this.wall){
        fill(wallcolor);
        stroke(color);
        rect(this.i * w, this.j * h, w - 1, h - 1);
        // ellipse(this.i * w + w/2, this.j * h + h/2, w/2, h/2);
      }
      // }
      // fill(color);
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
      // // diagonal
      // if(i > 0 && j > 0){
      //   this.neighbors.push(grid[i - 1][j - 1]);
      // }
      // if(i < cols - 1 && j > 0){
      //   this.neighbors.push(grid[i + 1][j - 1]);
      // }
      // if(i > 0 && j < rows - 1){
      //   this.neighbors.push(grid[i - 1][j + 1]);
      // }
      // if(i < cols - 1 && j < rows - 1){
      //   this.neighbors.push(grid[i + 1][j + 1]);
      // }
    };
  }
}

// Function to be called when the button is hovered over
function onHover() {
  button.style('background-color', '#ff5733'); // Set hover background color
  isHovered = true;
}

// Function to be called when the mouse is not over the button
function onHoverOut() {
  if (!isHovered) {
    button.style('background-color', '#4CAF50'); // Set initial background color
  }
  button.style('background-color', 'red'); // Set background color
  isHovered = false;
}
