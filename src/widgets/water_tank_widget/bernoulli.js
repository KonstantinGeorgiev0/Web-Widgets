function flow_condition(F, d1, h1, h2, g, rho) {
    return (4 * F / (Math.PI * d1**2 * rho) + g * (h1 - h2)) > 0;

}

function solve_bernoulli(F, d_tank, h_tank, d_tube, h_tube_in, h_tube_out, h_piston, checked=false) {
    const g = 9.81;
    const rho = 1000;
    const d1 = d_tank;
    const d2 = d_tube;
    let h1 = h_tank - h_piston - h_tube_in + d2;
    const h2 = h_tube_out - h_tube_in;

    // Print all variables
    console.log("d1: " + d1);
    console.log("d2: " + d2);
    console.log("h1: " + h1);
    console.log("h2: " + h2);

    let v2 = 0;
    if (!flow_condition(F, d1, h1, h2, g, rho)) {
        return [[], 0];
    } else {
        v2 = Math.sqrt(2 / (1 - (d2 / d1)**4) * (4 * F / (Math.PI * d1**2 * rho) + g * (h1 - h2)));
    }

    console.log("v2: " + v2);

    let v1 = v2 * (d2 / d1)**2;
    const t_stop_approx = 2 / (v1) * (4 * F / (g * Math.PI * d1**2 * rho) + h1 - h2);
    console.log("t_stop_approx: " + t_stop_approx);
    const Nsteps_approx = 5000;
    const Delta_t = t_stop_approx / Nsteps_approx;
    let snapshots = [];
    let t = 0;
    t = t + Delta_t;
    h1 = h1 - v1 * Delta_t;
    let steps = 0;
    while ((!checked && flow_condition(F, d1, h1, h2, g, rho)) || (checked && steps < Nsteps_approx)) {
        v2 = Math.sqrt(2 / (1 - (d2 / d1)**4) * (4 * F / (Math.PI * d1**2 * rho) + g * (h1 - h2)));
        v1 = v2 * (d2 / d1)**2;

        snapshots.push({
            water_height: h1,
            water_spout_speed: v2,
        });

        t = t + Delta_t;

        if (checked) {
            v1 = 0;
        }

        h1 = h1 - v1 * Delta_t;

        if (h1 < 0) {
            break;
        }

        steps++;
    }

    // Print time
    console.log("t: " + t);
    console.log("h1: " + h1);

    return [snapshots, Delta_t];
}

export default solve_bernoulli;
