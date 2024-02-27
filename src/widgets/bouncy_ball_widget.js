import * as paper from 'paper';

class RotatingRectangle {
  ABSORPTION = 0.7;

  simulateGravity(event) {
    this.v += this.a * (event.delta * 10);
    this.pos = this.pos.add([0, this.v * event.delta]);

    if (this.pos.y + this.radius > this.floor_height) {
      this.v = -1 * this.v * this.ABSORPTION;
      this.pos.y = this.floor_height - this.radius;
    }

    this.path.position = this.pos;
  }

  constructor(x_start, y_start, floor_height, ball_size) {
    this.floor_height = floor_height;
    this.v = -2000 * Math.random() + -500;
    this.a = 9.81 * 10;
    this.pos = new paper.Point(x_start, y_start);
    this.radius = ball_size;

    this.path = new paper.Path.Circle({
      center: this.pos,
      radius: this.radius,
      strokeColor: 'black',
      fillColor: paper.Color.random(),
    });

    this.path.onFrame = (event) => this.simulateGravity(event);
  }
}

// Only executed our code once the DOM is ready.
window.onload = function() {
  var canvas = document.getElementById('myCanvas');

  // Create an empty project and a view for the canvas:
  paper.setup(canvas);
  // Create a Paper.js Path to draw a line into it:
  let BALL_SIZE = 10;
  let WIDTH = canvas.width;
  let HEIGHT = canvas.height;
  let FLOOR_HEIGHT = HEIGHT - 100;
  new paper.Path.Line({
    from: [0, FLOOR_HEIGHT],
    to: [WIDTH, FLOOR_HEIGHT],
    strokeColor: 'black',
  });

  let num_balls = 100;
  for (let i = 0; i < num_balls; i++) {
    new RotatingRectangle(
      (Math.random() * ((WIDTH - (BALL_SIZE)) - (BALL_SIZE)) + (BALL_SIZE)),
      // (Math.random() * (HEIGHT * 0.2 - (10)) + 10),
      FLOOR_HEIGHT - 50,
      FLOOR_HEIGHT,
      BALL_SIZE
    );
  }

  // Draw the view now:
  paper.view.draw();
}
