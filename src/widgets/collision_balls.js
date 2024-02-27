import * as paper from 'paper';

class RotatingRectangle {
    ABSORPTION = 0.7;
    FRICTION = 0.005; // Friction coefficient

    simulateGravity(event, balls) {
        const deltaTime = event.delta;
        this.v = this.v.add(this.a.multiply(deltaTime * 10));
        this.pos = this.pos.add(this.v.multiply(deltaTime));

        if (this.pos.y + this.radius > this.floor_height) {
            this.v.y = -1 * this.v.y * this.ABSORPTION;
            this.pos.y = this.floor_height - this.radius;
        }

        // Apply friction to the horizontal velocity
        this.v.x *= 1 - this.FRICTION;

        // Collision with walls
        if (this.pos.x - this.radius < 0) {
            this.v.x = Math.abs(this.v.x);
            this.pos.x = this.radius;
        } else if (this.pos.x + this.radius > paper.view.size.width) {
            this.v.x = -Math.abs(this.v.x);
            this.pos.x = paper.view.size.width - this.radius;
        }

        this.handleCollisions(balls);

        this.path.position = this.pos;
    }

    handleCollisions(balls) {
        for (let i = 0; i < balls.length; i++) {
            const ball = balls[i];
            if (ball !== this) {
                const distance = this.pos.getDistance(ball.pos);
                if (distance <= this.radius + ball.radius) {
                    const collisionNormal = this.pos.subtract(ball.pos).normalize();
                    const relativeVelocity = this.v.subtract(ball.v);
                    const impulse =
                        (2 * relativeVelocity.dot(collisionNormal)) /
                        (1 / this.mass + 1 / ball.mass);

                    const collisionImpulse = collisionNormal.multiply(impulse);

                    this.v = this.v.subtract(collisionImpulse.divide(this.mass));
                    ball.v = ball.v.add(collisionImpulse.divide(ball.mass));

                    const separationVector = collisionNormal.multiply(
                        (this.radius + ball.radius - distance) / 2
                    );
                    this.pos = this.pos.add(separationVector);
                    ball.pos = ball.pos.subtract(separationVector);
                }
            }
        }
    }

    constructor(x_start, y_start, floor_height, ball_size) {
        this.floor_height = floor_height;
        const speed = Math.random() * (2000 - 500) + 500;
        this.v = new paper.Point(
            Math.random() < 0.5 ? -speed : speed,
            -2000 * Math.random() + -500
        );
        this.a = new paper.Point(0, 9.81 * 10);
        this.pos = new paper.Point(x_start, y_start);
        this.radius = ball_size;
        this.mass = Math.PI * this.radius * this.radius;

        this.path = new paper.Path.Circle({
            center: this.pos,
            radius: this.radius,
            strokeColor: 'black',
            fillColor: paper.Color.random(),
        });

        this.path.onFrame = (event) => this.simulateGravity(event, this.balls);
    }
}

window.onload = function () {
    var canvas = document.getElementById('myCanvas');
    paper.setup(canvas);

    let BALL_SIZE = 10;
    let WIDTH = canvas.width;
    let HEIGHT = canvas.height;
    let FLOOR_HEIGHT = HEIGHT - 100;
    new paper.Path.Line({
        from: [0, FLOOR_HEIGHT],
        to: [WIDTH, FLOOR_HEIGHT],
        strokeColor: 'black',
    });
    new paper.Path.Line({
        from: [0, 0],
        to: [0, HEIGHT],
        strokeColor: 'black',
    });
    new paper.Path.Line({
        from: [WIDTH, 0],
        to: [WIDTH, HEIGHT],
        strokeColor: 'black',
    });

    let num_balls = 100;
    let balls = [];
    for (let i = 0; i < num_balls; i++) {
        const ball = new RotatingRectangle(
            Math.random() * (WIDTH - BALL_SIZE) + BALL_SIZE,
            FLOOR_HEIGHT - 50,
            FLOOR_HEIGHT,
            BALL_SIZE
        );
        balls.push(ball);
    }

    balls.forEach((ball) => {
        ball.balls = balls;
    });

    paper.view.draw();
};
