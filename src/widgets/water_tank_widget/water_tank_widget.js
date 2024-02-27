import {Hints} from "./hints";

import "../../assets/css/style.css";

import * as paper from 'paper';
import {initSlider, setValue} from "../../common/sliders";
import solve_bernoulli from "./bernoulli";

/**
 * The ForceArrow class represents the force arrow at the pistonMiddle point.
 */
class ForceArrow {
    /**
     * Create a new ForceArrow.
     * @param forceSliderId The force slider id
     * @param piston The piston object
     */
    constructor(forceSliderId, piston) {
        this.piston = piston;
        this.forceSlider = document.getElementById(forceSliderId);

        this.arrow = new paper.Path({
            strokeWidth: 2,
            fillColor: 'grey',
        });

        this.F_text = new paper.PointText({
            content: 'F = ',
            fillColor: 'black',
            justification: 'center',
        });

        this.F_text.onFrame = () => {
            this.F_text.content = 'F = ' + (this.forceSlider.value * 20).toFixed(2) + ' N';
        }
    }

    /**
     * Recompute the dimensions of the force arrow.
     */
    setDimensions() {
        let scale = 20000;
        console.log(this.forceSlider.value);

        this.arrowRectangleSize = new paper.Point([
            paper.view.size.width * 0.005 + paper.view.size.width / scale * this.forceSlider.value * 0.25,
            paper.view.size.height * 0.01 + paper.view.size.height / scale * this.forceSlider.value]
        );
        this.triangleBaseSize = paper.view.size.width * 0.02 + paper.view.size.width / scale * this.forceSlider.value;
        this.triangleHeight = paper.view.size.height * 0.02 + paper.view.size.height / scale * this.forceSlider.value;
    }

    /**
     * Create the segments of the force arrow.
     */
    drawArrow() {
        this.setDimensions();
        this.arrow.segments = [];
        let height_margin = paper.view.size.height * 0.02;

        let piston_middle = this.piston.getMiddle();
        piston_middle = piston_middle.subtract(new paper.Point([0, this.arrowRectangleSize.y + this.triangleHeight])).add([0, -0.1*height_margin]);
        const font_size_scale = paper.view.size.width/90;

        // Draw F hint
        // Add text to hint
        this.F_text.position = piston_middle.add([0, -height_margin]);
        this.F_text.fontSize = font_size_scale;

        this.arrow.add(piston_middle);
        this.arrow.add(piston_middle.add(new paper.Point([-this.arrowRectangleSize.x/2, 0])));
        this.arrow.add(piston_middle.add(new paper.Point([-this.arrowRectangleSize.x/2, this.arrowRectangleSize.y])));
        this.arrow.add(piston_middle.add(new paper.Point([-this.triangleBaseSize/2, this.arrowRectangleSize.y])));
        this.arrow.add(piston_middle.add(new paper.Point([0, this.arrowRectangleSize.y + this.triangleHeight])));
        this.arrow.add(piston_middle.add(new paper.Point([this.triangleBaseSize/2, this.arrowRectangleSize.y])));
        this.arrow.add(piston_middle.add(new paper.Point([this.arrowRectangleSize.x/2, this.arrowRectangleSize.y])));
        this.arrow.add(piston_middle.add(new paper.Point([this.arrowRectangleSize.x/2, 0])));
    }
}

class Piston {
    constructor(tank) {
        this.tank = tank;

        // Create path for piston
        this.path = new paper.Path({
            strokeWidth: 0,
            fillColor: 'grey',
        });
        this.path.closed = true;
        this.path.sendToBack();

        this.force_arrow = new ForceArrow("forceSlider", this);

        // Set onFrame method
        this.path.onFrame = () => {
            this.create_piston_segments();
            this.force_arrow.drawArrow();
        };

    }

    create_piston_segments() {
        // Set piston height to be 1/16 of the tank height
        const piston_height = this.tank.tank_height / 8;

        this.path.segments = [];

        // Get the start position of the tank
        let start_pos = this.tank.fill_path.segments[0].point;

        // Create the bottom segment
        this.path.add(new paper.Point(start_pos));
        this.path.add(new paper.Point(start_pos.x + this.tank.tank_width, start_pos.y));

        // Create the right segment
        this.path.add(new paper.Point(start_pos.x + this.tank.tank_width, start_pos.y - piston_height));

        // Create the top segment
        this.path.add(new paper.Point(start_pos.x, start_pos.y - piston_height));
    }

    getMiddle() {
        return this.path.lastSegment.point
            .add(this.path.segments[2].point.subtract(this.path.segments[3].point).divide(2));
    }
}

/**
 * The water spout class.
 */
class WaterSpout {
    // The constants for the parabola calculation.
    GRAVITY = 0.981;
    RESISTANCE = 0.003;
    DELTA = 0.005;

    calculateParabola(spout_pos, initial_velocity, floor_y) {
        let start_pos = new paper.Point(spout_pos);
        let points = [];
        points.push(new paper.Point(start_pos));
        let vx = initial_velocity;
        let vy = 0;
        while (start_pos.y < floor_y) {
            vx -= this.RESISTANCE;
            vx = vx < 0 ? 0 : vx;
            start_pos.x += vx;

            vy += this.GRAVITY * this.DELTA;

            start_pos.y += vy;
            points.push(new paper.Point(start_pos));
        }

        return points;
    }

    /**
     * Create a new water spout.
     * @param spout_pos The position of the spout
     * @param floor_y The y coordinate of the floor
     * @param width The width of the water stream
     */
    constructor(spout_pos, floor_y, width) {
        this.water = new paper.Path({
            strokeColor: '#A9D1D4',
            strokeWidth: width,
            dashArray: [40, 2],
        });
        spout_pos = spout_pos.add([this.water.strokeWidth/2, 0]);
        this.spout_pos = spout_pos;
        this.floor_y = floor_y;
        this.water.smooth();
        this.water.visible = false;

        this.animate_water = false;
        this.draining = false;
        const speed_up = 50;
        this.water.onFrame = (event) => {
            let water_animation_speed = 2;
            if (this.animate_water && event.count % water_animation_speed === 0) {
                this.water.dashArray = [10 + Math.random() * 70, 5];
            }

            if (!this.draining) {
                this.water.segments = this.calculateParabola(this.spout_pos, this.velocity, this.floor_y);

                return;
            }

            // Speed up animation
            for (let i = 0; i < speed_up; i++) {
                if (this.water.segments.length < 2) {
                    return;
                }

                this.water.firstSegment.point = this.water.firstSegment.point.add(
                    this.water.firstSegment.next.point
                        .subtract(this.water.firstSegment.point)
                        .normalize(1)
                );

                if (Math.abs(this.water.firstSegment.point.x - this.water.firstSegment.next.point.x) < 1 &&
                    Math.abs(this.water.firstSegment.point.y - this.water.firstSegment.next.point.y) < 1) {
                    this.water.removeSegment(1);
                }
            }

        }
    }

    /**
     * Start animating the water.
     */
    start_animating_water() {
        this.animate_water = true;
        this.water.visible = true;
    }

    /**
     * Start draining the water.
     */
    start_draining() {
        this.draining = true;
    }

    /**
     * Reset the water spout. This will stop the animation and hide the water. It will also reset the water velocity.
     * It will also compute the parabola.
     */
    reset() {
        this.animate_water = false;
        this.draining = false;
        this.water.visible = false;
    }

    /**
     * Set the velocity of the water.
     * @param velocity The velocity of the water. This should be a value between 0 and 1.
     */
    set_velocity(velocity) {
        if (!this.animate_water) {
            this.start_animating_water();
        }

        this.velocity = velocity/3;
    }

    /**
     * Set the position of the spout.
     * @param spout_pos The position of the spout.
     */
    set_spout_pos(spout_pos) {
        spout_pos = spout_pos.add([this.water.strokeWidth/2, 0]);
        this.spout_pos = spout_pos;
        this.water.segments = this.calculateParabola(this.spout_pos, this.velocity, this.floor_y);
    }

    /**
     * Set the width of the water stream.
     * @param width The width of the water stream.
     */
    set_width(width) {
        this.water.strokeWidth = width;
    }

    /**
     * Resize the water spout.
     * @param spout_pos The position of the spout
     * @param floor_y The y coordinate of the floor
     * @param width The width of the water stream
     */
    resize(spout_pos, floor_y, width) {
        this.water.strokeWidth = width;
        this.spout_pos = spout_pos;
        this.floor_y = floor_y;
        this.water.segments = this.calculateParabola(this.spout_pos, this.velocity, this.floor_y);
    }
}

/**
 * The pipe class.
 */
class Pipe {
    /**
     * Create a new pipe.
     * @param bottom_pos The bottom position of the entry point of the pipe.
     * @param floor_y The y coordinate of the floor.
     * @param init_pipe_height The initial height of the pipe.
     * @param stroke_width The stroke width of the pipe.
     */
    constructor(bottom_pos, floor_y, init_pipe_height, stroke_width) {
        this.fill_path_top = new paper.Path({
            strokeColor: '#A9D1D4',
            strokeWidth: this.pipe_width,
        });
        this.fill_path_top.sendToBack();

        this.fill_path_bottom = new paper.Path({
            strokeColor: '#A9D1D4',
            strokeWidth: this.pipe_width,
        });
        this.fill_path_bottom.sendToBack();

        this.pipe_p1 = new paper.Path({
            strokeColor: 'black',
            strokeWidth: this.stroke_width,
        });
        this.pipe_p1.sendToBack();

        this.pipe_p2 = new paper.Path({
            strokeColor: 'black',
            strokeWidth: this.stroke_width,
        });
        this.pipe_p2.sendToBack();
        this.water_spout = null;

        this.resize(bottom_pos, floor_y, init_pipe_height, stroke_width);
        this.create_pipe_segments();
        this.create_water_fill();

        let drain_speed = 5;
        this.fill_path_top.onFrame = () => {
            if (this.fill_path_top.segments.length < 2) {
                this.water_spout.start_draining();
                return;
            }

            if (!this.draining) {
                return;
            }

            this.fill_path_top.firstSegment.point = this.fill_path_top.firstSegment.point.add(
                this.fill_path_top.firstSegment.next.point
                    .subtract(this.fill_path_top.firstSegment.point)
                    .normalize(drain_speed)
            );

            if (Math.abs(this.fill_path_top.firstSegment.point.x - this.fill_path_top.firstSegment.next.point.x) < drain_speed &&
                Math.abs(this.fill_path_top.firstSegment.point.y - this.fill_path_top.firstSegment.next.point.y) < drain_speed) {
                this.fill_path_top.removeSegment(1);
            }
        }
    }

    /**
     * Create the segments that draw the pipe.
     * @param resizing Whether or not the pipe is being resized.
     */
    create_pipe_segments(resizing=false) {
        this.pipe_p1.segments = [];
        this.pipe_p2.segments = [];

        let temp_p = this.bottom_pos.add([-0.5 * this.stroke_width, 0]);
        this.pipe_p1.add(temp_p);

        temp_p = temp_p.add([this.pipe_width, 0]);
        this.pipe_p1.add(temp_p);

        temp_p.y = this.floor_y;
        this.pipe_p1.add(temp_p);

        temp_p = temp_p.add([this.pipe_width * 3, 0]);
        this.pipe_p1.add(temp_p);

        temp_p = temp_p.add([0, -this.pipe_height]);
        this.pipe_p1.add(temp_p);

        temp_p = temp_p.add(this.pipe_top_lenght, 0);
        this.pipe_p1.add(temp_p);

        if (this.water_spout === null) {
            this.water_spout = new WaterSpout(temp_p.add([0, -this.pipe_width/2]), this.floor_y, this.pipe_width);
        } else if (resizing) {
            this.water_spout.resize(temp_p.add([0, -this.pipe_width/2]), this.floor_y, this.pipe_width);
        } else {
            this.water_spout.set_spout_pos(temp_p.add([0, -this.pipe_width/2]));
        }

        temp_p = temp_p.add([0, -this.pipe_width]);
        this.pipe_p2.add(temp_p);

        temp_p = temp_p.add([-this.pipe_top_lenght - this.pipe_width, 0]);
        this.pipe_p2.add(temp_p);

        temp_p = temp_p.add([0, this.pipe_height]);
        this.pipe_p2.add(temp_p);

        temp_p = temp_p.add([-this.pipe_width, 0]);
        this.pipe_p2.add(temp_p);

        temp_p.y = this.bottom_pos.y - this.pipe_width;
        this.pipe_p2.add(temp_p);

        temp_p = temp_p.add([- this.pipe_width - this.pipe_width, 0]);
        this.pipe_p2.add(temp_p);
    }

    /**
     * Create the segments that draw the water fill.
     */
    create_water_fill() {
        this.fill_path_bottom.segments = [];
        this.fill_path_top.segments = [];
        for (let i = 0; i < this.pipe_p1.segments.length - 1; i++) {
            this.fill_path_bottom.add(
                this.pipe_p1.segments[i].point.add(
                    this.pipe_p2.segments[this.pipe_p2.segments.length - 1 - i]
                        .point.subtract(this.pipe_p1.segments[i].point).multiply(0.5)
                )
            );

            // If last segment, subtract the width of the pipe to make the fill look better.
            if (i === this.pipe_p1.segments.length - 2) {
                this.fill_path_bottom.lastSegment.point = this.fill_path_bottom.lastSegment.point.add([0, this.pipe_width/2]);
            }
        }

        // Create top fill path
        this.fill_path_top.add(this.fill_path_bottom.lastSegment.point);
        this.fill_path_top.add(this.fill_path_bottom.lastSegment.point.add([0, -this.pipe_width/2]));
        this.fill_path_top.add(
            this.pipe_p1.segments[this.pipe_p2.segments.length - 1].point.add(
                this.pipe_p2.segments[0]
                    .point.subtract(this.pipe_p1.segments[this.pipe_p2.segments.length - 1].point).multiply(0.5)
            )
        );
    }

    /**
     * Reset the pipe to its initial state. This stops the draining and resets the water spout.
     * It recreates the pipe segments and the water fill.
     */
    reset() {
        this.draining = false;
        this.redraw();
        this.water_spout.reset();
    }

    /**
     * Set the height of the pipe.
     * @param height The height of the pipe.
     */
    set_pipe_height(height) {
        this.pipe_height = height;
        this.redraw();
    }

    /**
     * Set the position of the bottom of the entry point of the pipe.
     * @param bottom_pos The position of the bottom of the entry point of the pipe.
     */
    set_bottom_pos(bottom_pos) {
        this.bottom_pos = bottom_pos;
        this.redraw();
    }

    /**
     * Set the width of the pipe.
     * @param width The width of the pipe.
     */
    set_pipe_width(width) {
        this.pipe_width = width;
        this.fill_path_top.strokeWidth = this.pipe_width - this.stroke_width;
        this.fill_path_bottom.strokeWidth = this.pipe_width - this.stroke_width;
        this.water_spout.set_width(this.pipe_width - this.stroke_width);
        this.redraw();
    }

    /**
     * Creates and draws the pipe and the water fill.
     * @param resizing Whether the pipe is being resized.
     */
    redraw(resizing=false) {
        this.create_pipe_segments(resizing);
        this.create_water_fill();
    }

    /**
     * Resize the pipe.
     * @param bottom_pos The position of the bottom of the entry point of the pipe.
     * @param floor_y The y position of the floor.
     * @param init_pipe_height The initial height of the pipe.
     * @param stroke_width The width of the pipe stroke.
     */
    resize(bottom_pos, floor_y, init_pipe_height, stroke_width) {
        this.pipe_height = init_pipe_height;
        this.bottom_pos = bottom_pos;
        this.floor_y = floor_y;
        this.pipe_width = init_pipe_height * 0.1;
        this.stroke_width = stroke_width;
        this.fill_path_top.strokeWidth = this.pipe_width - this.stroke_width;
        this.fill_path_bottom.strokeWidth = this.pipe_width - this.stroke_width;
        this.pipe_top_lenght = init_pipe_height * 0.1;
        this.pipe_p1.strokeWidth = this.stroke_width;
        this.pipe_p2.strokeWidth = this.stroke_width;

        this.redraw(true);
    }

    /**
     * Start draining the water.
     */
    start_draining() {
        this.draining = true;
    }

}

/**
 * The water tank class. This class is responsible for drawing the water tank.
 */
class WaterTank {
    /**
     * Create a new water tank.
     * @param start_pos The position of the top left corner of the water tank.
     * @param width The width of the water tank.
     * @param height The height of the water tank.
     */
    constructor(start_pos, width, height) {
        this.fill_path = new paper.Path({
            fillColor: '#A9D1D4',
        });

        this.tank_p1 = new paper.Path({
            strokeColor: 'black',
            strokeWidth: width * 0.01,
        });

        this.tank_p2 = new paper.Path({
            strokeColor: 'black',
            strokeWidth: width * 0.01,
        });
        this.pipe = null;

        this.hints = new Hints(this);

        // Call resize
        this.resize(start_pos, width, height);

        this.piston = new Piston(this);
    }

    /**
     * Create the segments that make up the water tank.
     * @param resizing Whether the water tank is being resized.
     */
    create_tank_segments(resizing=false) {
        this.tank_p1.segments = [];
        this.tank_p2.segments = [];

        let temp_p = this.start_pos;
        this.tank_p1.add(temp_p)

        temp_p = temp_p.add(new paper.Point(0, this.tank_height))
        this.tank_p1.add(temp_p);

        temp_p = temp_p.add(new paper.Point(this.tank_width, 0));
        this.tank_p1.add(temp_p);

        let floor_y = new paper.Point(temp_p).y;

        temp_p = temp_p.add(new paper.Point(0, -this.tank_height * this.pipe_height_fraction));
        this.tank_p1.add(temp_p);

        if (this.pipe === null) {
            this.pipe = new Pipe(new paper.Point(temp_p), floor_y, this.tank_height * 0.5, this.stroke_width);
        } else if (resizing) {
            this.pipe.resize(new paper.Point(temp_p), floor_y, this.tank_height * 0.5, this.stroke_width);
        } else {
            this.pipe.set_bottom_pos(new paper.Point(temp_p));
        }

        temp_p = temp_p.add(new paper.Point(0, -this.pipe.pipe_width));
        this.tank_p2.add(temp_p);

        this.tank_p2.add(this.start_pos.add(new paper.Point(this.tank_width, 0)));
    }

    /**
     * Create the segments that make up the water fill.
     */
    create_water_fill() {
        this.fill_path.segments = this.tank_p1.segments.concat(this.tank_p2.segments);
    }

    /**
     * Redraw the water tank. This function resets the water tank and redraws it.
     */
    reset() {
        this.redraw();
        this.fill_path.onFrame = null;
        this.fill_path.visible = true;
        this.pipe.reset();
    }

    /**
     * Set the width of the water tank.
     * @param width The new width of the water tank.
     */
    set_tank_width(width) {
        this.tank_width = width;
        this.redraw();
    }

    set_water_height(height) {
        if (height < 0) return true;

        this.fill_path.firstSegment.point.y = this.start_pos.y + (this.tank_height - height);
        this.fill_path.lastSegment.point.y = this.start_pos.y + (this.tank_height - height);

        // If water height reaches pipe entry, start draining
        return this.fill_path.firstSegment.point.y >= this.pipe.bottom_pos.y;
    }

    /**
     * Set the height of the pipe entry.
     * @param fraction The fraction of the water tank that the pipe entry should take up.
     */
    set_pipe_entry_fraction(fraction) {
        this.pipe_height_fraction = fraction;
        this.redraw();
    }

    /**
     * Resize the water tank. This function is called when the water tank is being resized.
     * @param start_pos The new starting position of the water tank.
     * @param width The new width of the water tank.
     * @param height The new height of the water tank.
     */
    resize(start_pos, width, height) {
        this.tank_width = width;
        this.tank_height = height;
        this.start_pos = start_pos;
        this.stroke_width = width * 0.01;
        this.pipe_height_fraction = 0;
        this.tank_p1.strokeWidth = this.stroke_width;
        this.tank_p2.strokeWidth = this.stroke_width;

        this.redraw(true);
    }

    /**
     * Redraw the water tank.
     * @param resizing Whether the water tank is being resized.
     */
    redraw(resizing=false) {
        this.create_tank_segments(resizing);
        this.create_water_fill();
        this.hints.redraw();
    }
}

// The main function that is called when the page is loaded.
window.onload = () => {
    let canvas = document.getElementById('myCanvas');
    paper.setup(canvas);

    let REAL_WORLD_WIDTH_SCALE = canvas.width/4;
    let REAL_WORLD_HEIGHT_SCALE = canvas.height/4;

    // Create sliders
    let forceSlider = initSlider("forceSlider", "Force applied (F):", "N", 1/20);
    let pipeHeightSlider = initSlider("pipeHeightSlider", "Pipe height (h2):", "m");
    let pipeEntryHeightSlider = initSlider("pipeEntryHeightSlider", "Pipe entry height (h3):", "");
    let pipeWidthSlider = initSlider("pipeWidthSlider", "Pipe width (d2):", "m");
    let tankWidthSlider = initSlider("tankWidthSlider", "Tank width (d1):", "m");

    // Create an empty project and a view for the canvas:
    let animating = false;
    let tank_width = canvas.width * 0.2;
    let tank_height = canvas.height * 0.4;
    let water_tank_pos = new paper.Point(canvas.width * 0.1, (canvas.height - tank_height)/2);
    let water_tank = new WaterTank(water_tank_pos, tank_width, tank_height);

    // Hints set real world scales
    water_tank.hints.set_real_world_scales(REAL_WORLD_WIDTH_SCALE, REAL_WORLD_HEIGHT_SCALE);

    // Create event for initial values
    water_tank.pipe.set_pipe_height(pipeHeightSlider.value * REAL_WORLD_HEIGHT_SCALE);
    water_tank.pipe.set_pipe_width(pipeWidthSlider.value * REAL_WORLD_WIDTH_SCALE);
    water_tank.set_pipe_entry_fraction(pipeEntryHeightSlider.value);
    water_tank.set_tank_width(tankWidthSlider.value * REAL_WORLD_WIDTH_SCALE);

    // Fix entry height slider
    setValue("pipeEntryHeightSlider", pipeEntryHeightSlider.value, "Pipe entry height (h3): ", "m", 1,
        ((water_tank.tank_height * pipeEntryHeightSlider.value + water_tank.pipe.pipe_width)
            / REAL_WORLD_WIDTH_SCALE).toFixed(2)
    );

    // Get the warning text html element
    let warning_text = document.getElementById("alertText");

    // Get static v text html element
    let static_v_text = document.getElementById("v0label");

    // Create a simple animation timer
    let animation_timer = null;

    window.onresize = () => {
        REAL_WORLD_WIDTH_SCALE = canvas.width/4;
        REAL_WORLD_HEIGHT_SCALE = canvas.height/4;

        // Hints set real world scales
        water_tank.hints.set_real_world_scales(REAL_WORLD_WIDTH_SCALE, REAL_WORLD_HEIGHT_SCALE);

        // Stop animation timer
        if (animation_timer != null) {
            window.clearInterval(animation_timer);
        }

        let tank_width = canvas.width * 0.3;
        let tank_height = canvas.height * 0.4;
        let water_tank_pos = new paper.Point(canvas.width * 0.1, (canvas.height - tank_height)/2);
        water_tank.resize(water_tank_pos, tank_width, tank_height);

        animating = false;
        water_tank.reset();

        warning_text.style.setProperty("visibility", "hidden");
        static_v_text.style.setProperty("visibility", "hidden");

        // Create event for initial values
        water_tank.pipe.set_pipe_height(pipeHeightSlider.value * REAL_WORLD_HEIGHT_SCALE);
        water_tank.pipe.set_pipe_width(pipeWidthSlider.value * REAL_WORLD_WIDTH_SCALE);
        water_tank.set_pipe_entry_fraction(pipeEntryHeightSlider.value);
        water_tank.set_tank_width(tankWidthSlider.value * REAL_WORLD_WIDTH_SCALE);
    }

    const simulateButton = document.getElementById('simulateButton');
    simulateButton.addEventListener('click', () => {
        if (animating) return;
        animating = true;

        // Store bernoulli variables
        let F = forceSlider.value * 20;
        let d_tank = water_tank.tank_width / REAL_WORLD_WIDTH_SCALE;
        let h_tank = water_tank.tank_height / REAL_WORLD_HEIGHT_SCALE;
        let d_tube = water_tank.pipe.pipe_width / REAL_WORLD_WIDTH_SCALE;
        let h_tube_in = (water_tank.tank_height * water_tank.pipe_height_fraction + water_tank.pipe.pipe_width)
            / REAL_WORLD_WIDTH_SCALE;
        let h_tube_out = water_tank.pipe.pipe_height / REAL_WORLD_HEIGHT_SCALE;
        let h_piston = 0;

        // Print all variables
        console.log("F: " + F);
        console.log("d_tank: " + d_tank);
        console.log("h_tank: " + h_tank);
        console.log("d_tube: " + d_tube);
        console.log("h_tube_in: " + h_tube_in);
        console.log("h_tube_out: " + h_tube_out);
        console.log("h_piston: " + h_piston);

        // Retrieve checkmark state
        let checkmark = document.getElementById("staticCheckbox");

        // Solve bernoulli
        let [snapshots, delta_t] = solve_bernoulli(F, d_tank, h_tank, d_tube, h_tube_in, h_tube_out, h_piston, checkmark.checked);

        // Check if static checkbox is not checked, if it is, set static v text to visible and set v0 to the first snapshot
        if (!checkmark.checked) {
            static_v_text.innerHTML = "v<sub>0</sub> : " + snapshots[0].water_spout_speed.toFixed(2) + " m/s";
            static_v_text.style.setProperty("visibility", "visible");
        }

        // If no snapshots were found, return
        if (snapshots.length === 0) {
            animating = false;
            water_tank.reset();

            warning_text.style.setProperty("visibility", "visible");
            return;
        }


        let snapshot_index = 0;
        // Set new timer every delta_t
        animation_timer = window.setInterval(() => {
            let snapshot = snapshots[snapshot_index];

            // Set new water level
            let reached_bottom = water_tank.set_water_height((snapshot.water_height - d_tube + h_tube_in) * REAL_WORLD_HEIGHT_SCALE);

            // Set spout speed
            water_tank.pipe.water_spout.set_velocity(snapshot.water_spout_speed);
            water_tank.hints.set_velocity(snapshot.water_spout_speed);

            // Increase snapshot index
            snapshot_index += 1;

            if (snapshot_index >= snapshots.length || reached_bottom) {
                water_tank.pipe.start_draining();

                window.clearInterval(animation_timer);
            }
        }, delta_t * 1000);
        }
    );

    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener('click', () => {
        animating = false;

        // Stop animation timer
        if (animation_timer != null) {
            window.clearInterval(animation_timer);
        }

        water_tank.reset();

        warning_text.style.setProperty("visibility", "hidden");
        static_v_text.style.setProperty("visibility", "hidden");
    });

    forceSlider.addEventListener("input", (event) => {
        if (animating) return;

        // Set value to slider
        setValue("forceSlider", event.target.value, "Force applied (F): ", "N", 1/20);
    });

    pipeHeightSlider.addEventListener("input", (event) => {
        if (animating) return;

        let pipe_height = parseFloat(event.target.value) * REAL_WORLD_HEIGHT_SCALE;

        // Check if pipe height is not smaller than entry height
        if (pipe_height < water_tank.pipe_height_fraction * water_tank.tank_height) {
            setValue("pipeHeightSlider", water_tank.pipe_height_fraction * water_tank.tank_height / REAL_WORLD_HEIGHT_SCALE, "Pipe height (h2): ", "m");
            return;
        }

        // Set value to slider
        setValue("pipeHeightSlider", event.target.value, "Pipe height (h2): ", "m");

        water_tank.pipe.set_pipe_height(pipe_height);
        water_tank.redraw();
    });

    tankWidthSlider.addEventListener("input", (event) => {
        if (animating) return;

        // Set value to slider
        setValue("tankWidthSlider", event.target.value, "Tank width (d1): ", "m");

        water_tank.set_tank_width(parseFloat(event.target.value) * REAL_WORLD_WIDTH_SCALE);
    });

    pipeEntryHeightSlider.addEventListener("input", (event) => {
        if (animating) return;

        let length_to_entry = water_tank.tank_height * parseFloat(event.target.value);



        // Check if entry height is not larger than pipe height
        if (length_to_entry > water_tank.pipe.pipe_height) {
            setValue("pipeEntryHeightSlider", water_tank.pipe.pipe_height / water_tank.tank_height, "Pipe entry height (h3): ", "m", 1,
                ((water_tank.tank_height * (water_tank.pipe.pipe_height / water_tank.tank_height) + water_tank.pipe.pipe_width)
                / REAL_WORLD_WIDTH_SCALE).toFixed(2));
            return;
        }

        // Set value to slider
        setValue("pipeEntryHeightSlider", event.target.value, "Pipe entry height (h3): ", "m", 1,
            ((water_tank.tank_height * event.target.value + water_tank.pipe.pipe_width)
                / REAL_WORLD_WIDTH_SCALE).toFixed(2)
            );

        water_tank.set_pipe_entry_fraction(parseFloat(event.target.value));
    });

    pipeWidthSlider.addEventListener("input", (event) => {
        if (animating) return;

        // Set value to slider
        setValue("pipeWidthSlider", event.target.value, "Pipe width (d2):", "m");

        water_tank.pipe.set_pipe_width(parseFloat(event.target.value) * REAL_WORLD_WIDTH_SCALE);
        water_tank.redraw();
    });

    paper.view.draw();
}
