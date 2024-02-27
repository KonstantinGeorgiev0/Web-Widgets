import * as paper from 'paper';
import '../../assets/css/style2.css';
import '../../common/arrows.js';

// define elements of the page
// const sliderContainer = document.querySelector('.slider-container');
const sizeSlider = document.getElementById('sizeSlider');
const sizeLabel = document.getElementById('sizeSlider_label');
const angleSlider = document.getElementById('angleSlider');
const angleLabel = document.getElementById('angleSlider_label');
const personWeight = document.getElementById('personWeight');
const personWeightLabel = document.getElementById('personWeight_label');
const resetButton = document.getElementById('resetButton');
const forces_text = document.getElementById('forces');
const messageDiv = document.getElementById('message');
const simulateButton = document.getElementById('simulateButton');
const personPosition = document.getElementById('personPosition');
const personLabel = document.getElementById('personPosition_label');
const maxForce = document.getElementById('maxForce');
const maxForceLabel = document.querySelector('label[for="maxForce"]');
const sliders = document.querySelectorAll('input[type="range"]');

// Define light blue and dark green colors in RGB format
const lightBlueColor = [173, 216, 230];
const darkGreenColor = [0, 128, 0];
const brickRed = [80, 25, 33];

// Function to interpolate between two colors
function interpolateColor(color1, color2, ratio) {
  const resultColor = [];
  for (let i = 0; i < 3; i++) {
    resultColor[i] = Math.round(color1[i] + ratio * (color2[i] - color1[i]));
  }
  return `rgb(${resultColor[0]}, ${resultColor[1]}, ${resultColor[2]})`;
}

class Ladder {
  // impact absorption
  ABSORPTION = 0.4;
  constructor(width, height, angle, length, arrowLength, radius) {
    this.redraw(width, height, angle, length, arrowLength, radius);
  }

  redraw(width, height, angle, length, arrowLength, radius) {

    // Recreate wall and floor
    this.createWallAndFloor(width, height);

    // Recreate ladder
    this.createLadder(width, height, angle, length);

    // Recreate person
    this.createPerson(width, height, angle, length, radius);

    // Recreate arrows
    this.createArrows(width, height, angle, length, arrowLength);
  }

  resize(width, height, angle, length, arrowLength, radius) {
    // remove all elements from the canvas
    this.floor.remove();
    this.ladder.remove();

    // remove all bricks from the wall
    this.wall.forEach(brick => brick.remove());

    this.removeElements();
    this.redraw(width, height, angle, length, arrowLength, radius);
  }

  createWallAndFloor(width, height) {
    // Floor
    this.floor = new paper.Path.Rectangle(new paper.Point(0, height), new paper.Size(width, - height * 0.05));
    this.floor.fillColor = interpolateColor(lightBlueColor, darkGreenColor, 0.5);

    // Initialize an array to store the brick objects
    this.wall = [];

    const brickWidth = width / 20; // Width of each brick
    const brickHeight = height / 40; // Height of each brick
    const brickCount = 38; // Number of bricks

    for (let i = 0; i < brickCount; i++) {
      const xPos = width * 0.95;
      const yPos = i * brickHeight;

      const brick = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(xPos, yPos), new paper.Size(brickWidth, brickHeight)));
      brick.fillColor = interpolateColor(brickRed, [30,30,30], i / (brickCount - 1));

      // Store the brick object in the array
      this.wall.push(brick);
    }
  }

  createLadder(width, height, angle, length) {
    // Ladder
    this.ladder = new paper.Path();
    this.ladder.strokeColor = 'rgb(91, 94, 166)';
    this.ladder.strokeWidth = width / 70;

    let x_wall = width * 0.95;
    let y_wall = height - length * Math.cos(angle);
    let x_floor = width - length * Math.sin(angle);
    let y_floor = height * 0.95;

    // point on wall
    this.ladder.add(new paper.Point(x_wall, y_wall));

    // point on floor
    this.ladder.add(new paper.Point(x_floor, y_floor));

    // floor height
    this.floor_height = y_floor;

    // add velocity and acceleration
    this.v = 0;
    this.a = 9.81 * 10;
  }

  createArrows(width, height, angle, length, arrowLen) {
    // arrow on floor
    this.arrow1 = new paper.Shape.ArrowLine(width - length * Math.sin(angle), height * 0.95, width - length * Math.sin(angle), height * 0.95 + arrowLen);
    this.arrow1.strokeColor = 'red';
    this.arrow1.fillColor = 'red';
    this.arrow1.strokeWidth = width / 580;

    // arrow acting on ladder from wall, perpendicular to the wall (normal force)
    this.arrow2 = new paper.Shape.ArrowLine(width * 0.95, height - length * Math.cos(angle), width * 0.95 + arrowLen, height - length * Math.cos(angle));
    this.arrow2.strokeColor = 'red';
    this.arrow2.fillColor = 'red';
    this.arrow2.strokeWidth = width / 580;

    // arrow in the middle of the ladder
    let midX = ((width - length * Math.sin(angle)) + width * 0.95) / 2;
    let midY = ((height - length * Math.cos(angle)) + height * 0.95) / 2;
    this.arrow3 = new paper.Shape.ArrowLine(midX, midY, midX, midY - arrowLen);
    this.arrow3.strokeColor = 'red';
    this.arrow3.fillColor = 'red';
    this.arrow3.strokeWidth = width / 580;

    // arrow for floor friction
    this.arrow4 = new paper.Shape.ArrowLine(width - length * Math.sin(angle), height * 0.95, width - length * Math.sin(angle) - arrowLen, height * 0.95);
    this.arrow4.strokeColor = 'red';
    this.arrow4.fillColor = 'red';
    this.arrow4.strokeWidth = width / 580;

    // Create PointText objects for arrow labels
    this.arrow1Label = new paper.PointText(new paper.Point(width - length * Math.sin(angle), height * 0.94 + arrowLen));
    this.arrow1Label.justification = 'center';
    this.arrow1Label.fillColor = 'black';
    this.arrow1Label.content = 'F1y';
    this.arrow1Label.fontSize = width / 90;

    this.arrow2Label = new paper.PointText(new paper.Point(width * 0.95 + arrowLen * 0.9, height * 0.99 - length * Math.cos(angle)));
    this.arrow2Label.justification = 'center';
    this.arrow2Label.fillColor = 'black';
    this.arrow2Label.content = 'F2';
    this.arrow2Label.fontSize = width / 90;

    this.arrow3Label = new paper.PointText(new paper.Point(midX - width / 90, midY - arrowLen / 2));
    this.arrow3Label.justification = 'center';
    this.arrow3Label.fillColor = 'black';
    this.arrow3Label.content = 'Fz';
    this.arrow3Label.fontSize = width / 90;

    this.arrow4Label = new paper.PointText(new paper.Point((width * 1.005 - length * Math.sin(angle) - arrowLen) * 1.01, height * 0.95));
    this.arrow4Label.justification = 'center';
    this.arrow4Label.fillColor = 'black';
    this.arrow4Label.content = 'F1x';
    this.arrow4Label.fontSize = width / 90;
  }

  createPerson(width, height, angle, length, radius) {

    let x_wall = width * 0.95;
    let y_wall = height - length * Math.cos(angle);
    let x_floor = width - length * Math.sin(angle);
    let y_floor = height * 0.95;

    let x_pos = (x_floor + (x_wall - x_floor) / 2); // person x position
    let y_pos = (y_floor + (y_wall - y_floor) / 2); // person y position

    // create person in the middle of the ladder
    this.initialpersonPosition = new paper.Point(x_pos, y_pos);

    this.person = new paper.Path.Circle(this.initialpersonPosition, radius);
    this.person.fillColor = 'black';
  }

  updatePersonPosition(width, position, arrowLength, radius) {
    // Calculate the new position of the person based on the slider value
    let posY = this.ladder.segments[0].point.y + (this.ladder.segments[1].point.y - this.ladder.segments[0].point.y) * (1 - position);
    let posX = this.ladder.segments[0].point.x + (this.ladder.segments[1].point.x - this.ladder.segments[0].point.x) * (1 - position);

    this.person.position.x = posX;
    this.person.position.y = posY;

    // Calculate the position of arrow3 at the new position of the person
    // Update the position of arrow3
    this.arrow3.remove();
    this.arrow3 = new paper.Shape.ArrowLine(
        posX, posY, posX, posY - arrowLength
    );
    this.arrow3.strokeColor = 'red';
    this.arrow3.fillColor = 'red';
    this.arrow3.strokeWidth = width / 580;

    this.arrow3Label.position = new paper.Point(
        posX - width / 120, posY - arrowLength / 2
    );

    // update person radius
    this.person.scale(radius * 2 / this.person.bounds.width);
  }

  updateLadder(width, height, angle, length, arrowLength, radius) {
    // calculate based on current y position of the second endpoint, angle and length
    let newY = height - length * Math.cos(angle);

    // calculate based on current x position of the first endpoint, length and the angle
    let newX = width - length * Math.sin(angle);

    // update the position of the first and second endpoint
    // first endpoint is on the wall
    this.ladder.segments[0].point.y = newY;
    this.ladder.segments[1].point.x = newX;

    // remove arrows and person
    this.removeElements();
    this.createArrows(width, height, angle, length, arrowLength);
    this.createPerson(width, height, angle, length, radius);

    // update person
    this.updatePersonPosition(width, personPosition.value / 100, arrowLength, radius);
    // this.updatePersonRadius(width / 80 + (personWeight.value - 25) / 2);
  }

  removeElements() {
    // this.ladder.remove();
    this.arrow1.remove();
    this.arrow2.remove();
    this.arrow3.remove();
    this.arrow4.remove();
    // remove arrow labels
    this.arrow1Label.remove();
    this.arrow2Label.remove();
    this.arrow3Label.remove();
    this.arrow4Label.remove();
    this.person.remove();
  }

  resetLadder(width, height, length, angle, arrowLength, radius) {
    // enable all sliders at once
    sliders.forEach((slider) => {
        slider.disabled = false;
    });

    // delete everything
    this.ladder.remove();
    this.removeElements();

    // create a new ladder and arrows
    this.createLadder(width, height, angle, length);
    this.createPerson(width, height, angle, length, radius);
    this.createArrows(width, height, angle, length, arrowLength);

    // clear text in textarea
    forces_text.textContent = 'F1x: friction force \nF1y: normal force floor \nF2: normal force wall\nFz: gravitation force ';
    messageDiv.textContent = '';
  }

  simulateGravity(event) {
    // remove
    this.removeElements();

    // Update the velocity based on the acceleration
    event.delta = 0.01;
    this.v += this.a * (event.delta * 10);
    maxForce.addEventListener('input', (event) => {
      maxForceLabel.textContent = 'Max. Friction Force: ' + event.target.value + ' N';
    });
    // Calculate the change in y-coordinate based on the velocity
    const deltaY = this.v * event.delta;

    // Update the y-coordinate of first endpoint
    this.ladder.segments[0].point.y += deltaY;
  
    // Calculate the corresponding change in the x-coordinate based on deltaY
    const angle = Math.atan2(this.ladder.segments[1].point.y - this.ladder.segments[0].point.y, this.ladder.segments[1].point.x - this.ladder.segments[0].point.x);
    const deltaX = deltaY * Math.tan(angle);
  
    // Update the x-coordinate of second endpoint
    this.ladder.segments[1].point.x += deltaX;

    // check if the ladder is below the floor and if so, bounce it back up
    if (this.ladder.segments[0].point.y > this.floor_height) {
      this.v = -1 * this.v * this.ABSORPTION;
      this.ladder.segments[0].point.y = this.floor_height;
    }
  }

  simulatePhysics(mass, angle) {
    // disable all sliders at once
    sliders.forEach((slider) => {
        slider.disabled = true;
    });
    const g = 9.81; // gravitational constant
    const Ff_max = maxForce.value; // max friction force
    let position = personPosition.value / 100; // position of the person on the ladder
    // Calculate the forces
    let Fz = mass * g; // weight of the ladder
    let F1y = Fz; // vertical force from the wall
    let F2 = ( Fz * position * Math.sin(angle) ) / ( Math.cos(angle) ); // friction from the ground
    let F1x = F2; // horizontal force from the wall

    // Check if the forces are in equilibrium
    if (F1x > Ff_max) {
      // If forces are not in equilibrium, start the physics simulation
      messageDiv.innerHTML = "<b>Lateral force exceeds<br>critical friction force!<br>Ladder is falling!</b>";
      this.ladder.onFrame = null;
      forces_text.textContent = 'F1x: ' + Math.round(F1x) + ' N\nF1x > Max Friction Force';
      // start the simulation
      this.ladder.onFrame = (event) => {
        this.simulateGravity(event);
      }
    }
    else {
      // messageDiv.textContent = "Ladder is stable!\nForces are in equilibrium!";
      messageDiv.innerHTML = "<b>Ladder is stable!<br>Forces are in equilibrium!</b>";
      forces_text.textContent = 'F1x: ' + Math.round(F1x) + ' N\nF1y: ' + Math.round(F1y) + ' N\nF2: ' + Math.round(F2) + ' N\nFz: ' + Math.round(Fz) + ' N';
    }
  }
}

window.onload = function () {
  // TEST
  let canvas = document.getElementById('myCanvas');
  // Create an empty project and a view for the canvas
  paper.setup(canvas);

  // Draw the view
  // paper.view.draw();

  let width = canvas.width;
  let height = canvas.height;
  width = window.innerWidth * 0.8;
  height = window.innerHeight;
  let angle = Math.PI / 4;
  let length = height * 0.7;
  let arrowLength = -length / 7;
  let newLength = length;
  let newAngle = angle;
  let radius = width / 80 + (personWeight.value - 25) / 2;

  let ladder = new Ladder(width, height, angle, length, arrowLength, radius);

  forces_text.textContent = 'F1x: friction force \nF1y: normal force floor \nF2: normal force wall\nFz: gravitation force ';
  forces_text.style.fontSize = window.innerWidth / 130 + "px";

  // Resize the canvas when the window is resized
  window.onresize = () => {
    forces_text.style.fontSize = window.innerWidth / 130 + "px";
    // location.reload(); // Reload the page when resized
    width = window.innerWidth * 0.8;
    height = window.innerHeight;
    angle = Math.PI / 4;
    length = height * 0.7;
    arrowLength = -length / 7;
    radius = width / 80 + (personWeight.value - 25) / 2;
    ladder.resize(width, height, angle, length, arrowLength, radius);
  }

  // add functionality to the size slider
  sizeSlider.addEventListener('input', (event) => {
    // new length of the ladder based on the slider value
    newLength = length + (event.target.value - 75) * 9;
    newAngle = (parseInt(angleSlider.value) / 100) * Math.PI / 2;
    arrowLength = -newLength / 7;
    ladder.updateLadder(width, height, newAngle, newLength, arrowLength, radius);
    sizeLabel.innerHTML = Math.round(event.target.value) * 2 / 50;
    paper.view.draw();
  });

  // add functionality to the angle slider
  angleSlider.addEventListener('input', (event) => {
    newAngle = (parseInt(event.target.value) / 100) * Math.PI / 2; // calculate the new angle based on the slider value
    newLength = length + (sizeSlider.value - 75) * 9;
    arrowLength = -newLength / 7;
    ladder.updateLadder(width, height, newAngle, newLength, arrowLength, radius);
    angleLabel.innerHTML = Math.round(parseInt(event.target.value) / 10 * 9);
    paper.view.draw();
  });

  // add functionality to the person weight slider
  personWeight.addEventListener('input', (event) => {
    personWeightLabel.innerHTML = Math.round(event.target.value);
    // Calculate the ratio based on the slider value
    radius = width / 80 + (event.target.value - 25) / 2;
    ladder.updatePersonPosition(width, personPosition.value / 100, arrowLength, radius);
  });

  // Add an event listener to the slider
  personPosition.addEventListener('input', (event) => {
    // Calculate the ball position (0 to 1) based on the slider value
    const personPosition = event.target.value / 100;
    ladder.updatePersonPosition(width, personPosition, arrowLength, radius); // Update the ball position on the ladder
    personLabel.innerHTML = personPosition.toFixed(2);
    paper.view.draw();
  });

  maxForceLabel.textContent = 'Max. Friction Force: ' + maxForce.value + ' N';
  // add functionality to the max force slider
  maxForce.addEventListener('input', (event) => {
    maxForceLabel.textContent = 'Max. Friction Force: ' + event.target.value + ' N';
    // Calculate the ratio based on the slider value
    const ratio = event.target.value / (parseInt(maxForce.max) - parseInt(maxForce.min));
    // remove the floor and create a new one
    ladder.floor.fillColor = interpolateColor(lightBlueColor, darkGreenColor, ratio);
  });

  // Add functionality to the reset button
  resetButton.addEventListener('click', () => {
    width = window.innerWidth * 0.8;
    height = window.innerHeight;
    // reset the color of the floor to color in the middle of interpolation
    ladder.floor.fillColor = interpolateColor(lightBlueColor, darkGreenColor, 0.5);

    sizeSlider.value = 74.7;
    angleSlider.value = (parseInt(angleSlider.max) + parseInt(angleSlider.min)) / 2;
    personWeight.value = (parseInt(personWeight.max) + parseInt(personWeight.min)) / 2 - 1;
    personPosition.value = (parseInt(personPosition.max) + parseInt(personPosition.min)) / 2;
    maxForce.value = (parseInt(maxForce.max) + parseInt(maxForce.min)) / 2;

    radius = width / 80 + (personWeight.value - 25) / 2;
    arrowLength = -length / 7;
    ladder.resetLadder(width, height, length, angle, arrowLength, radius); // reset the ladder position

    newLength = length; // reset the new length
    newAngle = angle; // reset the new angle

    // reset the slider labels
    sizeLabel.innerHTML = '3';
    angleLabel.innerHTML = '45';
    personWeightLabel.innerHTML = '' + Math.round(personWeight.value);
    personLabel.innerHTML = (personPosition.value / 100).toFixed(2);
    maxForceLabel.textContent = 'Max. Friction Force: ' + maxForce.value + ' N';

    paper.view.draw();
  });

  simulateButton.addEventListener('click', () => {
    let angle = (parseInt(document.getElementById('angleSlider').value) / 100) * Math.PI / 2; // calculate the new angle based on the slider value
    ladder.simulatePhysics(personWeight.value, angle);
  });
};
