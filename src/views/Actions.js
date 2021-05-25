/** @module views/Actions */
import eyeBlueIcon from "../assets/svg/eye_blue.js";
import downloadBlueIcon from "../assets/svg/download_blue.js";

/**
 * function Actions - build UI for the button to open the attached file of a bill
 * @function
 * @param {string} billUrl - Url of the bill image file
 * @return {string} the UI of the attached file opening button to be used in the bill's table
 */
export default (billUrl) => {
  return `<div class="icon-actions">
      <div id="eye" data-testid="icon-eye" data-bill-url=${billUrl}>
      ${eyeBlueIcon}
      </div>
    </div>`;
};
