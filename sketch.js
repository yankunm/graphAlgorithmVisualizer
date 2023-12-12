let cols = 50;
let rows = 50;
let grid;

let status;

let openSet = [];
let closedSet = [];
let start;
let end;
let w, h;
let path = [];
let current = null;

let isHovered = false;
let button;
let gridButton;

let bgcolor;
let pathcolor = "red";
let wallcolor;

let wallprobabilitySlider;
let regenerateGrid = true;
let AStarRun = false;

// Beginning and End Points Initialization Indicators
let startIsSet = false;
let endIsSet = false;

let reset = false;

let clickNumber = 1;

// Initialize
function setup() {
  createCanvas((windowHeight - 100) * 1.2, windowHeight - 100);
  initControlPanel();  
}

// Loop
function draw() {
  // Grid Refresh:
  // regenerateGrid is true everytime user clicks on screen
  // goal is to regenerate a grid and refresh everything
  if(regenerateGrid){
    let r = random(200);
    let g = random(255);
    let b = random(255);
    bgcolor = color(r, g, b)
    wallcolor = color(255 - r, 255 - g, 255 - b);
    // reset state and stop running A* if its running
    current = null;
    openSet = [];
    openSet.push(start);
    closedSet = [];
    AStarRun = false;
    initGrid(rows, cols);
    regenerateGrid = false;
    clickNumber = 1;
    startIsSet = false;
    endIsSet = false;
    reset = false;
    printStatus("Select Starting Point");
  }
  if(reset){
    // reset state and stop running A* if its running
    current = null;
    openSet = [];
    openSet.push(start);
    closedSet = [];
    AStarRun = false;
    if(start != null) {
      start.start = false;
    }
    if(end != null) {
      end.end = false;
    }
    regenerateGrid = false;
    clickNumber = 1;
    startIsSet = false;
    endIsSet = false;
    reset = false;
    printStatus("Select Starting Point");
  }
  // Draws Background AFTER bgcolor is set to some new color everytime
  // Grid is refreshed
  background(bgcolor);
  // Choose Start and End:
  // User can choose starting point and ending point if pressed
  // somewhere within grid, everything else except display functions,
  // will only operate if the user has selected starting and ending 
  // points. 
  if(startIsSet && endIsSet){
    // A* Algorithm:
    // If User click on Run A* button then A* algorithm will run
    // Everytime the user clicks the button the A* algorithm will 
    // refresh and run again
    if(AStarRun){
      AStarAlgorithm();
    }
  } else {
    AStarRun = false;
  }
  // Always display grid and display path if there is a path to
  // display, this is determined by whether "current" is null or not!
  // if current is not null, that means A* ran and has not refreshed,
  // then continue displaying the path
  displayGrid();
  displayPath();
}

// ________________INITIALIZATION________________________

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
  initGridButton();
  initResetButton();
  // Make wall probability a slider
  wallprobabilitySlider = createSlider(0, 0.7, 0.2, 0.1);
  wallprobabilitySlider.position(120, height + 60);
  wallprobabilitySlider.size(80);
  
  status = createP("Select Starting Point");
  status.position(width - 150, height);
  
  let textElement = createP('Wall Density:');
  textElement.position(10, height + 49);
  
  let statusElement = createP('Status:');
  statusElement.position(width - 200, height);
}

// ________________ALGORITHMS________________________

function AStarAlgorithm() {
  // while openSet is not empty
  // reinitialize openSet
  printStatus("A* is Running");
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
      printStatus("Target Reached!!");
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
    printStatus("No Solution");
    AStarRun = false;
  }
}

// ________________ALGORITHM HELPERS_________________________

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

// ________________DISPLAY FUNCTIONS_________________________

function displayGrid(){
  for (let i = 0; i < cols; i++){
    for(let j = 0; j < rows; j++){
      grid[i][j].show(wallcolor);
    }
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
    push();
    noFill();
    stroke(pathcolor);
    strokeWeight(w/2);
    beginShape();
    for(let i = 0; i < path.length; i++){
      vertex(path[i].i * w + w/2, path[i].j * h + h/2);
    }
    endShape();
    pop();
  }
}

function printStatus(text) {
  if(status) status.remove();
  status = createP(text);
  status.position(width - 150, height);
}

// ________________BUTTONS_________________________

function initButton(){
  button = createButton('Run A*');
  button.position(10, height + 10);
  
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

function initGridButton(){
  gridButton = createButton('New Board');
  gridButton.position(230, height + 50);
  gridButton.style('background-color', 'blue'); // Set background color
  gridButton.style('color', 'white'); // Set text color
  gridButton.style('padding', '10px 20px'); // Set padding
  gridButton.style('font-size', '16px'); // Set font size
  gridButton.style('font-family', 'Arial, sans-serif'); // Set font family
  gridButton.style('border', 'none'); // Remove border
  gridButton.style('border-radius', '5px'); // Add border radius
  // Set up mouseOver and mouseOut events for the button
  gridButton.mouseOver(onHoverGB);
  gridButton.mouseOut(onHoverOutGB);

  // Use the button to change the background color.
  gridButton.mousePressed(() => {
    // reset state for A* to run correctly
    regenerateGrid = true;
  });
}

function initResetButton(){
  resetButton = createButton('Clear Board');
  resetButton.position(370, height + 50);
  
  resetButton.style('background-color', 'green'); // Set background color
  resetButton.style('color', 'white'); // Set text color
  resetButton.style('padding', '10px 20px'); // Set padding
  resetButton.style('font-size', '16px'); // Set font size
  resetButton.style('font-family', 'Arial, sans-serif'); // Set font family
  resetButton.style('border', 'none'); // Remove border
  resetButton.style('border-radius', '5px'); // Add border radius
  // Set up mouseOver and mouseOut events for the button
  resetButton.mouseOver(onHoverR);
  resetButton.mouseOut(onHoverOutR);

  // Use the button to change the background color.
  resetButton.mousePressed(() => {
    // reset state for A* to run correctly
    reset=true;
  });
}

// ________________EVENTS________________________

// first click: initialize start
// second click: initialize end
function mousePressed(){
  if(mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
    if(clickNumber === 1) {
      let col = Math.floor(mouseX / w);
      let row = Math.floor(mouseY / h);
      grid[col][row].start = true;
      start = grid[col][row];
      startIsSet = true;
      clickNumber++;
      printStatus("Select Ending Point");
    } else if(clickNumber === 2) {
      let col = Math.floor(mouseX / w);
      let row = Math.floor(mouseY / h);
      grid[col][row].end = true;
      end = grid[col][row];
      endIsSet = true;
      clickNumber++;
      printStatus("Ready!");
    }
  }
}

// Functions to be called when the Run A* button is hovered over
function onHover() {
  button.style('background-color', '#ff5733'); // Set hover background color
  isHovered = true;
}

function onHoverOut() {
  if (!isHovered) {
    button.style('background-color', 'red'); // Set initial background color
  }
  button.style('background-color', 'red'); // Set background color
  isHovered = false;
}

// Functions to be called when the Grid button is hovered over
function onHoverGB() {
  gridButton.style('background-color', 'lightblue'); // Set hover background color
  isHovered = true;
}

function onHoverOutGB() {
  if (!isHovered) {
    gridButton.style('background-color', 'blue'); // Set initial background color
  }
  gridButton.style('background-color', 'blue'); // Set background color
  isHovered = false;
}

// Functions to be called when the Clear button is hovered over
function onHoverR() {
  resetButton.style('background-color', 'lightgreen'); // Set hover background color
  isHovered = true;
}

function onHoverOutR() {
  if (!isHovered) {
    resetButton.style('background-color', 'green'); // Set initial background color
  }
  resetButton.style('background-color', 'green'); // Set background color
  isHovered = false;
}


// ________________CUSTOM NODE CLASS________________________

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
    this.start = false;
    this.end = false;

    if(random(1) < wallprobability){
      this.wall = true;
    }

    this.show = function(color) {
      if(this.wall){
        fill(wallcolor);
        stroke("black");
        strokeWeight(w/10);
        rect(this.i * w, this.j * h, w - 1, h - 1);
        // ellipse(this.i * w + w/2, this.j * h + h/2, w, h);
      }
      if(this.start){
        this.wall = false;
        fill("red");
        noStroke();
        ellipse(this.i * w + w/2, this.j * h + h/2, w, h);
      }
      if(this.end){
        this.wall = false;
        fill("#97DA6F");
        noStroke();
        ellipse(this.i * w + w/2, this.j * h + h/2, w, h);
      }
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

