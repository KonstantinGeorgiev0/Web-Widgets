import "../../assets/css/style.css";

import * as paper from 'paper';
import {initSlider, setValue} from "../../common/sliders";

/**
 * The Rope class.
 */
class Rope {
    SEGMENT_SIZE = 5;

    /**
     * Create a new Rope.
     * @param pulley1 Instance of the first pulley
     * @param init_pos_pulley1 Initial position of the first pulley
     * @param init_pos_pulley2 Initial position of the second pulley
     * @param rope_start_point Start point of the rope on the ceiling
     */
    constructor(pulley1, init_pos_pulley1, init_pos_pulley2, rope_start_point) {
        this.redraw(pulley1, init_pos_pulley1, init_pos_pulley2, rope_start_point);
    }

    /**
     * Create the rope path and the rope segments.
     * @param pulley1 Instance of the first pulley
     * @param init_pos_pulley1 Initial position of the first pulley
     * @param init_pos_pulley2 Initial position of the second pulley
     * @param rope_start_point Start point of the rope on the ceiling
     */
    redraw(pulley1, init_pos_pulley1, init_pos_pulley2, rope_start_point) {
        this.rope = new paper.Path({
            strokeColor: 'black',
            strokeWidth: pulley1.strokeWidth,
            strokeCap: 'round',
            dashArray: [this.SEGMENT_SIZE * 8, 10],
        });

        this.createRopeSegments(init_pos_pulley1, init_pos_pulley2, rope_start_point, 0);

        this.rope.onFrame = () => {
            let pulled_offset = -3 * (pulley1.position.y - init_pos_pulley1.y);

            this.createRopeSegments(pulley1.position, init_pos_pulley2, rope_start_point, pulled_offset);
        };
    }

    /**
     * Create the rope segments.
     * @param pos_pulley1 Position of the first pulley
     * @param pos_pulley2 Position of the second pulley
     * @param start_pos Start point of the rope on the ceiling
     * @param pulled_offset Offset of the rope due to the pulling of the rope
     */
    createRopeSegments(pos_pulley1, pos_pulley2, start_pos, pulled_offset) {
        this.rope.segments = [];
        let temp_p = start_pos;
        while (temp_p.y < pos_pulley1.y) {
            this.rope.add(temp_p);
            temp_p = temp_p.add(new paper.Point(0, this.SEGMENT_SIZE));
        }

        temp_p = temp_p.rotate(-this.SEGMENT_SIZE, pos_pulley1);
        while (temp_p.y > pos_pulley1.y) {
            this.rope.add(temp_p);
            temp_p = temp_p.rotate(-this.SEGMENT_SIZE, pos_pulley1);
        }

        while (temp_p.y > pos_pulley2.y) {
            this.rope.add(temp_p);
            temp_p = temp_p.add(new paper.Point(0, -this.SEGMENT_SIZE));
        }

        temp_p = temp_p.rotate(this.SEGMENT_SIZE, pos_pulley2);
        while (temp_p.y < pos_pulley2.y) {
            this.rope.add(temp_p);
            temp_p = temp_p.rotate(this.SEGMENT_SIZE, pos_pulley2);
        }

        while (temp_p.y < pos_pulley1.y + pulled_offset) {
            this.rope.add(temp_p);
            temp_p = temp_p.add(new paper.Point(0, this.SEGMENT_SIZE));
        }
    }

    /**
     * Resize the rope.
     * @param pulley1 Instance of the first pulley
     * @param init_pos_pulley1 Initial position of the first pulley
     * @param init_pos_pulley2 Initial position of the second pulley
     * @param rope_start_point Start point of the rope on the ceiling
     */
    resize(pulley1, init_pos_pulley1, init_pos_pulley2, rope_start_point) {
        this.rope.remove();
        this.redraw(pulley1, init_pos_pulley1, init_pos_pulley2, rope_start_point);
    }
}

/**
 * The Weight class.
 */
class Weight {
    /**
     * Create a new Weight.
     * @param pulley1 Instance of the first pulley
     * @param weightSlider Instance of the weight slider
     */
    constructor(pulley1, weightSlider) {
        this.weightSlider = weightSlider;
        this.redraw(pulley1, weightSlider);
    }

    /**
     * Redraw the weight.
     * @param pulley1 Instance of the first pulley
     * @param weightSlider Instance of the weight slider
     */
    redraw(pulley1, weightSlider) {
        this.ROPE_LENGTH = paper.view.size.height * 0.15;
        this.line = new paper.Path.Line({
            from: pulley1.position,
            to: pulley1.position.add(0, this.ROPE_LENGTH),
            strokeColor: 'grey',
            strokeWidth: pulley1.strokeWidth,
        })

        this.weight = new paper.Shape.Rectangle({
            point: pulley1.position.add(0, this.ROPE_LENGTH).add(-weightSlider.value/2, 0),
            size: (paper.view.size.width * 0.015) * (weightSlider.value/paper.view.size.width * 0.05),
            fillColor: 'grey',
        });

        this.arrow_text = new paper.PointText({
            content: 'M = ',
            fillColor: 'black',
            justification: 'center',
        });

        this.arrow_text.onFrame = () => {
            this.arrow_text.position = pulley1.position.add(0, this.ROPE_LENGTH).add(0, this.getWeightSize()/2 + paper.view.size.height/100);
            this.arrow_text.content = "M = " + weightSlider.value + " kg";
        }

        this.line.onFrame = () => {
            this.line.segments[0].point = pulley1.position;
            this.line.segments[1].point = pulley1.position.add(0, this.ROPE_LENGTH);
        }
        this.weight.onFrame = () => {
            this.weight.size = this.getWeightSize();
            this.weight.position = pulley1.position.add(0, this.ROPE_LENGTH);
        }
    }

    /**
     * Get the size of the weight.
     * @returns {number} The size of the weight
     */
    getWeightSize() {
        return (paper.view.size.width * 0.015) + (paper.view.size.width * this.weightSlider.value/5000);
    }

    /**
     * Resize the weight.
     * @param pulley1 Instance of the first pulley
     * @param weightSlider Instance of the weight slider
     */
    resize(pulley1, weightSlider) {
        this.line.remove();
        this.weight.remove();
        this.arrow_text.remove();

        this.redraw(pulley1, weightSlider);
    }
}

/**
 * The Hint class.
 */
class Hints {
    /**
     * Create a new Hints.
     * @param rope Instance of the rope
     * @param weight Instance of the weight
     */
    constructor(rope, weight) {
        this.redraw(rope, weight);
    }

    /**
     * Redraw the hints.
     * @param rope Instance of the rope
     * @param weight Instance of the weight
     */
    redraw(rope, weight) {
        this.min_length = paper.view.size.height * 0.01;
        this.hint_length = paper.view.size.width * 0.1;
        this.hint_line_rope = new paper.Path.Line({
            segments: [
                rope.rope.lastSegment.point.add([this.min_length, 0]),
                rope.rope.lastSegment.point.add([this.min_length + this.hint_length, 0]),
                rope.rope.lastSegment.point.add([this.min_length + this.hint_length, 0]),
                rope.rope.lastSegment.point.add([this.min_length, 0]),
            ],
            strokeColor: new paper.Color(76/255, 165/255, 255/255),
            strokeWidth: rope.rope.strokeWidth,
        });

        this.hint_line_rope.onFrame = () => {
            this.hint_line_rope.segments[3].point = rope.rope.lastSegment.point.add([this.min_length, 0]);
            this.hint_line_rope.segments[2].point = rope.rope.lastSegment.point.add([this.min_length + this.hint_length, 0]);
        }

        let y = weight.weight.position.y;
        this.hint_line_weight = new paper.Path.Line({
            segments: [
                new paper.Point([weight.getWeightSize() + this.min_length, y]),
                new paper.Point([weight.getWeightSize() + this.min_length + this.hint_length, y]),
                weight.weight.position.add([weight.getWeightSize() + this.min_length + this.hint_length, 0]),
                weight.weight.position.add([weight.getWeightSize() + this.min_length, 0])
            ],
            strokeColor: new paper.Color(76/255, 165/255, 255/255),
            strokeWidth: rope.rope.strokeWidth,
        });

        this.hint_line_weight.onFrame = () => {
            this.hint_line_weight.segments = [
                new paper.Point([weight.weight.position.x + weight.getWeightSize() + this.min_length, y]),
                new paper.Point([weight.weight.position.x + weight.getWeightSize() + this.min_length + this.hint_length, y]),
                weight.weight.position.add([weight.getWeightSize() + this.min_length + this.hint_length, 0]),
                weight.weight.position.add([weight.getWeightSize() + this.min_length, 0]),
            ];
        }

        this.weight_text = new paper.PointText(
            this.hint_line_weight.segments[1].point.add(
                this.hint_line_weight.segments[1].point
                    .subtract(this.hint_line_weight.segments[2].point)
                    .multiply(0.5)
            )
                .add(new paper.Point(5, 0))
        );
        this.weight_text.justification = 'center';
        this.weight_text.fillColor = new paper.Color('grey');
        this.weight_text.content = 'Δh';
        this.weight_text.fontSize = paper.view.size.width / 35;
        this.weight_text.visible = false;

        this.weight_text.onFrame = () => {
            this.weight_text.point = this.hint_line_weight.segments[2].point.add(
                this.hint_line_weight.segments[1].point
                    .subtract(this.hint_line_weight.segments[2].point)
                    .multiply(0.5)
            )
                .add(new paper.Point(-this.min_length * 4, paper.view.size.width / 70 - 5));
        }

        this.rope_text = new paper.PointText(
            this.hint_line_rope.segments[1].point.add(
                this.hint_line_rope.segments[1].point
                    .subtract(this.hint_line_rope.segments[2].point)
                    .multiply(0.5)
            )
                .add(new paper.Point(5, 0))
        );
        this.rope_text.justification = 'center';
        this.rope_text.fillColor = new paper.Color('grey');
        this.rope_text.content = '2Δh';
        this.rope_text.fontSize = paper.view.size.width / 35;
        this.rope_text.visible = false;

        this.rope_text.onFrame = () => {
            this.rope_text.point = this.hint_line_rope.segments[2].point.add(
                this.hint_line_rope.segments[1].point
                    .subtract(this.hint_line_rope.segments[2].point)
                    .multiply(0.5)
            )
                .add(new paper.Point(-this.min_length * 6, paper.view.size.width / 70));
        }
    }

    /**
     * Show the hints text.
     */
    show_text() {
        this.rope_text.visible = true;
        this.weight_text.visible = true;
    }

    /**
     * Hide the hints text.
     */
    hide_text() {
        this.rope_text.visible = false;
        this.weight_text.visible = false;
    }

    /**
     * Hide the hints entirely.
     */
    hide() {
        this.hide_text();
        this.hint_line_rope.visible = false;
        this.hint_line_weight.visible = false;
    }

    /**
     * Show the hints.
     */
    show() {
        this.hint_line_rope.visible = true;
        this.hint_line_weight.visible = true;
    }

    /**
     * Resize the hints. It removes the old hints and redraws them.
     * @param rope Instance of the rope
     * @param weight Instance of the weight
     */
    resize(rope, weight) {
        this.hint_line_rope.remove();
        this.hint_line_weight.remove();
        this.weight_text.remove();
        this.rope_text.remove();

        this.redraw(rope, weight);
    }
}

/**
 * Class representing the pulley.
 */
class Pulley {
    /**
     * Create a pulley.
     * @param width The canvas width
     * @param height The canvas height
     * @param weightSlider The weight slider
     */
    constructor(width, height, weightSlider) {
        this.width = width;
        this.height = height;
        this.weightSlider = weightSlider;
        this.v = 0;
        this.redraw();
    }

    /**
     * Reset the pulley to its initial position.
     */
    reset() {
        this.pulley1.onFrame = null;
        this.pulley1.position = this.init_pos_pulley1;
        this.v = 0;
        this.hints.hide();
    }

    /**
     * Simulate the physics of the pulley.
     * @param force The force applied to the rope
     * @param weight The weight of the weight
     * @param showAlertCallback Callback to show alert message
     */
    simulatePhysics(force, weight, showAlertCallback, showForcesAlertCallback){
        this.hints.show();
        this.pulley1.onFrame = (event) => {
            if (Math.abs(this.init_pos_pulley1.y - this.pulley1.position.y) >= this.pulley_max_movement) {
                this.hints.show_text();
                showForcesAlertCallback();
                return;
            }

            let acceleration = (force - (weight / 2)) / (weight / 2);

            if (acceleration === 0) {
                showAlertCallback();
            }

            this.v += acceleration;
            this.pulley1.position.y -= event.delta * this.v;
        };
    }

    /**
     * Redraw the pulley. It creates a new pulley and recomputes all shapes.
     */
    redraw() {
        this.pulley_radius = this.width * 0.05;
        this.pulley_max_movement = this.height * 0.15;

        this.roof = new paper.Path();
        this.roof.strokeColor = new paper.Color('black');
        this.roof.strokeWidth = this.pulley_radius * 0.1;

        this.roof.add(new paper.Point(0, 0));
        this.roof.add(new paper.Point(this.width, 0));

        this.roof_attachment_radius = this.pulley_radius * 0.05;
        this.roof_attachment_position = new paper.Point(this.width/3, this.roof_attachment_radius);
        this.roof_attachment = new paper.Path.Circle({
            center: this.roof_attachment_position,
            radius: this.roof_attachment_radius,
            strokeColor: 'black',
            fillColor: 'black',
        });

        this.init_pos_pulley1 = this.roof_attachment_position.add(new paper.Point(this.pulley_radius + this.roof_attachment_radius, this.height - this.height/2));
        this.init_pos_pulley2 = this.init_pos_pulley1.add(new paper.Point(2 * this.pulley_radius + 2 * this.roof_attachment_radius, - this.height/3));

        this.pulley1 = new paper.Path.Circle({
            center: this.init_pos_pulley1,
            radius: this.pulley_radius,
            strokeColor: 'red',
            strokeWidth: this.pulley_radius * 0.05,
        });

        this.pulley2 = new paper.Path.Circle({
            center: this.init_pos_pulley2,
            radius: this.pulley_radius,
            strokeColor: 'red',
            strokeWidth: this.pulley_radius * 0.05,
        });

        this.pulley2_rope = new paper.Path.Line({
            from: this.init_pos_pulley2,
            to: [this.init_pos_pulley2.x, 0],
            strokeColor: 'grey',
            strokeWidth: this.pulley_radius * 0.05,
        });

        this.pulley2_rope_circle = new paper.Path.Circle({
            center: this.init_pos_pulley2,
            radius: this.pulley_radius * 0.1,
            fillColor: 'grey',
        })

        let rope_start_point = new paper.Point(this.width/3, 0);
        if (this.rope == null) {
            this.rope = new Rope(this.pulley1, this.init_pos_pulley1, this.init_pos_pulley2, rope_start_point);
        }
        if (this.weight == null) {
            this.weight = new Weight(this.pulley1, this.weightSlider);
        }
        if (this.hints == null) {
            this.hints = new Hints(this.rope, this.weight);
            this.hints.hide();
        }
        if (this.arrow == null) {
            this.arrow = new ForceArrow("forceSlider", this.rope);
        }
    }

    /**
     * Resize the pulley.
     * @param width The canvas new width
     * @param height The canvas new height
     */
    resize(width, height) {
        this.roof.remove();
        this.roof_attachment.remove();
        this.pulley1.remove();
        this.pulley2.remove();
        this.pulley2_rope.remove();
        this.pulley2_rope_circle.remove();

        this.width = width;
        this.height = height;
        this.redraw();

        let rope_start_point = new paper.Point(this.width/3, 0);
        this.rope.resize(this.pulley1, this.init_pos_pulley1, this.init_pos_pulley2, rope_start_point);
        this.weight.resize(this.pulley1, this.weightSlider);
        this.hints.resize(this.rope, this.weight);
        this.arrow.resize("forceSlider", this.rope);
    }
}

/**
 * The ForceArrow class represents the force arrow that you see at the end of the rope.
 */
class ForceArrow {
    /**
     * Create a new ForceArrow.
     * @param forceSliderId The force slider id
     * @param rope The rope instance
     */
    constructor(forceSliderId, rope) {
        this.redraw(forceSliderId, rope);
    }

    /**
     * Resize the force arrow.
     * @param forceSliderId The force slider
     * @param rope The rope instance
     */
    resize(forceSliderId, rope) {
        this.arrow.remove();
        this.arrow_text.remove();
        this.redraw(forceSliderId, rope);
    }

    /**
     * Draw the force arrow.
     * @param forceSliderId The id of the force slider
     * @param rope The rope instance
     */
    redraw(forceSliderId, rope) {
        this.arrow = new paper.Path({
            fillColor: 'grey',
        });

        this.arrow_text = new paper.PointText({
            content: 'F = ',
            fillColor: 'black',
            justification: 'center',
        });

        this.arrow.strokeWidth = paper.view.size.width * 0.002;
        this.arrow.closed = true;
        this.rope = rope;
        this.forceSlider = document.getElementById(forceSliderId);
        this.setDimensions();
        this.drawArrow();

        this.arrow.onFrame = () => {
            this.setDimensions();
            this.drawArrow();
        }

        this.arrow_text.onFrame = () => {
            this.arrow_text.position = this.arrow.segments[4].point.add([0, paper.view.size.height/100]);
            this.arrow_text.content = "F = " + (this.forceSlider.value * 9.81).toFixed(2) + " N";
        }
    }

    /**
     * Recompute the dimensions of the force arrow.
     */
    setDimensions() {
        this.ropePos = this.rope.rope.lastSegment.point.add([0, 5]);
        let scale = 2000;
        this.arrowRectangleSize = new paper.Point([paper.view.size.width / scale * this.forceSlider.value * 0.25, paper.view.size.height / scale * this.forceSlider.value]);
        this.triangleBaseSize = paper.view.size.width / scale * this.forceSlider.value;
        this.triangleHeight = paper.view.size.height / scale * this.forceSlider.value;
    }

    /**
     * Create the segments of the force arrow.
     */
    drawArrow() {
        this.arrow.segments = [];

        this.arrow.add(this.ropePos);
        this.arrow.add(this.ropePos.add(new paper.Point([-this.arrowRectangleSize.x/2, 0])));
        this.arrow.add(this.ropePos.add(new paper.Point([-this.arrowRectangleSize.x/2, this.arrowRectangleSize.y])));
        this.arrow.add(this.ropePos.add(new paper.Point([-this.triangleBaseSize/2, this.arrowRectangleSize.y])));
        this.arrow.add(this.ropePos.add(new paper.Point([0, this.arrowRectangleSize.y + this.triangleHeight])));
        this.arrow.add(this.ropePos.add(new paper.Point([this.triangleBaseSize/2, this.arrowRectangleSize.y])));
        this.arrow.add(this.ropePos.add(new paper.Point([this.arrowRectangleSize.x/2, this.arrowRectangleSize.y])));
        this.arrow.add(this.ropePos.add(new paper.Point([this.arrowRectangleSize.x/2, 0])));
    }
}

window.onload = function() {
    // animating-flag
    let animating = false;

    // Init sliders
    let forceSlider = initSlider("forceSlider", "Force applied (F):", "N");
    setValue("forceSlider", forceSlider.value, `Force applied (F):`, "N", 1/9.81);
    let weightSlider = initSlider("massSlider", "Weight in pulley (M):", "kg");
    setValue("massSlider", weightSlider.value, `Weight on pulley (M):`, "kg");

    // Warning text
    let warning_text = document.getElementById("alertText");
    warning_text.style.setProperty("visibility", "hidden");

    // Alert text balance forces
    let alert_text_balance_forces = document.getElementById("alertText2");
    alert_text_balance_forces.style.setProperty("visibility", "hidden");

    // Create input listeners
    forceSlider.addEventListener('input', () => {
        if (animating) return;

        setValue("forceSlider", forceSlider.value, `Force applied (F):`, "N", 1/9.81);
    });

    weightSlider.addEventListener('input', () => {
        if (animating) return;

        setValue("massSlider", weightSlider.value, `Weight on pulley (M):`, "kg");
    });

    // Get a reference to the canvas object
    let canvas = document.getElementById('myCanvas');

    // Create an empty project and a view for the canvas:
    paper.setup(canvas);

    // Create a new pulley
    let pulley = new Pulley(canvas.width, canvas.height, weightSlider);

    // Resize the pulley when the window is resized
    window.onresize = () => {
        pulley.resize(canvas.width, canvas.height);
        pulley.reset();
        warning_text.style.setProperty("visibility", "hidden");
        alert_text_balance_forces.style.setProperty("visibility", "hidden");
    }

    // Init the simulation button
    const simulateButton = document.getElementById('simulateButton');
    // When the button is clicked, simulate the physics
    simulateButton.addEventListener('click', () => {
        // Set animating to true
        animating = true;

        let showAlertCallback = () => warning_text.style.setProperty("visibility", "visible");
        let showBalanceForcesCallback = () => alert_text_balance_forces.style.setProperty("visibility", "visible");

        pulley.simulatePhysics(forceSlider.value, weightSlider.value, showAlertCallback, showBalanceForcesCallback);
        }
    );

    // Init the reset button
    const resetButton = document.getElementById('resetButton');

    // When the button is clicked, reset the simulation
    resetButton.addEventListener('click', () => {
        // Set animating to false
        animating = false;

        pulley.reset();
        warning_text.style.setProperty("visibility", "hidden");
        alert_text_balance_forces.style.setProperty("visibility", "hidden");
    });

        // Draw the view now:
    paper.view.draw();
}
