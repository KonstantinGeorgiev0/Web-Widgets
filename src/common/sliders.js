/**
 * Initialize a slider with a label
 * @param id The id of the slider
 * @param prefix The prefix of the label (e.g. Force, ...)
 * @param unit The unit of the label (e.g. N, m, ...)
 * @param range_map_factor The factor to divide the range by (e.g. 1000 for mN).
 *                          It used for scaling to real world dimensions.
 * @param alternative_value The value to set the slider to change the visible value.
 * @returns {HTMLElement} The slider
 */
function initSlider(id, prefix, unit, range_map_factor=1, alternative_value) {
    const forceSlider = document.getElementById(id);
    const forceSliderLabel = document.getElementById(id + "Label");

    if (alternative_value) {
        forceSliderLabel.textContent = prefix + " " + (alternative_value/1).toFixed(2) + " " + unit;
    } else {
        forceSliderLabel.textContent = prefix + " " + (forceSlider.value / range_map_factor).toFixed(2) + " " + unit;
    }

    return forceSlider;
}


/**
 * Set the value of a slider and update the label
 * @param id The id of the slider
 * @param value The value of the slider
 * @param prefix The prefix of the label (e.g. Force, ...)
 * @param unit The unit of the label (e.g. N, m, ...)
 * @param range_map_factor The factor to divide the range by (e.g. 1000 for mN).
 *                         It used for scaling to real world dimensions.
 * @param alternative_value The value to set the slider to change the visible value.
 */
function setValue(id, value, prefix, unit, range_map_factor=1, alternative_value) {
    let slider = document.getElementById(id);
    slider.value = value;

    let sliderLabel = document.getElementById(id + "Label");
    if (alternative_value) {
        sliderLabel.textContent = prefix + " " + (alternative_value/1).toFixed(2) + " " + unit;
    } else {
        sliderLabel.textContent = prefix + " " + (value / range_map_factor).toFixed(2) + " " + unit;
    }
}

export {initSlider, setValue};
