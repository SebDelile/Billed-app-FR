/** @module views/LoadingPage */
import VerticalLayout from "./VerticalLayout.js";

/**
 * function Loadingpage - build UI of the Loading page
 * @function
 * @return {string} the UI of the loading page to be used in the html
 */
export default () => {
  return `
    <div class='layout'>
      ${VerticalLayout()}
      <div class='content' id='loading'>
        Loading...
      </div>
    </div>`;
};
