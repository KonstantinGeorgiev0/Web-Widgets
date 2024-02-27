// import * as paper from 'paper';

/**
 * Extends the paper.Shape object with an ArrowLine function.
 *
 * @param {number} sx - The x-coordinate of the start point of the arrow.
 * @param {number} sy - The y-coordinate of the start point of the arrow.
 * @param {number} ex - The x-coordinate of the end point of the arrow.
 * @param {number} ey - The y-coordinate of the end point of the arrow.
 * @param {boolean} isDouble - If true, creates a double-headed arrow. If false or omitted, creates a single-headed arrow.
 * @returns {object} A paper.widgets CompoundPath object representing the arrow line.
 */
import paper from "paper";

paper.Shape.ArrowLine = function (sx, sy, ex, ey, isDouble) {
    /**
     * Calculates the coordinates of the arrowhead based on the start and end points of the arrow line.
     *
     * @param {number} px0 - The x-coordinate of the start point of the arrow line.
     * @param {number} py0 - The y-coordinate of the start point of the arrow line.
     * @param {number} px - The x-coordinate of the end point of the arrow line.
     * @param {number} py - The y-coordinate of the end point of the arrow line.
     * @returns {Array} An array of four numbers representing the coordinates of the two points that form the arrowhead.
     */
    function calcArrow(px0, py0, px, py) {
        let points = [];
        let l = Math.sqrt(Math.pow((px - px0), 2) + Math.pow((py - py0), 2));
        points[0] = (px - ((px - px0) * Math.cos(0.5) - (py - py0) * Math.sin(0.5)) * 10 / l);
        points[1] = (py - ((py - py0) * Math.cos(0.5) + (px - px0) * Math.sin(0.5)) * 10 / l);
        points[2] = (px - ((px - px0) * Math.cos(0.5) + (py - py0) * Math.sin(0.5)) * 10 / l);
        points[3] = (py - ((py - py0) * Math.cos(0.5) - (px - px0) * Math.sin(0.5)) * 10 / l);
        return points;
    }

    // Calculate the points for the arrowhead at the end of the arrow line.
    let endPoints = calcArrow(sx, sy, ex, ey);
    let e0 = endPoints[0], e1 = endPoints[1], e2 = endPoints[2], e3 = endPoints[3];

    // Create a new Path object for the arrow line.
    let line = new paper.Path({
        segments: [new paper.Point(sx, sy), new paper.Point(ex, ey)],
        strokeWidth: 1
    });

    // Create a new Path object for the arrowhead at the end of the arrow line.
    let arrow1 = new paper.Path({
        segments: [new paper.Point(e0, e1), new paper.Point(ex, ey), new paper.Point(e2, e3)]
    });

    // Create a CompoundPath object to group the arrow line and arrowhead into a single path.
    let compoundPath = new paper.CompoundPath([line, arrow1]);

    // If isDouble is true, create an arrowhead at the start of the arrow line and add it to the CompoundPath.
    if (isDouble === true) {
        let startPoints = calcArrow(ex, ey, sx, sy);
        let s0 = startPoints[0], s1 = startPoints[1], s2 = startPoints[2], s3 = startPoints[3];

        let arrow2 = new paper.Path({
            segments: [new paper.Point(s0, s1), new paper.Point(sx, sy), new paper.Point(s2, s3)]
        });

        compoundPath.addChild(arrow2);
    }

    // Return the CompoundPath object representing the complete arrow line.
    return compoundPath;
};