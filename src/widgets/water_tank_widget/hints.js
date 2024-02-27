/**
 * @fileoverview Hints for the water tank widget.
 */

import paper from 'paper';

/**
 * @classdesc Hints for the water tank widget. It will show the variables on the widget (e.g. the height of the water).
 */
class Hints {

    constructor(water_tank) {
        this.water_tank = water_tank;

        // Create a paper.js path for all variables
        this.d_tank_path = new paper.Path({
            strokeColor: 'black',
            strokeWidth: 2,
        });

        this.h_tank_path = new paper.Path({
            strokeColor: 'black',
            strokeWidth: 2,
        });

        this.d_tube_path = new paper.Path({
            strokeColor: 'black',
            strokeWidth: 2,
        });

        this.h_tube_in_path = new paper.Path({
            strokeColor: 'black',
            strokeWidth: 2,
        });

        this.h_tube_out_path = new paper.Path({
            strokeColor: 'black',
            strokeWidth: 2,
        });

        this.h_piston_path = new paper.Path({
            strokeColor: 'black',
            strokeWidth: 2,
        });

        // Create text for all variables
        this.d_tank_text = new paper.PointText({
            content: 'd1 = ',
            fillColor: 'black',
            justification: 'center',
        });

        this.h_tank_text = new paper.PointText({
            content: 'h1 = ',
            fillColor: 'black',
            justification: 'center',
        });
        this.h_tank_text.rotate(-90);

        this.d_tube_text = new paper.PointText({
            content: 'd2 = ',
            fillColor: 'black',
            justification: 'center',
        });
        this.d_tube_text.rotate(-90);

        this.h_tube_in_text = new paper.PointText({
            content: 'h2 = ',
            fillColor: 'black',
            justification: 'center',
        });
        this.h_tube_in_text.rotate(-90);

        this.h_tube_out_text = new paper.PointText({
            content: 'h3 = ',
            fillColor: 'black',
            justification: 'center',
        });
        this.h_tube_out_text.rotate(-90);

        this.h_piston_text = new paper.PointText({
            content: 'h4 = ',
            fillColor: 'black',
            justification: 'center',
        });

        this.v = 0;
        this.v_text = new paper.PointText({
            content: 'v = ',
            fillColor: 'black',
            justification: 'center',
        });
    }

    /**
     * Redraw all hints. This function should be called when the widget is resized. It will automatically scale the hints.
     */
    redraw() {
        // Font size scale and stroke width scale
        const stroke_width_scale = paper.view.size.width/750;
        const font_size_scale = paper.view.size.width/90;

        // Set stroke widths for all paths and text
        this.d_tank_path.strokeWidth = stroke_width_scale;
        this.h_tank_path.strokeWidth = stroke_width_scale;
        this.d_tube_path.strokeWidth =  stroke_width_scale;
        this.h_tube_in_path.strokeWidth =  stroke_width_scale;
        this.h_tube_out_path.strokeWidth = stroke_width_scale;
        this.h_piston_path.strokeWidth = stroke_width_scale;
        this.d_tank_text.fontSize = font_size_scale;
        this.h_tank_text.fontSize = font_size_scale;
        this.d_tube_text.fontSize = font_size_scale;
        this.h_tube_in_text.fontSize = font_size_scale;
        this.h_tube_out_text.fontSize = font_size_scale;
        this.h_piston_text.fontSize = font_size_scale;
        this.v_text.fontSize = font_size_scale;

        // Set margin
        let width_margin = paper.view.size.width/30;
        let height_margin = paper.view.size.height/30;

        // Draw d_tank width hint
        // Bottom left corner of tank
        let bottom_left = this.water_tank.start_pos.add(new paper.Point(0, this.water_tank.tank_height));
        this.d_tank_path.removeSegments();
        this.d_tank_path.add(bottom_left.add(new paper.Point(0, height_margin)));
        this.d_tank_path.add(bottom_left.add(new paper.Point(0, height_margin + paper.view.size.width/50)));
        this.d_tank_path.add(bottom_left.add(new paper.Point(0,  (height_margin + paper.view.size.width/50/2))));
        this.d_tank_path.add(bottom_left.add(new paper.Point(this.water_tank.tank_width, (height_margin + paper.view.size.width/50/2))));
        this.d_tank_path.add(bottom_left.add(new paper.Point(this.water_tank.tank_width, height_margin + paper.view.size.width/50)));
        this.d_tank_path.add(bottom_left.add(new paper.Point(this.water_tank.tank_width, height_margin)));

        // Add text to hint
        this.d_tank_text.position = bottom_left.add(new paper.Point(this.water_tank.tank_width/2, 10 + paper.view.size.width/50/2));
        this.d_tank_text.content = 'd1 = ' + (this.water_tank.tank_width / this.REAL_WORLD_WIDTH_SCALE).toFixed(2) + ' m';


        // Draw h_tank height hint
        // Top left corner of tank
        let top_left = this.water_tank.start_pos;
        this.h_tank_path.removeSegments();
        this.h_tank_path.add(top_left.add(new paper.Point(-width_margin, 0)));
        this.h_tank_path.add(top_left.add(new paper.Point(-width_margin - paper.view.size.height/50, 0)));
        this.h_tank_path.add(top_left.add(new paper.Point(-width_margin - paper.view.size.height/50/2, 0)));
        this.h_tank_path.add(top_left.add(new paper.Point(-width_margin - paper.view.size.height/50/2, this.water_tank.tank_height)));
        this.h_tank_path.add(top_left.add(new paper.Point(-width_margin - paper.view.size.height/50, this.water_tank.tank_height)));
        this.h_tank_path.add(top_left.add(new paper.Point(-width_margin, this.water_tank.tank_height)));

        // Add text to hint
        this.h_tank_text.position = top_left.add(new paper.Point(-width_margin - width_margin/3, this.water_tank.tank_height/2));
        this.h_tank_text.content = 'h1 = ' + (this.water_tank.tank_height / this.REAL_WORLD_HEIGHT_SCALE).toFixed(2) + ' m';
        // Add extra margin to text
        this.h_tank_text.position = this.h_tank_text.position.add(new paper.Point(-width_margin/3, 0));


        // Draw d_tube hint
        // Top left corner of top of tube
        let top_left_tube = this.water_tank.pipe.pipe_p2.segments[1].point;
        this.d_tube_path.removeSegments();
        this.d_tube_path.add(top_left_tube.add(new paper.Point(-width_margin/3, 0)));
        this.d_tube_path.add(top_left_tube.add(new paper.Point(-width_margin/3 - paper.view.size.width/150, 0)));
        this.d_tube_path.add(top_left_tube.add(new paper.Point(-width_margin/3 - paper.view.size.width/150/2, 0)));
        let bottom_hint_middle = new paper.Point(top_left_tube.x + -width_margin/3 - paper.view.size.width/150/2, this.water_tank.pipe.pipe_p1.lastSegment.previous.point.y);
        this.d_tube_path.add(bottom_hint_middle);
        this.d_tube_path.add(bottom_hint_middle.add(new paper.Point(-paper.view.size.width/150/2, 0)));
        this.d_tube_path.add(bottom_hint_middle.add(new paper.Point(paper.view.size.width/150/2, 0)));

        // Add text to hint
        this.d_tube_text.position = top_left_tube.add(new paper.Point(-width_margin/1.2 - paper.view.size.width/150/2,
            (this.water_tank.pipe.pipe_p1.lastSegment.previous.point.y - top_left_tube.y)/2
            ));
        this.d_tube_text.content = 'd2 = ' + (this.water_tank.pipe.pipe_width / this.REAL_WORLD_WIDTH_SCALE).toFixed(2) + ' m';

        // Draw h_tube_out hint
        // Top left corner of top of tube
        let top_right_point_pipe = this.water_tank.pipe.pipe_p1.lastSegment.point.add([width_margin, 0]);
        this.h_tube_out_path.removeSegments();
        this.h_tube_out_path.add(top_right_point_pipe.add(new paper.Point(width_margin/3, 0)));
        this.h_tube_out_path.add(top_right_point_pipe.add(new paper.Point(width_margin/3 + paper.view.size.height/50, 0)));
        this.h_tube_out_path.add(top_right_point_pipe.add(new paper.Point(width_margin/3 + paper.view.size.height/50/2, 0)));
        let bottom_right_pipe_y = this.water_tank.pipe.pipe_height;
        this.h_tube_out_path.add(top_right_point_pipe.add(new paper.Point(width_margin/3 + paper.view.size.height/50/2, bottom_right_pipe_y)));
        this.h_tube_out_path.add(top_right_point_pipe.add(new paper.Point(width_margin/3 + paper.view.size.height/50, bottom_right_pipe_y)));
        this.h_tube_out_path.add(top_right_point_pipe.add(new paper.Point(width_margin/3, bottom_right_pipe_y)));

        // Add text to hint
        this.h_tube_out_text.position = top_right_point_pipe.add(new paper.Point(0.5*width_margin + width_margin/2,
            (bottom_right_pipe_y)/2));
        this.h_tube_out_text.content = 'h2 = ' + ((this.water_tank.pipe.pipe_height) / this.REAL_WORLD_HEIGHT_SCALE).toFixed(2) + ' m';

        // Draw h_tube_in hint
        // Top left of entry point tube
        let top_left_point_pipe = this.water_tank.pipe.pipe_p2.lastSegment.point;
        let x_offset = this.water_tank.pipe.pipe_p1.lastSegment.previous.previous.point.x + width_margin/3;
        let hint_placement = new paper.Point(x_offset, top_left_point_pipe.y);
        this.h_tube_in_path.removeSegments();
        this.h_tube_in_path.add(hint_placement.add(new paper.Point(width_margin/3, 0)));
        this.h_tube_in_path.add(hint_placement.add(new paper.Point(width_margin/3 + paper.view.size.height/50, 0)));
        this.h_tube_in_path.add(hint_placement.add(new paper.Point(width_margin/3 + paper.view.size.height/50/2, 0)));
        let bottom_floor_y = this.water_tank.pipe.pipe_p1.lastSegment.previous.previous.point.y;
        this.h_tube_in_path.add(new paper.Point(x_offset + width_margin/3 + paper.view.size.height/50/2, bottom_floor_y));
        this.h_tube_in_path.add(new paper.Point(x_offset + width_margin/3 + paper.view.size.height/50, bottom_floor_y));
        this.h_tube_in_path.add(new paper.Point(x_offset + width_margin/3, bottom_floor_y));

        // Add text to hint
        this.h_tube_in_text.position = new paper.Point(x_offset + width_margin,
            top_left_point_pipe.y + (bottom_floor_y - top_left_point_pipe.y)/2);
        this.h_tube_in_text.content = 'h3 = ' +
            ((this.water_tank.tank_height * this.water_tank.pipe_height_fraction + this.water_tank.pipe.pipe_width)
                / this.REAL_WORLD_WIDTH_SCALE).toFixed(2) + ' m';

        // Draw v hint
        // Add text to hint
        this.v_text.position = this.water_tank.pipe.pipe_p2.firstSegment.point.add([0, -height_margin/2]);
        this.v_text.content = 'v = ' + 0 + ' m/s';
        this.v_text.fontSize = 25;
        this.v_text.fontWeight = 'bold';
    }

    set_velocity(v) {
        this.v_text.content = 'v = ' + (v / 1).toFixed(2) + ' m/s';
    }

    set_real_world_scales(REAL_WORLD_WIDTH_SCALE, REAL_WORLD_HEIGHT_SCALE) {
        this.REAL_WORLD_WIDTH_SCALE = REAL_WORLD_WIDTH_SCALE;
        this.REAL_WORLD_HEIGHT_SCALE = REAL_WORLD_HEIGHT_SCALE;
    }
}

// export the class
export {Hints};
