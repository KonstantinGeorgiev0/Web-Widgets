import * as paper from 'paper';
import {project} from 'paper';
import '../../assets/css/style3.css';
import '../../common/arrows.js';

paper.install(window);
// Define sliders and other DOM elements
let k_slider = document.getElementById('k_slider'); // Spring stiffness slider
let b_slider = document.getElementById('b_slider'); // Damping constant slider
let m_slider = document.getElementById('m_slider'); // Block mass slider
let blockSlider = document.getElementById('blockSlider'); // Block position slider
let k_slider_label = document.getElementById('k_slider_label'); // Label for k_slider
let b_slider_label = document.getElementById('b_slider_label'); // Label for b_slider
let m_slider_label = document.getElementById('m_slider_label'); // Label for m_slider
let blockSliderLabel = document.getElementById('blockSliderLabel'); // Label for blockSlider
let simulatePhysics = document.getElementById('simulatePhysics'); // Button to start simulation
let resetButton = document.getElementById('resetButton'); // Button to reset simulation
let message = document.getElementById('message'); // Message element
let zeta = document.getElementById('zeta'); // Damping ratio input
let omega = document.getElementById('omega'); // Angular frequency input
const myPlot = document.getElementById("myPlot"); // Plot for displacement
const myPlot2 = document.getElementById("myPlot2"); // Plot for velocity
const myPlot3 = document.getElementById("myPlot3"); // Plot for acceleration
let zeta_value;
let omega_value;

// Spring stiffness, in kg / s^2
let k = 50;
let initial_k = 50; // variable to store initial stiffness
// Damping constant, in kg / s
let b = 5; 
let initial_b = 5; // variable to store initial damping 
let block_mass = 6;
let frameRate = 1 / 60;
let frameDelay = frameRate * 1500;
let blockOscillating = false;
let animationInterval = null;

// plotting function
/**
* Plot data to be added to canvas. 
* This is a function that takes x and y values and plots them in a graphical user interface.
* 
* @param xAxis - The x axis to plot
* @param yAxis - The y axis to plot ( must be same size as xAxis )
* @param title - The title of the plot.
* @param xAxisTitle - The title of the x axis.
*/
function plot(xAxis, yAxis, title, xAxisTitle, plot) {
    // plot displacement using plotly.js
    const data = [{
        x: xAxis,
        y: yAxis,
        mode: "lines"
    }];
    const layout = {
        title: title,
        xaxis: {
            title: "Time (s)"
        },
        yaxis: {
            title: xAxisTitle
        }
    };
    Plotly.newPlot(
        plot, data, layout
    );
}

/**
* This function is called when the user clicks the simulatePhysics button.
* It computes the values of the system and plots them.
* 
* @param k - stiffness of the system ( kg / s^2 )
* @param b - damping constant of the system ( kg / s )
* @param block_mass - mass of the system in kilograms
* @param x0 - initial displacement of the system in meters
*/
function addPlots(k, b, block_mass, x0) {

    // values for plots
    let x = [];
    let v = [];
    let a = [];
    let title = '';

    // dimensionless numbers
    let xi = b / (2 * Math.sqrt(k * block_mass));
    let omega_n = Math.sqrt(k / block_mass);

    // array of time values
    const t = []
    const start = 0;
    const end = 10;
    const numPoints = 1000;
    const dt = (end - start) / numPoints;


    // Add a point every dt seconds
    for (let i = 0; i < numPoints; i++) {
        t.push(start + i * dt);
    }

    // arrays for solutions
    let x_underdamped = t.map(() => 0);
    let x_overdamped = t.map(() => 0);
    let x_critically_damped = t.map(() => 0);

    let omega_d = 0;
    // Underdamped system
    if (xi < 1) {
        for (let j = 0; j < x_underdamped.length; j++) {
            omega_d = omega_n * Math.sqrt(1 - xi * xi);
            x_underdamped[j] = x0 * Math.exp(-xi * omega_n * t[j]) * Math.cos(omega_d * t[j]);
        }
        x = x_underdamped;
        title = 'Underdamped';
    }

    // Overdamped system
    let lambda1 = 0;
    let lambda2 = 0;
    let c1 = 0;
    let c2 = 0;
    if (xi > 1) {
        for (let j = 0; j < x_overdamped.length; j++) {
            lambda1 = omega_n * (-xi + Math.sqrt(xi * xi - 1));
            lambda2 = omega_n * (-xi - Math.sqrt(xi * xi - 1));
            c1 = x0 * lambda2 / (lambda2 - lambda1);
            c2 = -x0 * lambda1 / (lambda2 - lambda1);
            x_overdamped[j] = c1 * Math.exp(lambda1 * t[j]) + c2 * Math.exp(lambda2 * t[j]);
        }
        x = x_overdamped;
        title = 'Overdamped';
    }

    // Critically damped system
    let c3 = 0;
    let c4 = 0;
    if (xi === 1) {
        for (let j = 0; j < x_critically_damped.length; j++) {
            c3 = x0;
            c4 = x0 * omega_n;
            x_critically_damped[j] = (c3 + c4 * t[j]) * Math.exp(-omega_n * xi * t[j]);
        }
        x = x_critically_damped;
        title = 'Critically Damped';
    }

    // velocity
    let v_underdamped = t.map(() => 0);
    let v_overdamped = t.map(() => 0);
    let v_critically_damped = t.map(() => 0);

    // Compute the gradient of x_underdamped with respect to t
    if (xi < 1) {
        for (let i = 0; i < x_underdamped.length; i++) {
            if (i === 0) {
                // Use a forward difference at the first point
                v_underdamped[i] = (x_underdamped[i + 1] - x_underdamped[i]) / (t[i + 1] - t[i]);
            } else if (i === x_underdamped.length - 1) {
                // Use a backward difference at the last point
                v_underdamped[i] = (x_underdamped[i] - x_underdamped[i - 1]) / (t[i] - t[i - 1]);
            } else {
                // Use a central difference for other points
                v_underdamped[i] = (x_underdamped[i + 1] - x_underdamped[i - 1]) / (t[i + 1] - t[i - 1]);
            }
        }
        v = v_underdamped;
        v[0] = 0;
    }

    // compute gradient of x_overdamped with respect to t
    if (xi > 1) {
        for (let i = 0; i < x_overdamped.length; i++) {
            if (i === 0) {
                // Use a forward difference at the first point
                v_overdamped[i] = (x_overdamped[i + 1] - x_overdamped[i]) / (t[i + 1] - t[i]);
            } else if (i === x_overdamped.length - 1) {
                // Use a backward difference at the last point
                v_overdamped[i] = (x_overdamped[i] - x_overdamped[i - 1]) / (t[i] - t[i - 1]);
            } else {
                // Use a central difference for other points
                v_overdamped[i] = (x_overdamped[i + 1] - x_overdamped[i - 1]) / (t[i + 1] - t[i - 1]);
            }
        }
        v = v_overdamped;
    }

    // compute gradient of x_critically_damped with respect to t
    if (xi === 1) {
        for (let i = 0; i < x_critically_damped.length; i++) {
            if (i === 0) {
                // Use a forward difference at the first point
                v_critically_damped[i] = (x_critically_damped[i + 1] - x_critically_damped[i]) / (t[i + 1] - t[i]);
            } else if (i === x_critically_damped.length - 1) {
                // Use a backward difference at the last point
                v_critically_damped[i] = (x_critically_damped[i] - x_critically_damped[i - 1]) / (t[i] - t[i - 1]);
            } else {
                // Use a central difference for other points
                v_critically_damped[i] = (x_critically_damped[i + 1] - x_critically_damped[i - 1]) / (t[i + 1] - t[i - 1]);
            }
        }
        v = v_critically_damped;
        v[0] = 0;
    }

    // acceleration
    let a_underdamped = t.map(() => 0);
    let a_overdamped = t.map(() => 0);
    let a_critically_damped = t.map(() => 0);

    // Compute the gradient of v_underdamped with respect to t
    if (xi < 1) {
        for (let i = 0; i < v_underdamped.length; i++) {
            if (i === 0) {
                // Use a forward difference at the first point
                a_underdamped[i] = (v_underdamped[i + 1] - v_underdamped[i]) / (t[i + 1] - t[i]);
            } else if (i === v_underdamped.length - 1) {
                // Use a backward difference at the last point
                a_underdamped[i] = (v_underdamped[i] - v_underdamped[i - 1]) / (t[i] - t[i - 1]);
            } else {
                // Use a central difference for other points
                a_underdamped[i] = (v_underdamped[i + 1] - v_underdamped[i - 1]) / (t[i + 1] - t[i - 1]);
            }
        }
        a = a_underdamped.slice(2);
    }

    // compute gradient of v_overdamped with respect to t
    if (xi > 1) {
        for (let i = 0; i < v_overdamped.length; i++) {
            if (i === 0) {
                // Use a forward difference at the first point
                a_overdamped[i] = (v_overdamped[i + 1] - v_overdamped[i]) / (t[i + 1] - t[i]);
            } else if (i === v_overdamped.length - 1) {
                // Use a backward difference at the last point
                a_overdamped[i] = (v_overdamped[i] - v_overdamped[i - 1]) / (t[i] - t[i - 1]);
            } else {
                // Use a central difference for other points
                a_overdamped[i] = (v_overdamped[i + 1] - v_overdamped[i - 1]) / (t[i + 1] - t[i - 1]);
            }
        }
        a = a_overdamped.slice(2);
    }

    // compute gradient of v_critically_damped with respect to t
    if (xi === 1) {
        for (let i = 0; i < v_critically_damped.length; i++) {
            if (i === 0) {
                // Use a forward difference at the first point
                a_critically_damped[i] = (v_critically_damped[i + 1] - v_critically_damped[i]) / (t[i + 1] - t[i]);
            } else if (i === v_critically_damped.length - 1) {
                // Use a backward difference at the last point
                a_critically_damped[i] = (v_critically_damped[i] - v_critically_damped[i - 1]) / (t[i] - t[i - 1]);
            } else {
                // Use a central difference for other points
                a_critically_damped[i] = (v_critically_damped[i + 1] - v_critically_damped[i - 1]) / (t[i + 1] - t[i - 1]);
            }
        }
        a = a_critically_damped.slice(2);
    }
    myPlot.style.height = window.innerHeight / 3.02 + 'px';
    myPlot2.style.height = window.innerHeight / 3.02 + 'px';
    myPlot3.style.height = window.innerHeight / 3.02 + 'px';
    plot(t, x, title + ' System', "Displacement (m)", myPlot);
    plot(t, v, '', "Velocity (m/s)", myPlot2);
    plot(t, a, '', "Acceleration (m/s<sup>2</sup>)", myPlot3);
}

class Spring_widget {
    /**
    * Create a new Spring_widget.  
    * @param width
    * @param height
    * @param block
    * @param wall
    */
    constructor(width, height, block, wall) {
        this.redraw(width, height, block, wall);
    }

    /**
    * Redraw the Spring_widget. Used when the window is resized. 
    * @param width 
    * @param height
    * @param block
    * @param wall
    */
    redraw(width, height, block, wall) {
        this.createSprings(height, block, wall);
        this.createWall(height, wall);
        this.createDamper(height, block, wall);
        this.createLine(width, height, block);
        this.createBlocks(height, block);
        this.createArrow(width, height, block);
    }

    /**
    * Resize the Spring_widget. Used when the window is resized. 
    * Uses redraw method along with removing all children from the active layer.   
    * @param width
    * @param height
    * @param block
    * @param wall
    */
    resize(width, height, block, wall) {
        // remove everything
        project.activeLayer.removeChildren();
        // redraw
        this.redraw(width, height, block, wall);
    }

    /**
    * Create the wall. 
    * @param height
    * @param wall
    */
    createWall(height, wall) {
        let wallRectangle = new paper.Path.Rectangle(new paper.Point(0, 0), new paper.Point(wall.x, height));
        wallRectangle.fillColor = '#CCCCCC';
    }

    /**
    * Create the arrow indicating the displacement of the block.
    * @param width
    * @param height
    * @param block
    */
    createArrow(width, height, block) {
        let blockSize = height / 15 + block.mass * 5;
        // Arrow on floor
        let arrow1 = new paper.Shape.ArrowLine(
            width / 4 + blockSize / 2,
            height / 2 + blockSize * 2.25,
            block.x + blockSize / 2,
            height / 2 + blockSize * 2.25,
        );
        arrow1.strokeWidth = 3; // arrow outline thickness

        arrow1.strokeColor = 'black';
        arrow1.fillColor = 'black';

        // Create PointText objects for arrow labels
        let arrow1Label = new paper.PointText(new paper.Point(block.x * 1.02 + blockSize / 2, height / 2.03 + blockSize * 2.25));
        arrow1Label.justification = 'center';
        arrow1Label.fillColor = 'black';
        arrow1Label.content = 'X';
        arrow1Label.fontSize = 24;

        // create second label
        let arrow1Label2 = new paper.PointText(new paper.Point(width / 4 + blockSize / 2, height / 2 + blockSize * 3.3));
        arrow1Label2.justification = 'center';
        arrow1Label2.fillColor = 'black';
        arrow1Label2.content = 'X\u2080';
        arrow1Label2.fontSize = 24;
    }

    /**
    * Create the damper.  
    * @param height
    * @param block
    * @param wall
    */
    createDamper(height, block, wall) {
        let midpoint = (block.x) / 2 + wall.x / 2;

        // calculate damper size based on damping coefficient
        let damperSize = height / 50 + Math.abs(b) * 1.5;

        // Create a group to hold the damper segments
        this.damperGroup = new paper.Group();

        // Create the damper segments
        let topSide = new paper.Path();
        topSide.add(new paper.Point(midpoint - damperSize / 2, height / 2));
        topSide.add(new paper.Point(midpoint + damperSize / 2, height / 2));
        this.damperGroup.addChild(topSide);

        let rightSide = new paper.Path();
        rightSide.add(new paper.Point(midpoint + damperSize / 2, height / 2));
        rightSide.add(new paper.Point(midpoint + damperSize / 2, height / 1.85));
        this.damperGroup.addChild(rightSide);

        let leftSide = new paper.Path();
        leftSide.add(new paper.Point(midpoint - damperSize / 2, height / 1.96));
        leftSide.add(new paper.Point(midpoint - damperSize / 2, height / 1.89));
        this.damperGroup.addChild(leftSide);

        let bottomSide = new paper.Path();
        bottomSide.add(new paper.Point(midpoint - damperSize / 2, height / 1.85));
        bottomSide.add(new paper.Point(midpoint + damperSize / 2, height / 1.85));
        this.damperGroup.addChild(bottomSide);

        // Set the damper's stroke color and width
        this.damperGroup.strokeColor = 'black';
        this.damperGroup.strokeWidth = 3;
    }

    /**
    * Update the damper size based on damping slider value.
    * @param height 
    * @param block 
    * @param wall 
    */
    updateDamperSize(height, block, wall) {
        let midpoint = (block.x) / 2 + wall.x / 2;

        // Calculate damper size based on damping coefficient (b_slider value)
        let damperSize = height / 50 + Math.abs(b) * 1.5;

        // Access the existing damper group (assuming it's a class property)
        let damperGroup = this.damperGroup;

        // Update the coordinates of the damper segments
        let topSide = damperGroup.children[0];
        topSide.segments[0].point.x = midpoint - damperSize / 2;
        topSide.segments[1].point.x = midpoint + damperSize / 2;

        let rightSide = damperGroup.children[1];
        rightSide.segments[0].point.x = midpoint + damperSize / 2;
        rightSide.segments[1].point.x = midpoint + damperSize / 2;

        let leftSide = damperGroup.children[2];
        leftSide.segments[0].point.x = midpoint - damperSize / 2;
        leftSide.segments[1].point.x = midpoint - damperSize / 2;

        let bottomSide = damperGroup.children[3];
        bottomSide.segments[0].point.x = midpoint - damperSize / 2;
        bottomSide.segments[1].point.x = midpoint + damperSize / 2;

        // Update the damper's stroke width (optional)
        damperGroup.strokeWidth = 3;
    }

    /**
    * Create the springs. 
    * @param height
    * @param block
    * @param wall
    */
    createSprings(height, block, wall) {
        // Create the blue spring segments
        this.blueGroup = new paper.Group();
        // Create a for loop that iterates from the left wall to the block
        for (let x = wall.x; x + height / 120 < block.x; x += height / 27) {
            let segment = new paper.Path();
            segment.strokeColor = 'blue';

            // Calculate the height of the blue spring segment based on the stiffness coefficient (k)
            segment.add(new paper.Point(x, height / 2.04));
            segment.add(new paper.Point(x + height / 50, height / 2.12));
            segment.add(new paper.Point(x + height / 25, height / 2.04));

            this.blueGroup.addChild(segment);
        }
        // Calculate the width of the blue spring segment based on the stiffness coefficient (k)
        this.blueGroup.strokeWidth = 5 + (k - 50) * 0.05; // Set the width of the blue spring segment

        // Create the red spring segment
        this.redPath = new paper.Path({
            strokeColor: 'red',
            strokeWidth: 5
        });
        // add points to the red spring
        this.redPath.add(new paper.Point(wall.x, height / 1.92));
        this.redPath.add(new paper.Point(block.x, height / 1.92));
    }

    /**
    * Create the line indicating the equilibrium position.  
    * @param width
    * @param height
    * @param block
    */
    createLine(width, height, block) {
        let blockSize = height / 15 + block.mass * 5;
        // Create the line indicating the equilibrium position
        let verticalLine = new paper.Path.Line(
            new paper.Point(width / 4 + blockSize / 2, height / 2 + blockSize * 1.5),
            new paper.Point(width / 4 + blockSize / 2, height / 2 + blockSize * 3)
        );
        // Set the line's stroke color and width
        verticalLine.strokeColor = 'black';
        verticalLine.strokeWidth = 3;
    }

    /**
    * Create the block that oscillates. 
    * @param height
    * @param block
    */
    createBlocks(height, block) {
        let blockSize = height / 15 + block.mass * 6; // Calculate block size based on mass
        let blockXPosition = block.x; 
        let blockYPosition = height / 2;

        // Create the block
        this.blockRectangle = new paper.Path.Rectangle(
            new paper.Point(blockXPosition, blockYPosition - blockSize / 2),
            new paper.Point(blockXPosition + blockSize, blockYPosition + blockSize / 2)
        );
        this.blockRectangle.fillColor = 'black';
    }

    /**
    * Update the block size based on mass slider value.  
    * @param height
    * @param block
    */
    updateBlocks(height, block) {
        // update every 4 points of the block such that it becomes bigger or smaller based on mass
        let blockSize = height / 15 + block.mass * 6;
        // segment 0 is bottom left point
        // segment 1 is top left point
        // segment 2 is top right point
        // segment 3 is bottom right point
        // update every point the same amount in every direction
        this.blockRectangle.segments[0].point.x = block.x;
        this.blockRectangle.segments[0].point.y = height / 2 - blockSize / 2;
        this.blockRectangle.segments[1].point.x = block.x;
        this.blockRectangle.segments[1].point.y = height / 2 + blockSize / 2;
        this.blockRectangle.segments[2].point.x = block.x + blockSize;
        this.blockRectangle.segments[2].point.y = height / 2 + blockSize / 2;
        this.blockRectangle.segments[3].point.x = block.x + blockSize;
        this.blockRectangle.segments[3].point.y = height / 2 - blockSize / 2;
    }

    /**
    * Start the simulation. 
    * Disable sliders and simulatePhysics button during simulation.
    * Start animation loop. 
    * @param width
    * @param height
    * @param block
    * @param wall
    */
    startSimulation(width, height, block, wall) {
        // let spring_length = block.x * 0.9 - wall.x;
        let spring_length = width / 4;
        // Disable sliders and simulatePhysics button during simulation
        k_slider.disabled = true;
        b_slider.disabled = true;
        m_slider.disabled = true;
        blockSlider.disabled = true;
        simulatePhysics.disabled = true;

        // Start the animation loop
        animationInterval = setInterval(() => {
            /* Move the block. */
            if (blockOscillating) {
                // Calculate the spring force F_spring = -k*x
                let F_spring = -k * (block.x - spring_length);
                // Calculate the damping force
                let F_damper = -b * block.v;

                // Calculate the acceleration
                let a = 0;
                a = (F_spring + F_damper) / block.mass;
                // Update the block's velocity
                block.v += a * frameRate;

                // Update the block's position to oscillate around width / 2
                block.x += block.v * frameRate;
            }

            // remove
            project.activeLayer.removeChildren();
            // redraw
            this.redraw(width, height, block, wall);
        }, frameDelay);
    }
}

/**
* This function is called when the window loads, and it creates a new Spring_widget.
* It also sets up the sliders and buttons. 
*/
window.onload = function () {
    let canvas = document.getElementById('myCanvas');
    // Create an empty project and a view for the canvas
    paper.setup(canvas);

    // Draw the view
    paper.view.draw();

    // set width and height of canvas to be the same as the window
    let width = window.innerWidth;
    let height = window.innerHeight;
    let block_x0 = width / 4; // block position
    let wall_x0 = width / 45; // wall position
    let block = { x: block_x0, v: 0, mass: block_mass }; // block object
    let wall = { x: wall_x0}; // wall object
    let spring = new Spring_widget(width, height, block, wall); // create spring widget

    // This function is called when the window is resized.
    window.onresize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        block = { x: width / 4, v: 0, mass: block_mass };
        wall = { x: width / 45};

        // resize the canvas
        spring.resize(width, height, block, wall);
    }

    // stiffness slider
    k_slider.addEventListener('input', (event) => {
        // update stiffness
        k = parseInt(event.target.value);
        // update slider label
        k_slider_label.innerHTML = k;
        // update blue part of spring based on stiffness
        spring.blueGroup.strokeWidth = 5 + (k - 50) * 0.05;
    });

    // damping slider
    b_slider.addEventListener('input', (event) => {
        // update damping
        b = parseInt(event.target.value);
        // update slider label
        b_slider_label.innerHTML = b;
        // update damper size based on damping
        spring.updateDamperSize(height, block, wall);
    });

    // mass slider
    m_slider.addEventListener('input', (event) => {
        // update mass
        block.mass = parseInt(event.target.value);
        // update slider label
        m_slider_label.innerHTML = block.mass.toFixed(0);
        // update block size based on mass
        spring.updateBlocks(height, block);
    });

    // block slider event listener
    blockSlider.addEventListener('input', (event) => {
        block.x = width / 4 + width / 8 * parseFloat(event.target.value);
        k = parseInt(k_slider.value);
        b = parseInt(b_slider.value);
        block.mass = parseInt(m_slider.value);
        blockOscillating = false; // Stop the oscillation
        blockSliderLabel.innerHTML = (event.target.value * 2).toFixed(1);
        // update the x position of the block
        project.activeLayer.removeChildren();
        spring.redraw(width, height, block, wall);
    });

    // simulate physics button
    simulatePhysics.innerHTML = 'Simulate Physics';
    simulatePhysics.onclick = function () {
        // start the simulation
        blockOscillating = true; // Start the oscillation
        spring.startSimulation(width, height, block, wall);

        // block all sliders
        k_slider.disabled = true;
        b_slider.disabled = true;
        m_slider.disabled = true;
        blockSlider.disabled = true;
        simulatePhysics.disabled = true; // block button click

        addPlots(k, b, block_mass, blockSlider.value * 2); // include plots

        // calculate zeta and omega
        zeta_value = (b / (2 * Math.sqrt(k * block.mass))).toFixed(2);
        omega_value = (Math.sqrt(b / block.mass)).toFixed(2);
        zeta.innerHTML = zeta_value;
        omega.innerHTML = omega_value;

        if (zeta_value < 1 && zeta_value !== 0.00) message.innerHTML = 'The system is underdamped';

        else if (zeta_value === 1.00) message.innerHTML = 'The system is critically damped';

        else if (zeta_value === 0.00) message.innerHTML = 'The system is undamped';

        else message.innerHTML = 'The system is overdamped';

    };

    // reset button
    resetButton.innerHTML = 'Reset';
    resetButton.onclick = function () {
        // Clear any intervals running for the animation.
        clearInterval(animationInterval);
        // clear drawing
        project.activeLayer.removeChildren();
        // unblock sliders
        k_slider.disabled = false;
        b_slider.disabled = false;
        m_slider.disabled = false;
        blockSlider.disabled = false;
        simulatePhysics.disabled = false; // unblock button click

        // reset variables
        block.x = block_x0;
        block.v = 0;
        wall.x = wall_x0;
        blockOscillating = false; // stop the oscillation
        block.mass = block_mass;
        b = initial_b;
        k = initial_k;

        // reset sliders
        k_slider.value = initial_k;
        k_slider_label.innerHTML = '' + initial_k;
        b_slider.value = initial_b;
        b_slider_label.innerHTML = '' + initial_b;
        m_slider.value = block_mass;
        m_slider_label.innerHTML = '' + block_mass;
        blockSlider.value = 0;
        blockSliderLabel.innerHTML = '0';

        // reset zeta and omega
        zeta.innerHTML = '';
        omega.innerHTML = '';
        message.innerHTML = '';

        // removePlots();
        addPlots(50, 5, 6 , 0); // include plots
        spring.redraw(width, height, block, wall);
    };

    // setInterval(loop, frameDelay);
}
